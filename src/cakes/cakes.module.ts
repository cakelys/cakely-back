import { Module } from '@nestjs/common';
import { CakesService } from './cakes.service';
import { CakesController } from './cakes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cake, CakeSchema } from './entities/cake.entity';
import { CakesRepository } from './cakes.repository';
import { S3Service } from 'src/s3/s3.service';
import { Store, StoreSchema } from 'src/stores/entities/store.entity';
import { CakeLike, CakeLikeSchema } from 'src/likes/entities/cakeLike.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cake.name, schema: CakeSchema },
      { name: Store.name, schema: StoreSchema },
      { name: CakeLike.name, schema: CakeLikeSchema },
    ]),
  ],
  controllers: [CakesController],
  providers: [CakesService, CakesRepository, S3Service],
})
export class CakesModule {}
