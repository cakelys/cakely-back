import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { HttpModule } from '@nestjs/axios';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [HttpModule],
  controllers: [SearchController],
  providers: [SearchService, S3Service],
})
export class SearchModule {}
