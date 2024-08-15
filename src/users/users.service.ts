import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async getUserInfo(uid: string) {
    const userInfo = await this.usersRepository.getUserInfo(uid);
    return userInfo;
  }

  async logIn(uid: string) {
    return this.usersRepository.logIn(uid);
  }

  async signIn(accessToken: string) {
    return this.usersRepository.signIn(accessToken);
  }
}
