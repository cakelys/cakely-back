import { Controller, Get, Post, Param, Delete, Query } from '@nestjs/common';
import { LikesService } from './likes.service';
import {
  setDefaultSort,
  validateCoordinates,
  validateRequiredField,
  validateSortBy,
} from 'src/utils/validation-utils';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get('stores/new-cakes')
  getNewCakesInLikedStores() {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.getNewCakesInLikedStores(uid);
  }

  @Get('stores')
  getAllLikedStore(
    @Query('page') page: string,
    @Query('sortBy') sortBy: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';
    const defaultSortBy = setDefaultSort(sortBy);
    validateSortBy(defaultSortBy);
    validateRequiredField('page', page);
    if (defaultSortBy === 'distance') {
      validateCoordinates(latitude, longitude);
      return this.likesService.getAllStoreLikes(
        uid,
        defaultSortBy,
        page,
        latitude,
        longitude,
      );
    }
    return this.likesService.getAllStoreLikes(uid, defaultSortBy, page);
  }

  @Get('cakes')
  getAllLikedCakes(
    @Query('page') page: string,
    @Query('sortBy') sortBy: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';
    const defaultSortBy = setDefaultSort(sortBy);
    validateSortBy(defaultSortBy);
    validateRequiredField('page', page);
    if (defaultSortBy === 'distance') {
      validateCoordinates(latitude, longitude);
      return this.likesService.getAllLikedCakes(
        uid,
        defaultSortBy,
        page,
        latitude,
        longitude,
      );
    }
    return this.likesService.getAllLikedCakes(
      uid,
      defaultSortBy,
      page,
      latitude,
      longitude,
    );
  }

  @Post('cakes/:cakeId')
  createCakeLike(@Param('cakeId') cakeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.createCakeLike(uid, cakeId);
  }

  @Post('stores/:storeId')
  createStoreLike(@Param('storeId') storeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.createStoreLike(uid, storeId);
  }

  @Delete('cakes/:cakeId')
  deleteCakeLike(@Param('cakeId') cakeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.deleteCakeLike(uid, cakeId);
  }

  @Delete('stores/:storeId')
  deleteStoreLike(@Param('storeId') storeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.deleteStoreLike(uid, storeId);
  }
}
