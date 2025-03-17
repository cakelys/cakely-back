import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Location extends Document {
  @Prop({ type: String, enum: ['Point'], required: true })
  type: string;

  @Prop({ type: [Number], required: true, index: '2dsphere' })
  coordinates: number[];
}

export const LocationSchema = SchemaFactory.createForClass(Location);
