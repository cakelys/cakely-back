import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import {
  setDefaultSort,
  validateCoordinates,
  validateRequiredField,
  validateSortBy,
} from 'src/utils/validation-utils';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller({ path: 'likes', version: ['1', VERSION_NEUTRAL] })
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get('stores/new-cakes')
  getNewCakesInLikedStores(@Req() request) {
    const uid = request.userId;
    return this.likesService.getNewCakesInLikedStores(uid);
  }

  @Get('stores')
  getAllLikedStore(
    @Query('page') page: string,
    @Query('sortBy') sortBy: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Req() request,
  ) {
    const uid = request.userId;
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
    } else if (latitude && longitude) {
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
    @Req() request,
  ) {
    const uid = request.userId;
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
    } else if (latitude && longitude) {
      return this.likesService.getAllLikedCakes(
        uid,
        defaultSortBy,
        page,
        latitude,
        longitude,
      );
    }
    return this.likesService.getAllLikedCakes(uid, defaultSortBy, page);
  }

  @Post('cakes/:cakeId')
  createCakeLike(@Param('cakeId') cakeId: string, @Req() request) {
    const uid = request.userId;
    return this.likesService.createCakeLike(uid, cakeId);
  }

  @Post('stores/:storeId')
  createStoreLike(@Param('storeId') storeId: string, @Req() request) {
    const uid = request.userId;
    return this.likesService.createStoreLike(uid, storeId);
  }

  @Delete('cakes/:cakeId')
  deleteCakeLike(@Param('cakeId') cakeId: string, @Req() request) {
    const uid = request.userId;
    return this.likesService.deleteCakeLike(uid, cakeId);
  }

  @Delete('stores/:storeId')
  deleteStoreLike(@Param('storeId') storeId: string, @Req() request) {
    const uid = request.userId;
    return this.likesService.deleteStoreLike(uid, storeId);
  }
}
