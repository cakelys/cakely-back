import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { StoreLike, StoreLikeSchema } from './entities/storeLike.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CakeLike, CakeLikeSchema } from './entities/cakeLike.entity';
import { Cake, CakeSchema } from '../cakes/entities/cake.entity';
import { LikesRepository } from './likes.repository';
import { Store, StoreSchema } from 'src/stores/entities/store.entity';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreLike.name, schema: StoreLikeSchema },
      { name: CakeLike.name, schema: CakeLikeSchema },
      { name: Cake.name, schema: CakeSchema },
      { name: Store.name, schema: StoreSchema },
    ]),
  ],
  controllers: [LikesController],
  providers: [LikesService, LikesRepository, S3Service],
})
export class LikesModule {}
