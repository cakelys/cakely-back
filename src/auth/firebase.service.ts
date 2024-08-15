import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getAuth } from 'firebase-admin/auth';
import { Model } from 'mongoose';
import { AuthGetUserInfoDto } from './dto/auth-get-user-info.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FirebaseService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  // 토큰을 받으면 firebase에 접근해서 유효한 토큰인지 확인하고 유저의 uid를 반환하는 함수
  async verifyAccessToken(accessToken: string): Promise<string> {
    if (!accessToken.startsWith('Bearer ')) {
      console.log('Invalid token');
      throw new UnauthorizedException();
    }

    try {
      const parsedAccessToken = accessToken.substring(7, accessToken.length);
      const decodedToken = await getAuth().verifyIdToken(parsedAccessToken);
      const uid = decodedToken.uid;
      return uid;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }

  // mongodb에서 사용자가 있는지 확인하는 함수
  async validateUser(uid: string): Promise<boolean> {
    // mongodb에서 uid를 검색해서 있으면 true, 없으면 false를 반환
    const userInfo = await this.userModel
      .findOne(
        { uid: uid },
        { _id: 0, status: 1 }, // 원하는 필드만 가져오기
      )
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

  // 사용자 삭제 함수
  async deleteUser(uid: string) {
    try {
      await getAuth().deleteUser(uid);
      // 사용자 삭제 성공 처리
    } catch (error) {
      // 사용자 삭제 실패 처리
      console.error('사용자 삭제 실패', error);
    }
  }
}
