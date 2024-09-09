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

  @Get('nearby')
  getNearbyStores(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';
    validateCoordinates(latitude, longitude);
    return this.storesService.getNearbyStores(uid, latitude, longitude);
  }

  @Get(':storeId')
  getStore(@Param('storeId') storeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.storesService.getStoreById(uid, storeId);
  }

  @Get(':storeId/cakes')
  getStoreCakes(
    @Param('storeId') storeId: string,
    @Query('page') page: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';
    validateRequiredField('page', page);
    return this.storesService.getStoreCakes(uid, storeId, page);
  }

  @Get(':storeId/cakes/:cakeId')
  getStoreCake(
    @Param('storeId') storeId: string,
    @Param('cakeId') cakeId: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';
    if (latitude && longitude) {
      return this.storesService.getStoreCake(
        uid,
        storeId,
        cakeId,
        latitude,
        longitude,
      );
    }
    return this.storesService.getStoreCake(uid, storeId, cakeId);
  }

  @Get(':storeId/details')
  getStoreDetails(
    @Param('storeId') storeId: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';

    if (latitude && longitude) {
      return this.storesService.getStoreDetails(
        uid,
        storeId,
        latitude,
        longitude,
      );
    }
    return this.storesService.getStoreDetails(uid, storeId);
  }
}
