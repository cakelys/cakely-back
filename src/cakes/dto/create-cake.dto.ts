import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCakeDto {
  @IsNotEmpty()
  @IsString()
  faiss_id: string;

  @IsNotEmpty()
  @IsString()
  photo: string;
}
