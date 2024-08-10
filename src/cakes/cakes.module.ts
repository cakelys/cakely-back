import { Module } from '@nestjs/common';
import { CakesService } from './cakes.service';
import { CakesController } from './cakes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cake, CakeSchema } from './entities/cake.entity';
import { CakesRepository } from './cakes.repository';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cake.name, schema: CakeSchema }]),
  ],
  controllers: [CakesController],
  providers: [CakesService, CakesRepository, S3Service],
})
export class CakesModule {}
