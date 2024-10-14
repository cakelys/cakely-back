import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getAuth } from 'firebase-admin/auth';
import { Model } from 'mongoose';
import { AuthGetUserInfoDto } from './dto/auth-get-user-info.dto';
import { User } from 'src/users/entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class FirebaseService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async verifyAccessToken(accessToken: string): Promise<string> {
    if (!accessToken.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    try {
      const parsedAccessToken = accessToken.substring(7, accessToken.length);
      const decodedToken = await getAuth().verifyIdToken(parsedAccessToken);
      const uid = decodedToken.uid;
      const userInfo = await this.userModel.findOneAndUpdate(
        { uid, status: '활동' },
        { lastLoginDate: new Date() },
        { new: true },
      );
      return userInfo._id.toString();
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async validateUser(userId: string): Promise<boolean> {
    const userInfo = await this.userModel
      .findOne({ _id: new ObjectId(userId) }, { _id: 0, status: 1 })
      .exec();

    if (userInfo === null) {
      return false;
    }
    if (userInfo.status === '탈퇴') {
      return false;
    }
    return true;
  }

  async getUserInfoByAccessToken(
    accessToken: string,
  ): Promise<AuthGetUserInfoDto | string> {
    if (!accessToken.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    try {
      const parsedAccessToken = accessToken.substring(7, accessToken.length);
      const decodedToken = await getAuth().verifyIdToken(parsedAccessToken);
      const uid = decodedToken.uid;
      const account = decodedToken.email;
      const nickname = decodedToken.name;
      const photo = decodedToken.picture;
      const platform = decodedToken.firebase.sign_in_provider;
      return new AuthGetUserInfoDto(uid, account, nickname, photo, platform);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async deleteUser(uid: string) {
    try {
      await getAuth().deleteUser(uid);
    } catch (error) {
      console.error('사용자 삭제 실패', error);
    }
  }
}
