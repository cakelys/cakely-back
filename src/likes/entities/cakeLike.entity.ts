import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({ timestamps: false, collection: 'cakeLikes' })
export class CakeLike extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: ObjectId })
  userId: ObjectId;

  @Prop({ type: ObjectId })
  cakeId: ObjectId;

  @Prop({ type: Date })
  createdDate: Date;
}
export const CakeLikeSchema = SchemaFactory.createForClass(CakeLike);
