import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserDbDto } from './dto/update-user-db.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async getUserInfo(uid: string) {
    const user = await this.usersRepository.getUserInfo(uid);
    return user;
  }

  async logIn(uid: string) {
    return this.usersRepository.logIn(uid);
  }

  async signIn(accessToken: string) {
    return this.usersRepository.signIn(accessToken);
  }

  async updateUserInfo(uid: string, updateUser: UpdateUserDto) {
    const updateUserDbDto: UpdateUserDbDto = new UpdateUserDbDto(updateUser);
    this.usersRepository.updateUserInfo(uid, updateUserDbDto);
  }
}
