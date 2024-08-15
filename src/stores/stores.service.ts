import { Injectable } from '@nestjs/common';
import { setSortCriteria } from 'src/utils/validation-utils';
import { StoresRepository } from './stores.repository';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class StoresService {
  constructor(
    private readonly storesRepository: StoresRepository,
    private readonly s3Service: S3Service,
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

    const key = 'app-data/store-notes.json';
    const storeNotesFileData = await this.s3Service.getFile(key);
    const storeNotesFileContent = storeNotesFileData.toString('utf-8');
    const storeNotesJsonData = JSON.parse(storeNotesFileContent);

    storeCake.notes = storeNotesJsonData.notes;
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
