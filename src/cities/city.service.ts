import {
  Inject,
  Injectable,
  NotFoundException,
  CACHE_MANAGER
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City, ForecastType } from './city.model';

const key_allCities = 'allCities';
const key_cityWithLatestForecast = 'cityWithLatestForecast';
const key_cityById = 'cityById';
const key_lockedCities = 'lockedCities';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel('City') private readonly cityModel: Model<City>,
    @Inject(CACHE_MANAGER) protected readonly cacheManager
  ) {}

  async getCities() {
    const value = await this.cacheManager.get('allCities');
    if (value) {
      return value;
    }
    const cities = await this.cityModel.find().exec();
    const reducedCities = cities.map((city) => ({
      id: city.id,
      name: city.name,
      timezone: city.timezone,
      forecasts: city.forecasts.reduce((a, b) => (a.to > b.to ? a : b)),
      locked: city.locked
    }));
    await this.cacheManager.set(key_allCities, reducedCities, { ttl: 120 });
    return reducedCities;
  }

  async getCityWithLatestForecast() {
    const value = await this.cacheManager.get('cityWithLatestForecast');
    if (value) {
      return value;
    }

    const cities = await this.cityModel.find().exec();

    const city = cities
      .map((city) => ({
        id: city.id,
        name: city.name,
        forecasts: city.forecasts.reduce((a, b) => (a.to > b.to ? a : b))
      }))
      .reduce((a, b) => (a.forecasts.to > b.forecasts.to ? a : b));
    await this.cacheManager.set(key_cityWithLatestForecast, city, {
      ttl: 120
    });

    return city;
  }

  async getLockedCities() {
    const value = await this.cacheManager.get('lockedCities');
    if (value) {
      return value;
    }

    const cities = await this.cityModel.find().exec();
    cities.map((city) => ({
      id: city.id,
      name: city.name,
      timezone: city.timezone,
      forecasts: city.forecasts,
      locked: city.locked
    }));
    const lockedCities = cities
      .filter((city) => city.locked)
      .map((city) => ({
        id: city.id,
        name: city.name
      }));
    await this.cacheManager.set(key_lockedCities, lockedCities, { ttl: 120 });
    return lockedCities;
  }

  async getSingleCity(cityId: string) {
    const value = await this.cacheManager.get('cityById');

    if (value == cityId) {
      return value;
    }
    const city = await this.findCity(cityId);
    await this.cacheManager.set(key_cityById, city, { ttl: 120 });
    return {
      name: city.name,
      timezone: city.timezone,
      forecasts: city.forecasts,
      locked: city.locked
    };
  }

  async insertCity(
    name: string,
    timezone: string,
    forecasts: Array<{
      forecast: ForecastType;
      from: Date;
      to: Date;
    }>,
    locked: boolean
  ) {
    const newCity = new this.cityModel({
      name,
      timezone,
      forecasts,
      locked
    });
    const result = await newCity.save();
    await this.cacheManager.del(
      key_allCities,
      key_cityWithLatestForecast,
      key_cityById
    );
    return result.id as string;
  }

  async addForecastToCity(
    cityId: string,
    forecasts: {
      forecast: ForecastType;
      from: Date;
      to: Date;
    }
  ) {
    const city = await this.findCity(cityId);
    city.forecasts.push(forecasts);
    const result = await city.save();
    await this.cacheManager.del(
      key_allCities,
      key_cityWithLatestForecast,
      key_cityById,
      key_lockedCities
    );
    return result.id as string;
  }

  async updateCity(
    cityId: string,
    name: string,
    timezone: string,
    forecasts: Array<{
      forecast: ForecastType;
      from: Date;
      to: Date;
    }>
  ) {
    const updatedCity = await this.findCity(cityId);
    if (!updatedCity.locked) {
      if (name != undefined) {
        updatedCity.name = name;
      }
      if (timezone != undefined) {
        updatedCity.timezone = timezone;
      }
      if (forecasts != undefined) {
        updatedCity.forecasts = forecasts;
      }
    }
    await updatedCity.save();
    await this.cacheManager.del(
      key_allCities,
      key_cityWithLatestForecast,
      key_cityById,
      key_lockedCities
    );

    return {
      name: name,
      timezone: timezone,
      forecasts: forecasts
    };
  }

  async lockCity(cityId: string) {
    const updatedCity = await this.findCity(cityId);
    updatedCity.locked = true;
    await updatedCity.save();
    this.cacheManager.del(
      key_allCities,
      key_cityWithLatestForecast,
      key_cityById,
      key_lockedCities
    );

    return updatedCity.id;
  }

  async unlockCity(cityId: string) {
    const updatedCity = await this.findCity(cityId);
    updatedCity.locked = false;
    await updatedCity.save();
    await this.cacheManager.del(
      key_allCities,
      key_cityWithLatestForecast,
      key_cityById,
      key_lockedCities
    );

    return updatedCity.id;
  }

  async deleteCity(cityId: string) {
    const cityToDelete = await this.findCity(cityId);

    if (!cityToDelete.locked) {
      const result = await this.cityModel.deleteOne({ _id: cityId }).exec();
      if (result.n === 0) {
        throw new NotFoundException('Could not find city.');
      }
    }
    await this.cacheManager.del(
      key_allCities,
      key_cityWithLatestForecast,
      key_cityById,
      key_lockedCities
    );
  }

  async deleteForecast(cityId: string) {
    const city = await this.findCity(cityId);
    if (!city.locked) {
      const max = city.forecasts.reduce((a, b) => (a.to > b.to ? a : b));
      const index = city.forecasts.indexOf(max);
      city.forecasts.splice(index, 1);
    }
    await city.save();
    await this.cacheManager.del(
      key_allCities,
      key_cityWithLatestForecast,
      key_cityById,
      key_lockedCities
    );
    return city;
  }

  async findCity(id: string): Promise<City> {
    let city;
    try {
      city = await this.cityModel.findById(id).exec();
    } catch (error) {
      throw new NotFoundException('Could not find anyad.');
    }
    if (!city) {
      throw new NotFoundException('Could not find anyad.');
    }
    return city;
  }
}
