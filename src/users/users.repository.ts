import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel('User') private readonly userModel: Model<any>) {}

  async getUserInfo(uid: string) {
    const userInfo = await this.userModel.findOne(
      { _id: uid },
      {
        _id: 0,
        nickname: 1,
        account: 1,
        platform: 1,
        profileImage: 1,
        pushNotification: 1,
        adNotification: 1,
      },
    );
    return userInfo;
  }
}
