import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { CityGateway } from './city.gateway';
import { City, ForecastType } from './city.model';
import { CitiesService } from './city.service';

@Controller('cities')
export class CitiesController {
  constructor(
    private readonly citiesService: CitiesService,
    private cityGateway: CityGateway
  ) {}

  @Get('')
  async getAllCities() {
    const cities = await this.citiesService.getCities();
    return cities;
  }

  @Get('/getCityWithLatestForecast')
  async getCityWithLatestForecast() {
    let city = await this.citiesService.getCityWithLatestForecast();
    return city;
  }

  @Get('/locked')
  async getLockedCities() {
    let cities = await this.citiesService.getLockedCities();
    return cities;
  }

  @Get(':id')
  async getCity(@Param('id') cityId: string) {
    let city = await this.citiesService.getSingleCity(cityId);
    return city;
  }

  @ApiBody({ type: City })
  @Post()
  async addCity(
    @Body('name') cityName: string,
    @Body('timezone') cityTimezone: string,
    @Body('forecasts')
    cityForecasts: Array<{
      forecast: ForecastType;
      from: Date;
      to: Date;
    }>,
    @Body('locked') cityLocked: boolean
  ) {
    const generatedId = await this.citiesService.insertCity(
      cityName,
      cityTimezone,
      cityForecasts,
      cityLocked
    );
    return { id: generatedId };
  }

  @ApiBody({ type: City })
  @Post('/addForecast/:id')
  async addForecast(
    @Param('id') cityId: string,
    @Body('forecasts')
    cityForecasts: {
      forecast: ForecastType;
      from: Date;
      to: Date;
    }
  ) {
    const generatedId = await this.citiesService.addForecastToCity(
      cityId,
      cityForecasts
    );
    return { id: generatedId };
  }

  @Delete('/deleteLatestForecast/:id')
  async deleteLatestForecast(@Param('id') cityId: string) {
    await this.citiesService.deleteForecast(cityId);
    return null;
  }

  @ApiBody({ type: City })
  @Patch(':id')
  async updateCity(
    @Param('id') cityId: string,
    @Body('name') cityName: string,
    @Body('timezone') cityTimezone: string,
    @Body('forecasts')
    cityForecasts: Array<{
      forecast: ForecastType;
      from: Date;
      to: Date;
    }>
  ) {
    await this.citiesService.updateCity(
      cityId,
      cityName,
      cityTimezone,
      cityForecasts
    );
    let updatedCity = await this.citiesService.getSingleCity(cityId);
    this.cityGateway.sendEvent(
      cityId,
      'update',
      'city has been updated',
      updatedCity
    );
    return null;
  }

  @ApiBody({ type: City })
  @Patch('/lock/:id')
  async lockCity(@Param('id') cityId: string) {
    await this.citiesService.lockCity(cityId);
    return null;
  }

  @ApiBody({ type: City })
  @Patch('/unlock/:id')
  async unlockCity(@Param('id') cityId: string) {
    await this.citiesService.unlockCity(cityId);
    return null;
  }

  @Delete(':id')
  async removeCity(@Param('id') cityId: string) {
    await this.citiesService.deleteCity(cityId);
    return null;
  }
}
