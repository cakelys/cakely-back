import { SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  account: string;

  platform: string;

  createdDate: Date;

  modifiedDate: Date;

  nickname: string;

  pushNotification: string;

  adNotification: string;

  status: string; // '탈퇴' or '가입' or '차단'
}

export const UserSchema = SchemaFactory.createForClass(User);
