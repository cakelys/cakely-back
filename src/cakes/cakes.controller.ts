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
  getTodayCakes(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    // let을 const로 임시 변경해둔 상태
    let userLatitude = parseFloat(latitude);
    let userLongitude = parseFloat(longitude);

    // 위치 값이 유효한지 검사
    if (isNaN(userLatitude) || isNaN(userLongitude)) {
      // 테스트용 임시값
      console.log('임시값', userLatitude, userLongitude);
      userLatitude = 37.5665;
      userLongitude = 126.978;

      //throw new BadRequestException('Invalid latitude or longitude');
    }

    return this.cakesService.getTodayCakes(userLatitude, userLongitude);
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
