import { Injectable } from '@nestjs/common';
import { Cake } from './entities/cake.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CakesRepository } from './cakes.repository';
import { setSortCriteria } from 'src/utils/validation-utils';

@Injectable()
export class CakesService {
  constructor(
    private readonly cakesRepository: CakesRepository,
    @InjectModel(Cake.name) private readonly CakeModel: Model<Cake>,
  ) {}

  async getRecommendCakes(
    uid: string,
    sortBY: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    // 현재는 랜덤으로 케이크 10개 가져온다
    const sortCriteria = setSortCriteria(sortBY);
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);

    const recommendedCakes = await this.cakesRepository.getRecommendCakes(
      uid,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
    );
    return recommendedCakes;
  }

  async getTodayCakes(uid: string) {
    // 최신 순으로 정렬해서 최근 5개 케이크와 해당 케이크 마켓의 정보를 가져온다.
    const todayCakes = await this.cakesRepository.getTodayCakesData(uid);

    return todayCakes;
  }

  async getCategoryCakes(
    uid: string,
    category: string,
    sortBy: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    const sortCriteria = setSortCriteria(sortBy);
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);
    const categoryCakes = await this.cakesRepository.getCakeByCategory(
      uid,
      category,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
    );
    return categoryCakes;
  }

  async getCakeById(
    uid: string,
    cakeId: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);

    const cake = await this.cakesRepository.getCakeByIdData(
      uid,
      cakeId,
      userLatitudeNumber,
      userLongitudeNumber,
    );
    return cake;
  }
}
