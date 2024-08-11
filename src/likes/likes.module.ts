import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { StoreLike, StoreLikeSchema } from './entities/storeLike.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CakeLike, CakeLikeSchema } from './entities/cakeLike.entity';
import { Cake, CakeSchema } from '../cakes/entities/cake.entity';
import { LikesRepository } from './likes.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreLike.name, schema: StoreLikeSchema },
      { name: CakeLike.name, schema: CakeLikeSchema },
      { name: Cake.name, schema: CakeSchema },
    ]),
  ],
  controllers: [LikesController],
  providers: [LikesService, LikesRepository],
})
export class LikesModule {}
