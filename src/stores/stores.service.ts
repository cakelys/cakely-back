import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Store } from './entities/store.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { setSortCriteria } from 'src/utils/validation-utils';
import { StoresRepository } from './stores.repository';

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

  async getStorePopularCakes(id: string) {
    const storeId = new ObjectId(id);
    const cakes = await this.StoreModel.aggregate([
      {
        $match: {
          _id: storeId,
        },
      },
      {
        $lookup: {
          from: 'cakes',
          localField: '_id',
          foreignField: 'storeId',
          as: 'cakes',
        },
      },
      {
        $unwind: {
          path: '$cakes',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: 'cakes._id',
          foreignField: 'cakeId',
          as: 'result',
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: '$cakes._id',
          name: '$cakes.name',
          photos: '$cakes.photos',
          tags: '$cakes.tags',
          categories: '$cakes.categories',
          popularity: '$cakes.popularity',
          createdDate: '$cakes.createdDate',
          isFavorite: {
            $cond: {
              if: {
                $eq: [
                  '$result.userId',
                  new ObjectId('665f134a0dfff9c6393100d5'),
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
      // {
      //   $sort: {
      //     popularity: -1,
      //   },
      // },
      // {
      //   $limit: 10,
      // },
    ]);

    return cakes;
  }
}
