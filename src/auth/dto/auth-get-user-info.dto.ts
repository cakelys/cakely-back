import { IsEmail, IsString, Matches } from 'class-validator';

export class AuthGetUserInfoDto {
  constructor(uid: string, email: string, userName: string, userImage: string) {
    this.uid = uid;
    this.email = email;
    this.userName = userName;
    this.userImage = userImage;
  }

  @IsString()
  uid: string;

  @IsEmail()
  email: string;

  @IsString()
  userName: string;

  @IsString()
  userImage: string;
}
