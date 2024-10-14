import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from './entities/store.entity';
import { StoresRepository } from './stores.repository';
import { Cake, CakeSchema } from 'src/cakes/entities/cake.entity';
import { S3Service } from 'src/s3/s3.service';
import { CakeLike, CakeLikeSchema } from 'src/likes/entities/cakeLike.entity';
import {
  StoreLike,
  StoreLikeSchema,
} from 'src/likes/entities/storeLike.entity';
import {
  PendingS3Deletion,
  PendingS3DeletionSchema,
} from 'src/s3/entities/pendingS3Deletion.entity';
import { User, UsersSchema } from 'src/users/entities/user.entity';
import { FirebaseService } from 'src/auth/firebase.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Cake.name, schema: CakeSchema },
      { name: CakeLike.name, schema: CakeLikeSchema },
      { name: StoreLike.name, schema: StoreLikeSchema },
      { name: PendingS3Deletion.name, schema: PendingS3DeletionSchema },
      { name: User.name, schema: UsersSchema },
    ]),
  ],
  controllers: [StoresController],
  providers: [StoresService, StoresRepository, S3Service, FirebaseService],
})
export class StoresModule {}
