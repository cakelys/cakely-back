import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Store } from './entities/store.entity';
import { InjectModel } from '@nestjs/mongoose';
import { setSortCriteria } from 'src/utils/validation-utils';
import { StoresRepository } from './stores.repository';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StoresService {
  constructor(
    private readonly storesRepository: StoresRepository,
    @InjectModel(Store.name) private readonly StoreModel: Model<Store>,
  ) {}

  // 전체 store 리스트 가져오기
  async getAllStores(
    uid: string,
    sortBy: string,
    page: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    const sortCriteria = setSortCriteria(sortBy);
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);
    const pageInt = parseInt(page, 10);

    const allStores = await this.storesRepository.getAllStores(
      uid,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
      pageInt,
    );
    return allStores;
  }

  // 하나 store 가져오기
  async getStoreById(uid: string, storeId: string) {
    const store = await this.storesRepository.getStoreById(uid, storeId);

    // 랜덤으로 popularCakes 배열 중에 케이크 하나 선택해서 photo를 store의 backgroundImage로 설정
    const randomIndex = Math.floor(Math.random() * store.popularCakes.length);
    store.store.backgroundImage = store.popularCakes[randomIndex].photo;

    return store;
  }

  async getStoreCakes(uid: string, storeId: string, page: string) {
    const pageInt = parseInt(page, 10);
    const storeCakes = await this.storesRepository.getStoreCakes(
      uid,
      storeId,
      pageInt,
    );

    return storeCakes;
  }

  async getStoreCake(
    uid: string,
    storeId: string,
    cakeId: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);
    const storeCake = await this.storesRepository.getStoreCake(
      uid,
      storeId,
      cakeId,
      userLatitudeNumber,
      userLongitudeNumber,
    );

    const filePath = path.join(__dirname, '../../data/store-notes.json');
    const storeNotes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    storeCake.cakeOverview.notes = storeNotes.notes;

    return storeCake;
  }

  async getStoreDetails(
    uid: string,
    storeId: string,
    latitude?: string,
    longitude?: string,
  ) {
    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);

    const storeDetails = await this.storesRepository.getStoreDetails(
      uid,
      storeId,
      userLatitude,
      userLongitude,
    );
    return storeDetails;
  }
}
