import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoresService } from './stores.service';
import {
  setDefaultSort,
  validateCoordinates,
  validateSortBy,
} from 'src/utils/validation-utils';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // 전체 store 리스트 가져오기
  @Get()
  getAllStores(
    @Query('sortBy') sortBy: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';
    const defaultSortBy = setDefaultSort(sortBy);
    validateSortBy(defaultSortBy);
    if (defaultSortBy === 'distance') {
      validateCoordinates(latitude, longitude);
      return this.storesService.getAllStores(
        uid,
        defaultSortBy,
        latitude,
        longitude,
      );
    }

    return this.storesService.getAllStores(uid, defaultSortBy);
  }

  // 하나 store 가져오기
  @Get(':id')
  getStore(@Param('id') id: string) {
    return this.storesService.getStore(id);
  }

  // 스토어의 케이크 가져오기
  @Get(':id/cakes')
  getStoreCakes(@Param('id') id: string) {
    return this.storesService.getStoreCakes(id);
  }

  // 스토어의 인기 케이크 가져오기
  @Get(':id/popular')
  getStorePopularCakes(@Param('id') id: string) {
    return this.storesService.getStorePopularCakes(id);
  }
}
