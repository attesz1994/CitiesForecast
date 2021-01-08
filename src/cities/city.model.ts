import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

const Forecast = ['Sunny', 'Stormy', 'Cloudy'];

export const CitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  timezone: { type: String, required: true },
  forecasts: {
    type: [
      {
        forecast: {
          type: [String],
          enum: Forecast
        },
        from: {
          type: Date,
          required: true
        },
        to: {
          type: Date,
          required: true,
          validate: [dateValidator, 'Start Date must be less than End Date']
        }
      }
    ],
    required: true
  },
  locked: { type: Boolean }
});

function dateValidator(value) {
  return this.from <= value;
}

export enum ForecastType {
  Sunny = <any>'Sunny',
  Stormy = <any>'Stormy',
  Cloudy = <any>'Cloudy'
}

class Forecasts {
  @ApiProperty({ enum: ['Sunny', 'Stormy', 'Cloudy'], description: 'forecast' })
  forecast: ForecastType;

  @ApiProperty({ type: Date, description: 'from' })
  from: Date;

  @ApiProperty({ type: Date, description: 'to' })
  to: Date;
}

export class City extends mongoose.Document {
  @ApiProperty({ type: String, description: 'id' })
  id: string;
  @ApiProperty({ type: String, description: 'name' })
  name: string;
  @ApiProperty({ type: String, description: 'timezone' })
  timezone: string;
  @ApiProperty({
    type: [Forecasts],
    description: 'forecasts'
  })
  forecasts: Forecasts[];
  @ApiProperty({ type: Boolean, description: 'locked' })
  locked: Boolean;
}
