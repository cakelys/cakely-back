import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'cakes' })
export class Cake extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: String })
  storeId: string;

  @Prop({ type: [{ type: String }] })
  tags: string[];

  @Prop({ type: [{ type: String }] })
  categories: string[];

  @Prop({})
  popularity: number;

  @Prop({})
  createdDate: Date;
}
export const CakeSchema = SchemaFactory.createForClass(Cake);
