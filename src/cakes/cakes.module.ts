import { Module } from '@nestjs/common';
import { CakesService } from './cakes.service';
import { CakesController } from './cakes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cake, CakeSchema } from './entities/cake.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cake.name, schema: CakeSchema }]),
  ],
  controllers: [CakesController],
  providers: [CakesService],
})
export class CakesModule {}
