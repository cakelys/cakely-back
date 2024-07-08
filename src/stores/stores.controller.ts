import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // 전체 store 리스트 가져오기
  @Get()
  getAllStores() {
    return this.storesService.getAllStores();
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
