import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'createdDate', updatedAt: '' },
  collection: 'searchLogs',
})
export class SearchLog extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: ObjectId })
  userId: ObjectId;

  @Prop({ type: String })
  keyword: string;

  @Prop({ type: Date })
  createdDate: Date;
}

export const SearchLogSchema = SchemaFactory.createForClass(SearchLog);
