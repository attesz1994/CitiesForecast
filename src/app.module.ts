import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesModule } from './cities/city.module';

@Module({
  imports: [
    CitiesModule,
    MongooseModule.forRoot(
      'mongodb+srv://Attila:rammstein@cluster0.y5p0a.mongodb.net/database?retryWrites=true&w=majority'
    )
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
