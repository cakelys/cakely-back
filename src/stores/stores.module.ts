import { forwardRef, Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from './entities/store.entity';
import { StoresRepository } from './stores.repository';
import { Cake, CakeSchema } from 'src/cakes/entities/cake.entity';
import { AuthModule } from 'src/auth/auth.module';
import { S3Module } from 'src/s3/s3.module';
import { CakesModule } from 'src/cakes/cakes.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Cake.name, schema: CakeSchema },
    ]),
    AuthModule,
    S3Module,
    forwardRef(() => CakesModule),
  ],
  controllers: [StoresController],
  providers: [StoresService, StoresRepository],
  exports: [StoresRepository],
})
export class StoresModule {}
