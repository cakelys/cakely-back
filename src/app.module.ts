import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CakesModule } from './cakes/cakes.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { StoresModule } from './stores/stores.module';
import { LikesModule } from './likes/likes.module';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
import { S3Module } from './s3/s3.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CakesModule,
    StoresModule,
    LikesModule,
    ConfigModule.forRoot({
      envFilePath: [`.env`],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DBNAME,
    }),
    S3Module,
    UsersModule,
    // AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
