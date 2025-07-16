import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { LocationDto } from 'src/common/location.dto';
import { UpdateUserDto } from './update-user.dto';

export class UpdateUserDbDto extends PartialType(CreateUserDto) {
  constructor(updateUser: UpdateUserDto) {
    super();
    Object.assign(this, updateUser);
    this.address = updateUser.address;
    if (updateUser.latitude != undefined && updateUser.longitude != undefined) {
      this.location = new LocationDto(
        updateUser.latitude,
        updateUser.longitude,
      );
    }
    if (updateUser.status == '탈퇴') {
      this.deletedDate = new Date();
    }
  }

  @IsOptional()
  @IsDate()
  deletedDate: Date;

  @IsOptional()
  location: LocationDto;

  @IsOptional()
  @IsString()
  address?: string;
}
