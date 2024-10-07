import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  constructor(
    uid: string,
    nickname: string,
    account: string,
    platform: string,
    photo: string,
    pushNotification: boolean,
    adNotification: boolean,
    status: string,
  ) {
    this.uid = uid;
    this.nickname = nickname;
    this.account = account;
    this.platform = platform;
    this.photo = photo;
    this.pushNotification = pushNotification;
    this.adNotification = adNotification;
    this.status = status;
  }

  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  account: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  photo: string;

  @IsNotEmpty()
  @IsBoolean()
  pushNotification: boolean;

  @IsNotEmpty()
  @IsBoolean()
  adNotification: boolean;

  @IsString()
  @IsNotEmpty()
  status: string;
}
