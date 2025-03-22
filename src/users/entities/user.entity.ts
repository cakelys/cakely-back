import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { Location, LocationSchema } from 'src/common/location.entity';

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' },
})
export class User extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: String, required: true })
  account: string;

  @Prop({ type: String, required: true })
  platform: string;

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

  @Prop({ type: Date })
  deletedDate: Date;

  @Prop({ type: Date, default: Date.now })
  lastLoginDate: Date;

  @Prop({ type: LocationSchema, default: {} })
  location: Location;

  @Prop({ type: String, default: '' })
  address: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);
