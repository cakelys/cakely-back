import { Injectable } from '@nestjs/common';
import { CreateCakeLikeDto } from './dto/create-cake-like.dto';
import { CreateStoreLikeDto } from './dto/create-store-like.dto';
import { ObjectId } from 'mongodb';
import { LikesRepository } from './likes.repository';
import { setSortCriteria } from 'src/utils/validation-utils';

@Injectable()
export class LikesService {
  constructor(private readonly likesRepository: LikesRepository) {}

  // 찜한 가게의 새로 나온 케이크 리스트 가져오기
  async getNewCakesInLikedStores(uid: string) {
    const newCakesInLikedStores =
      await this.likesRepository.getNewCakesInLikedStores(uid);
    return newCakesInLikedStores;
  }

  // 전체 찜 케이크 리스트 가져오기
  async getAllLikedCakes(
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

    const allLikedCakes = await this.likesRepository.getAllLikedCakes(
      uid,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
      pageInt,
    );

    return allLikedCakes;
  }

  // 전체 찜 가게 리스트 가져오기
  async getAllStoreLikes(
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

    const allLikedStores = await this.likesRepository.getAllLikedStores(
      uid,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
      pageInt,
    );

    return allLikedStores;
  }

  // 찜 케이크 추가
  async createCakeLike(uid: string, cakeId: string) {
    const createCakeLikeDto = new CreateCakeLikeDto(
      new ObjectId(uid),
      new ObjectId(cakeId),
    );
    const newLike = await this.likesRepository.createCakeLike(
      createCakeLikeDto,
    );
    return newLike;
  }

  // 찜 가게 추가
  async createStoreLike(uid: string, storeId: string) {
    const createStoreLikeDto = new CreateStoreLikeDto(
      new ObjectId(uid),
      new ObjectId(storeId),
    );
    const newLike = await this.likesRepository.createStoreLike(
      createStoreLikeDto,
    );
    return newLike;
  }

  // 찜 케이크 삭제
  async deleteCakeLike(uid: string, cakeId: string) {
    const deletedCakeLike = await this.likesRepository.deleteCakeLike(
      uid,
      cakeId,
    );
    return deletedCakeLike;
  }

  // 찜 가게 삭제
  async deleteStoreLike(uid: string, storeId: string) {
    const deletedStoreLike = await this.likesRepository.deleteStoreLike(
      uid,
      storeId,
    );
    return deletedStoreLike;
  }
}
