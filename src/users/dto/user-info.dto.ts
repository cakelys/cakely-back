import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserInfoDto {
  @IsString()
  @IsNotEmpty()
  account: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsBoolean()
  @IsNotEmpty()
  pushNotification: boolean;

  @IsString()
  @IsNotEmpty()
  photo: string;

  @IsNumber()
  latitude: number | null;

  @IsNumber()
  longitude: number | null;

  @IsString()
  address: string;
}
