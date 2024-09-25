import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { HttpModule } from '@nestjs/axios';
import { S3Service } from 'src/s3/s3.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchLog, SearchLogSchema } from './entities/searchLog.entity';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: SearchLog.name, schema: SearchLogSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService, S3Service],
})
export class SearchModule {}
