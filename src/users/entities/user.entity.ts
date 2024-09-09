import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({ collection: 'users' })
export class User extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: String, required: true })
  account: string;

  @Prop({ type: String, required: true })
  platform: string;

  @Prop({ type: Date, default: Date.now })
  createdDate: Date;

  @Prop({ type: Date, default: Date.now })
  modifiedDate: Date;

  @Prop({ type: String })
  nickname: string;

  @Prop({ type: Boolean })
  pushNotification: boolean;

  @Prop({ type: Boolean })
  adNotification: boolean;

  @Prop({ type: String, options: ['탈퇴', '활동', '차단'] })
  status: string;

  @Prop({ type: String })
  photo: string;

  @Prop({ type: String, required: true })
  uid: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);
