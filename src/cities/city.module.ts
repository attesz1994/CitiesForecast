import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { CitiesController } from './city.controller';
import { CitiesService } from './city.service';
import { CitySchema } from './city.model';
import { CityGateway } from './city.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'City', schema: CitySchema }]),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379
    })
  ],
  controllers: [CitiesController],
  providers: [CitiesService, CityGateway]
})
export class CitiesModule {}
