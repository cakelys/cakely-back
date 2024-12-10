import { Module } from '@nestjs/common';
import { CakesService } from './cakes.service';
import { CakesController } from './cakes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cake, CakeSchema } from './entities/cake.entity';
import { CakesRepository } from './cakes.repository';
import { S3Service } from 'src/s3/s3.service';
import { Store, StoreSchema } from 'src/stores/entities/store.entity';
import { CakeLike, CakeLikeSchema } from 'src/likes/entities/cakeLike.entity';
import {
  PendingS3Deletion,
  PendingS3DeletionSchema,
} from 'src/s3/entities/pendingS3Deletion.entity';
import { FirebaseService } from 'src/auth/firebase.service';
import { User, UsersSchema } from 'src/users/entities/user.entity';
import { StoresRepository } from 'src/stores/stores.repository';
import {
  StoreLike,
  StoreLikeSchema,
} from 'src/likes/entities/storeLike.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cake.name, schema: CakeSchema },
      { name: Store.name, schema: StoreSchema },
      { name: CakeLike.name, schema: CakeLikeSchema },
      { name: StoreLike.name, schema: StoreLikeSchema },
      { name: PendingS3Deletion.name, schema: PendingS3DeletionSchema },
      { name: User.name, schema: UsersSchema },
    ]),
  ],
  controllers: [CakesController],
  providers: [
    CakesService,
    CakesRepository,
    S3Service,
    FirebaseService,
    StoresRepository,
  ],
})
export class CakesModule {}
