import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'stores' })
export class Store extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: String })
  storeId: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: Number })
  latitude: number;

  @Prop({ type: Number })
  longitude: number;

  @Prop({ type: String })
  logo: string;

  @Prop({ type: String })
  info: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  siteUrl: string;

  @Prop({ type: [{ type: String }] })
  sizes: string[];

  @Prop({ type: [{ type: String }] })
  shapes: string[];

  @Prop({})
  popularity: number;
}
export const StoreSchema = SchemaFactory.createForClass(Store);
