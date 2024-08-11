import { ObjectId } from 'mongodb';

export class CreateCakeLikeDto {
  constructor(userId: ObjectId, cakeId: ObjectId, id?: ObjectId) {
    this.userId = userId;
    this.cakeId = cakeId;
    this.createdDate = new Date();
    this.id = id;
  }
  id: ObjectId;
  userId: ObjectId;
  cakeId: ObjectId;
  createdDate: Date;
}
