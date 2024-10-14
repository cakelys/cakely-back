import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { HttpModule } from '@nestjs/axios';
import { S3Service } from 'src/s3/s3.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchLog, SearchLogSchema } from './entities/searchLog.entity';
import { FirebaseService } from 'src/auth/firebase.service';
import { User, UsersSchema } from 'src/users/entities/user.entity';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: SearchLog.name, schema: SearchLogSchema },
      { name: User.name, schema: UsersSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService, S3Service, FirebaseService],
})
export class SearchModule {}
