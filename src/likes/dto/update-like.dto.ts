import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreLikeDto } from './create-store-like.dto';

export class UpdateLikeDto extends PartialType(CreateStoreLikeDto) {}
