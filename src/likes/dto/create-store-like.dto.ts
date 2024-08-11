import { ObjectId } from 'mongodb';

export class CreateStoreLikeDto {
  constructor(userId: ObjectId, storeId: ObjectId, id?: ObjectId) {
    this.userId = userId;
    this.storeId = storeId;
    this.createdDate = new Date();
    this.id = id;
  }
  id: ObjectId;
  userId: ObjectId;
  storeId: ObjectId;
  createdDate: Date;
}
