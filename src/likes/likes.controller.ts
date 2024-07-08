import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateStoreLikeDto } from './dto/create-store-like.dto';
import { CreateCakeLikeDto } from './dto/create-cake-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  // 전체 찜 케이크 리스트 가져오기
  @Get('cakes')
  getAlCakelLikes() {
    return this.likesService.getAllCakeLikes();
  }

  // 전체 찜 가게 리스트 가져오기
  @Get('stores')
  getAllStoreLikes() {
    return this.likesService.getAllStoreLikes();
  }

  // 케이크 찜하기
  @Post('cakes')
  createCakeLike(@Body() createCakeLikeDto: CreateCakeLikeDto) {
    return this.likesService.createCakeLike(createCakeLikeDto);
  }

  // 가게 찜하기
  @Post('stores')
  createStoreLike(@Body() createStoreLikeDto: CreateStoreLikeDto) {
    return this.likesService.createStoreLike(createStoreLikeDto);
  }

  @Delete('cakes:id')
  deleteCakeLike(@Param('id') id: string) {
    return this.likesService.deleteCakeLike(id);
  }

  // 가게 찜 삭제하기
  @Delete('stores/:id')
  deleteStoreLike(@Param('id') id: string) {
    return this.likesService.deleteStoreLike(id);
  }
}
