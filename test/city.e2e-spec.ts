import { HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CreateCityDTO } from './city.dto';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { ForecastType } from './city.dto';
import { app, database } from './constants';

beforeAll(async () => {
  await mongoose.connect(database);
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

let cityId: string;

describe('CITY', () => {
  const city: CreateCityDTO = {
    name: 'Varad',
    timezone: 'CET',
    forecasts: [
      {
        forecast: ForecastType.Cloudy,
        from: new Date('2020-11-24T13:43:19.496Z'),
        to: new Date('2020-11-24T13:43:19.496Z')
      }
    ],
    locked: false
  };

  it('should list all cities', () => {
    return request(app)
      .get('/cities')
      .expect(200);
  });

  it('should insert city', () => {
    return request(app)
      .post('/cities')
      .set('Accept', 'application/json')
      .send(city)
      .expect(({ body }) => {
        expect(body.id).toBeDefined();
        cityId = body.id;
      })
      .expect(HttpStatus.CREATED);
  });

  it('should list city by id', () => {
    return request(app)
      .get(`/cities/${cityId}`)
      .expect(({ body }) => {
        expect(body.name).toEqual(city.name);
        expect(body.timezone).toEqual(city.timezone);
        // expect(body.forecasts).toEqual(city.forecasts);
      })
      .expect(200);
  });

  it('should update city', () => {
    return request(app)
      .patch(`/cities/${cityId}`)
      .set('Accept', 'application/json')
      .send({
        name: 'updatedName'
      })
      .expect(({ body }) => {
        expect(body.name).not.toEqual(city.name);
      });
  });

  it('should delete city', async () => {
    await axios.delete(`${app}/cities/${cityId}`, {});

    return request(app)
      .get(`/cities/${cityId}`)
      .expect(404);
  });
});
