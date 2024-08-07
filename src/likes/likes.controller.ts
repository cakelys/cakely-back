import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateStoreLikeDto } from './dto/create-store-like.dto';
import { CreateCakeLikeDto } from './dto/create-cake-like.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  // 찜한 가게의 새로 나온 케이크 리스트 가져오기
  @Get('stores/new-cakes')
  getNewCakesInLikedStores() {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.getNewCakesInLikedStores(uid);
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
