import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Module({
  controllers: [],
  providers: [S3Service],
  exports: [S3Service], // 다른 모듈에서 S3Service를 사용할 수 있도록 export
})
export class S3Module {}
