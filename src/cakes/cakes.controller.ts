import {
  Controller,
  Get,
  Param,
  Query,
  Body,
  Post,
  Delete,
} from '@nestjs/common';
import { CakesService } from './cakes.service';
import {
  setDefaultSort,
  validateCoordinates,
  validateRequiredField,
  validateSortBy,
} from 'src/utils/validation-utils';
import { CreateCakeDto } from './dto/create-cake.dto';

@Controller('cakes')
export class CakesController {
  constructor(private readonly cakesService: CakesService) {}

  @Get('recommend')
  getRecommendCakes(
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
      return this.cakesService.getRecommendCakes(
        uid,
        defaultSortBy,
        page,
        latitude,
        longitude,
      );
    } else if (latitude && longitude) {
      return this.cakesService.getRecommendCakes(
        uid,
        defaultSortBy,
        page,
        latitude,
        longitude,
      );
    }
    return this.cakesService.getRecommendCakes(uid, defaultSortBy, page);
  }

  @Get('today')
  getTodayCakes() {
    const uid = '665f134a0dfff9c6393100d5';
    return this.cakesService.getTodayCakes(uid);
  }

  @Get()
  getCategoryCakes(
    @Query('category') category: string,
    @Query('sortBy') sortBy: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('page') page: string,
  ) {
    const uid = '665f134a0dfff9c6393100d5';

    const defaultSortBy = setDefaultSort(sortBy);
    validateSortBy(defaultSortBy);
    validateRequiredField('category', category);
    validateRequiredField('page', page);
    if (defaultSortBy === 'distance') {
      validateCoordinates(latitude, longitude);
      return this.cakesService.getCategoryCakes(
        uid,
        category,
        defaultSortBy,
        page,
        latitude,
        longitude,
      );
    } else if (latitude && longitude) {
      return this.cakesService.getCategoryCakes(
        uid,
        category,
        defaultSortBy,
        page,
        latitude,
        longitude,
      );
    }
    return this.cakesService.getCategoryCakes(
      uid,
      category,
      defaultSortBy,
      page,
    );
  }

  @Post()
  createCake(@Body() createCakeDto: CreateCakeDto) {
    return this.cakesService.createCake(createCakeDto);
  }

  @Post('list')
  getCakesByIdList(@Body('cakeIds') cakeIds: string[]) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.cakesService.getCakesByIds(uid, cakeIds);
  }

  @Get('categories')
  getCategories() {
    return this.cakesService.getCategories();
  }

  @Get('world-cup')
  getWorldCupCakes() {
    return this.cakesService.getWorldCupCakes();
  }

  @Get('world-cup/:cakeId')
  getWorldCupWinner(@Param('cakeId') cakeId: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.cakesService.getWorldCupWinner(uid, cakeId);
  }

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

  @Delete()
  async deleteCakes(@Body('cakeIds') cakeIds: string[]) {
    return this.cakesService.deleteCakes(cakeIds);
  }
}
