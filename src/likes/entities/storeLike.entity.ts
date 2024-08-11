import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({ timestamps: false, collection: 'storeLikes' })
export class StoreLike extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: ObjectId })
  userId: ObjectId;

  @Prop({ type: ObjectId })
  storeId: ObjectId;

  @Prop({ type: Date })
  createdDate: Date;
}
export const StoreLikeSchema = SchemaFactory.createForClass(StoreLike);
