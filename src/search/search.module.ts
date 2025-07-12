import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchLog, SearchLogSchema } from './entities/searchLog.entity';
import { AuthModule } from 'src/auth/auth.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: SearchLog.name, schema: SearchLogSchema },
    ]),
    AuthModule,
    S3Module,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
