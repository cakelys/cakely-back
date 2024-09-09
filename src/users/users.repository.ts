import { CreateUserDto } from './dto/create-user.dto';
import {
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FirebaseService } from 'src/auth/firebase.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async getUserInfo(uid: string) {
    const userInfo = await this.userModel.findOne(
      { uid: uid },
      {
        _id: 0,
        nickname: 1,
        account: 1,
        platform: 1,
        profileImage: 1,
        pushNotification: 1,
        photo: 1,
      },
    );

    if (!userInfo) {
      throw new NotFoundException('User not found');
    }
    return userInfo;
  }

  async logIn(uid: string) {
    const userInfo = await this.userModel.findOne(
      { uid: uid },
      {
        _id: 0,
        nickname: 1,
        account: 1,
        platform: 1,
        profileImage: 1,
        pushNotification: 1,
        adNotification: 1,
        status: 1,
      },
    );
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    if (userInfo.status === '탈퇴') {
      throw new GoneException('This user has been withdrawn');
    }
  }

  async signIn(accessToken) {
    const firebaseUser = await this.firebaseService.getUserInfoByAccessToken(
      accessToken,
    );
    if (firebaseUser === 'Invalid token') {
      throw new UnauthorizedException('Invalid token');
    }
    const userInfo = await this.userModel.findOne(
      { uid: firebaseUser['uid'] },
      { _id: 0, status: 1 },
    );
    if (userInfo) {
      if (userInfo.status === '탈퇴') {
        // [TODO] 탈퇴한지 한달이 넘었는지 확인
        throw new GoneException('This user has been withdrawn');
      } else {
        throw new ConflictException('This email is already in use');
      }
    }

    const createUserDto: CreateUserDto = {
      uid: firebaseUser['uid'],
      nickname: firebaseUser['nickname'],
      account: firebaseUser['account'],
      platform: firebaseUser['platform'],
      photo: firebaseUser['photo'],
      pushNotification: false,
      adNotification: false,
      status: '활동',
    };

    const newUser = new this.userModel(createUserDto);
    await newUser.save();
  }
}
