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
  uid: string;
  nickname: string;
  account: string;
  platform: string;
  photo: string;
  pushNotification: boolean;
  adNotification: boolean;
  status: string;
}
