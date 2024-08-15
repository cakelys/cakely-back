import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from './entities/store.entity';
import { StoresRepository } from './stores.repository';
import { Cake, CakeSchema } from 'src/cakes/entities/cake.entity';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Cake.name, schema: CakeSchema },
    ]),
  ],
  controllers: [StoresController],
  providers: [StoresService, StoresRepository, S3Service],
})
export class StoresModule {}
