import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import {
  setDefaultSort,
  validateCoordinates,
  validateRequiredField,
  validateSortBy,
} from 'src/utils/validation-utils';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller({ path: 'stores', version: ['1', VERSION_NEUTRAL] })
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @UseGuards(AuthGuard)
  @Get()
  getAllStores(
    @Query('sortBy') sortBy: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('page') page: string,
    @Req() request,
  ) {
    const uid = request.userId;
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
    } else if (latitude && longitude) {
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

  @UseGuards(AuthGuard)
  @Get('nearby')
  getNearbyStores(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Req() request,
  ) {
    const uid = request.userId;
    validateCoordinates(latitude, longitude);
    return this.storesService.getNearbyStores(uid, latitude, longitude);
  }

  @Get('search')
  searchStores(@Query('keyword') keyword: string) {
    return this.storesService.searchStores(keyword);
  }

  @Get('oldest')
  getOldestStores() {
    return this.storesService.getOldestStores();
  }

  @UseGuards(AuthGuard)
  @Get(':storeId')
  getStore(@Param('storeId') storeId: string, @Req() request) {
    const uid = request.userId;
    return this.storesService.getStoreById(uid, storeId);
  }

  @UseGuards(AuthGuard)
  @Get(':storeId/cakes')
  getStoreCakes(
    @Param('storeId') storeId: string,
    @Query('page') page: string,
    @Req() request,
  ) {
    const uid = request.userId;
    validateRequiredField('page', page);
    return this.storesService.getStoreCakes(uid, storeId, page);
  }

  @Get(':storeId/all-cakes')
  getStoreAllCakes(@Param('storeId') storeId: string) {
    return this.storesService.getStoreAllCakes(storeId);
  }

  @UseGuards(AuthGuard)
  @Get(':storeId/cakes/:cakeId')
  getStoreCake(
    @Param('storeId') storeId: string,
    @Param('cakeId') cakeId: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Req() request,
  ) {
    const uid = request.userId;
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

  @UseGuards(AuthGuard)
  @Get(':storeId/details')
  getStoreDetails(
    @Param('storeId') storeId: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Req() request,
  ) {
    const uid = request.userId;

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

  @Post()
  createStore(@Body() body: any) {
    return this.storesService.createStore(body);
  }

  @Delete('')
  deleteStores(@Body('storeIds') storeIds: string[]) {
    return this.storesService.deleteStores(storeIds);
  }
}
