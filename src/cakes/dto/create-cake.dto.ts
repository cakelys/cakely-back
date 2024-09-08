import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCakeDto {
  @IsNotEmpty()
  @IsNumber()
  faissId: number;

  @IsNotEmpty()
  @IsString()
  photo: string;
}
