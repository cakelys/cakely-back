import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({ timestamps: false, collection: 'pendingS3Deletions' })
export class PendingS3Deletion extends Document {
  @Prop({ type: ObjectId })
  id: string;

  @Prop({ type: String })
  s3Key: string;

  @Prop({ type: Date })
  createdDate: Date;
}
export const PendingS3DeletionSchema =
  SchemaFactory.createForClass(PendingS3Deletion);
