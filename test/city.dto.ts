export interface CreateCityDTO {
  name: string;
  timezone: string;
  forecasts: {
    forecast: ForecastType;
    from: Date;
    to: Date;
  }[];
  locked: boolean;
}

export enum ForecastType {
  Sunny = <any>'Sunny',
  Stormy = <any>'Stormy',
  Cloudy = <any>'Cloudy'
}
