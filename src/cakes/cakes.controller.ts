import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { CakesService } from './cakes.service';
import {
  setDefaultSort,
  validateCoordinates,
  validateRequiredField,
  validateSortBy,
} from 'src/utils/validation-utils';

@Controller('cakes')
export class CakesController {
  private readonly logger = new Logger(CakesController.name);
  constructor(private readonly cakesService: CakesService) {}

  // 추천케이크 리스트 가져오기
  @Get('recommend')
  getRecommendCakes(
    @Query('sortBy') sortBy: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';

    const defaultSortBy = setDefaultSort(sortBy);
    validateSortBy(defaultSortBy);
    if (defaultSortBy === 'distance') {
      validateCoordinates(latitude, longitude);
      return this.cakesService.getRecommendCakes(
        uid,
        defaultSortBy,
        latitude,
        longitude,
      );
    }
    return this.cakesService.getRecommendCakes(uid, defaultSortBy);
  }

  // 오늘의 케이크 리스트 가져오기
  @Get('today')
  getTodayCakes() {
    const uid = '665f134a0dfff9c6393100d5';
    return this.cakesService.getTodayCakes(uid);
  }

  // 카테고리별 케이크 리스트 가져오기
  @Get()
  getCategoryCakes(
    @Query('category') category: string,
    @Query('sortBy') sortBy: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';

    const defaultSortBy = setDefaultSort(sortBy);
    validateSortBy(defaultSortBy);
    validateRequiredField('category', category);
    if (defaultSortBy === 'distance') {
      validateCoordinates(latitude, longitude);
      return this.cakesService.getCategoryCakes(
        uid,
        category,
        defaultSortBy,
        latitude,
        longitude,
      );
    }
    return this.cakesService.getCategoryCakes(uid, category, defaultSortBy);
  }

  // 케이크 상세정보 가져오기
  @Get(':cakeId')
  getCakeById(
    @Param('cakeId') cakeId: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';

    if (latitude && longitude) {
      return this.cakesService.getCakeById(uid, cakeId, latitude, longitude);
    }
    return this.cakesService.getCakeById(uid, cakeId);
  }
}
