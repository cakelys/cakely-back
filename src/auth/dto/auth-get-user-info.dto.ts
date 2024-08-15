import { IsEmail, IsString } from 'class-validator';

export class AuthGetUserInfoDto {
  constructor(
    uid: string,
    account: string,
    nickname: string,
    photo: string,
    platform,
  ) {
    this.uid = uid;
    this.account = account;
    this.nickname = nickname;
    this.photo = photo;
    this.platform = platform;
  }

  @IsString()
  uid: string;

  @IsEmail()
  account: string;

  @IsString()
  nickname: string;

  @IsString()
  photo: string;

  @IsString()
  platform: string;
}
