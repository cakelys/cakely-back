import { forwardRef, Module } from '@nestjs/common';
import { CakesService } from './cakes.service';
import { CakesController } from './cakes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cake, CakeSchema } from './entities/cake.entity';
import { CakesRepository } from './cakes.repository';
import { AuthModule } from 'src/auth/auth.module';
import { S3Module } from 'src/s3/s3.module';
import { StoresModule } from 'src/stores/stores.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cake.name, schema: CakeSchema }]),
    AuthModule,
    S3Module,
    forwardRef(() => StoresModule),
  ],
  controllers: [CakesController],
  providers: [CakesService, CakesRepository],
  exports: [CakesRepository],
})
export class CakesModule {}
