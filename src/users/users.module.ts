import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from './entities/user.entity';
import { FirebaseService } from 'src/auth/firebase.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, FirebaseService, S3Service],
})
export class UsersModule {}
