import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'createdDate', updatedAt: '' },
  collection: 'cakes',
})
export class Cake extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: ObjectId })
  storeId: ObjectId;

  @Prop({ type: [{ type: String }] })
  tags: string[];

  @Prop({ type: [{ type: String }] })
  categories: string[];

  @Prop({})
  popularity: number;

  @Prop({})
  createdDate: Date;

  @Prop({ required: true })
  faissId: number;

  @Prop({ required: true })
  photos: string[];
}
export const CakeSchema = SchemaFactory.createForClass(Cake);
