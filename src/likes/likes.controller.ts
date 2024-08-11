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

  // 찜한 가게의 새로 나온 케이크 리스트 가져오기
  @Get('stores/new-cakes')
  getNewCakesInLikedStores() {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.getNewCakesInLikedStores(uid);
  }

  // 전체 찜 가게 리스트 가져오기
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

  // 전체 찜한 케이크 리스트 가져오기
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

  // 케이크 찜하기
  @Post('cakes/:cakeId')
  createCakeLike(@Param('cakeId') cakeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.createCakeLike(uid, cakeId);
  }

  // 가게 찜하기
  @Post('stores/:storeId')
  createStoreLike(@Param('storeId') storeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.createStoreLike(uid, storeId);
  }

  // 케이크 찜 삭제하기
  @Delete('cakes/:cakeId')
  deleteCakeLike(@Param('cakeId') cakeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.deleteCakeLike(uid, cakeId);
  }

  // 가게 찜 삭제하기
  @Delete('stores/:storeId')
  deleteStoreLike(@Param('storeId') storeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.likesService.deleteStoreLike(uid, storeId);
  }
}
