import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { StoreLike, StoreLikeSchema } from './entities/storeLike.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CakeLike, CakeLikeSchema } from './entities/cakeLike.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreLike.name, schema: StoreLikeSchema },
      { name: CakeLike.name, schema: CakeLikeSchema },
    ]),
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
