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
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async getUserInfo(uid: string) {
    const userInfo = await this.userModel.findOne(
      { _id: new ObjectId(uid) },
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
      { _id: new ObjectId(uid) },
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
    const userInfo = await this.userModel
      .findOne(
        { uid: firebaseUser['uid'] },
        { _id: 1, status: 1, deletedDate: 1 },
      )
      .sort({ deletedDate: -1 });

    if (userInfo) {
      if (userInfo.status === '탈퇴') {
        if (
          new Date().getTime() - userInfo.deletedDate.getTime() <=
          604800000
        ) {
          return await this.userModel.findOneAndUpdate(
            { _id: userInfo._id },
            { status: '활동', deletedDate: null },
          );
        }
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

  async updateUserInfo(uid: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.status === '탈퇴') {
      updateUserDto.deletedDate = new Date();
    }

    const userInfo = await this.userModel.findOneAndUpdate(
      { _id: new ObjectId(uid) },
      updateUserDto,
      { new: true },
    );
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }
  }
}
