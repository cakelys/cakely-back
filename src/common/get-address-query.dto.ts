import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetAddressQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  longitude: number;
}
