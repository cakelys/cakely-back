import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CakeDto {
  @IsNotEmpty()
  @IsBoolean()
  isLiked: boolean;

  @IsNotEmpty()
  @IsString()
  photo: string;

  @IsNotEmpty()
  @IsString()
  id: string;
}
