import { ObjectId } from 'mongodb';

export class CreateStoreLikeDto {
  userId: ObjectId;
  storeId: string;
  createdDate: Date;
}
