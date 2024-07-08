import { ObjectId } from 'mongodb';

export class CreateCakeLikeDto {
  userId: ObjectId;
  cakeId: string;
  createdDate: Date;
}
