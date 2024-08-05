import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoresService } from './stores.service';
import {
  setDefaultSort,
  validateCoordinates,
  validateRequiredField,
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
    @Query('page') page: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';
    const defaultSortBy = setDefaultSort(sortBy);
    validateSortBy(defaultSortBy);
    validateRequiredField('page', page);
    if (defaultSortBy === 'distance') {
      validateCoordinates(latitude, longitude);
      return this.storesService.getAllStores(
        uid,
        defaultSortBy,
        page,
        latitude,
        longitude,
      );
    }

    return this.storesService.getAllStores(uid, defaultSortBy, page);
  }

  // 하나 store 가져오기
  @Get(':storeId')
  getStore(@Param('storeId') storeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.storesService.getStoreById(uid, storeId);
  }

  // 스토어의 케이크 가져오기
  @Get(':storeId/cakes')
  getStoreCakes(
    @Param('storeId') storeId: string,
    @Query('page') page: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';
    validateRequiredField('page', page);
    return this.storesService.getStoreCakes(uid, storeId, page);
  }

  // 스토어의 인기 케이크 가져오기
  @Get(':id/popular')
  getStorePopularCakes(@Param('id') id: string) {
    return this.storesService.getStorePopularCakes(id);
  }
}
