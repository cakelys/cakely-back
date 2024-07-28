import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CakesService } from './cakes.service';
import { CreateCakeDto } from './dto/create-cake.dto';
import { UpdateCakeDto } from './dto/update-cake.dto';

@Controller('cakes')
export class CakesController {
  constructor(private readonly cakesService: CakesService) {}

  // 전체 케이크 리스트 가져오기
  @Get()
  getAllCakes() {
    return this.cakesService.getAllCakes();
  }

  // 추천케이크 리스트 가져오기
  @Get('recommend')
  getRecommendCakes() {
    return this.cakesService.getRecommendCakes();
  }

  // 오늘의 케이크 리스트 가져오기
  @Get('today')
  getTodayCakes() {
    const uid = '665f134a0dfff9c6393100d5';
    return this.cakesService.getTodayCakes(uid);
  }

  // 카테고리별 케이크 리스트 가져오기
  @Get('category')
  getCategoryCakes(@Query('category') category: string) {
    // category 있는지 확인
    if (!category) {
      throw new Error('category is required');
    }
    const categoryCakes = this.cakesService.getCategoryCakes(category);
    return categoryCakes;
  }

  // 케이크 상세정보 가져오기
  @Get(':id')
  getCake(@Param('id') id: string) {
    return this.cakesService.getCake(id);
  }
}
