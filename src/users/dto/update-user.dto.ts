import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsDate()
  deletedDate?: Date;

  @IsOptional()
  @IsNumber()
  latitude: number;

  @IsOptional()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  address: string;
}
