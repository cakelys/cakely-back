import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'storeLikes' })
export class StoreLike extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  storeId: string;

  @Prop({ type: Date })
  createdDate: Date;
}
export const StoreLikeSchema = SchemaFactory.createForClass(StoreLike);
