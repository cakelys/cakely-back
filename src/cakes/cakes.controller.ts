import {
  Controller,
  Get,
  Param,
  Query,
  Body,
  Post,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CakesService } from './cakes.service';
import {
  setDefaultSort,
  validateCoordinates,
  validateRequiredField,
  validateSortBy,
} from 'src/utils/validation-utils';
import { CreateCakeDto } from './dto/create-cake.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('cakes')
export class CakesController {
  constructor(private readonly cakesService: CakesService) {}

  @UseGuards(AuthGuard)
  @Get('recommend')
  getRecommendCakes(
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

  @UseGuards(AuthGuard)
  @Get('today')
  getTodayCakes(@Req() request) {
    const uid = request.userId;
    return this.cakesService.getTodayCakes(uid);
  }

  @UseGuards(AuthGuard)
  @Get()
  getCategoryCakes(
    @Query('category') category: string,
    @Query('sortBy') sortBy: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('page') page: string,
    @Req() request,
  ) {
    const uid = request.userId;

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

  @UseGuards(AuthGuard)
  @Post('list')
  getCakesByIdList(@Body('cakeIds') cakeIds: string[], @Req() request) {
    const uid = request.userId;
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

  @UseGuards(AuthGuard)
  @Get('world-cup/:cakeId')
  getWorldCupWinner(@Param('cakeId') cakeId: string, @Req() request) {
    const uid = request.userId;
    return this.cakesService.getWorldCupWinner(uid, cakeId);
  }

  @UseGuards(AuthGuard)
  @Get(':cakeId')
  getCakeById(
    @Param('cakeId') cakeId: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Req() request,
  ) {
    const uid = request.userId;
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
