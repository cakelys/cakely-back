import { Injectable } from '@nestjs/common';
import { CreateCakeDto } from './dto/create-cake.dto';
import { UpdateCakeDto } from './dto/update-cake.dto';
import { Cake } from './entities/cake.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { create } from 'domain';
import { CakesRepository } from './cakes.repository';
import { calculateDistance } from './utils/distance.utils';

@Injectable()
export class CakesService {
  constructor(
    private readonly cakesRepository: CakesRepository,
    @InjectModel(Cake.name) private readonly CakeModel: Model<Cake>,
  ) {}

  async getAllCakes() {
    const userId = new ObjectId('665f134a0dfff9c6393100d5');
    const allCakes = await this.CakeModel.aggregate([
      {
        $lookup: {
          from: 'cakeLikes',
          localField: '_id',
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
          _id: 1,
          // photos: 1,
          photo: { $arrayElemAt: ['$photos', 0] },
          tags: 1,
          categories: 1,
          popularity: 1,
          createdDate: 1,
          isFavorite: {
            $cond: {
              if: { $eq: ['$result.userId', userId] },
              then: true,
              else: false,
            },
          },
        },
      },
    ]);

    return allCakes;
  }

  async getRecommendCakes() {
    // 좋아요가 있으면 true -> false로 반환하도록 바꾸기.
    const randomCakes = await this.CakeModel.aggregate([
      {
        $lookup: {
          from: 'cakeLikes',
          localField: '_id',
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
        $sample: {
          size: 10,
        },
      },
      {
        $project: {
          _id: 1,
          // photos: 1,
          photo: { $arrayElemAt: ['$photos', 0] },
          tags: 1,
          categories: 1,
          popularity: 1,
          createdDate: 1,
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
    ]);
    return randomCakes;
  }

  async getTodayCakes(uid: string) {
    // 최신 순으로 정렬해서 최근 5개 케이크와 해당 케이크 마켓의 정보를 가져온다.
    const todayCakes = await this.cakesRepository.getTodayCakesData(uid);

    return todayCakes;
  }

  async getCategoryCakes(category: string) {
    const categoryCakes = await this.CakeModel.aggregate([
      {
        $match: {
          categories: category,
        },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: '_id',
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
          _id: 1,
          // photos: 1,
          photo: { $arrayElemAt: ['$photos', 0] },
          tags: 1,
          categories: 1,
          popularity: 1,
          createdDate: 1,
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
    ]);
    return categoryCakes;
  }

  async getCake(id: string) {
    const cake = await this.CakeModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: '_id',
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
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'store',
        },
      },
      {
        $unwind: {
          path: '$store',
        },
      },
      {
        $project: {
          _id: 1,
          // photos: 1,
          photo: { $arrayElemAt: ['$photos', 0] },
          tags: 1,
          categories: 1,
          popularity: 1,
          createdDate: 1,
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
          store: 1,
        },
      },
    ]);
    return cake;
  }

  // 거리 계산
  private addDistanceToCakes(
    cakes: any[],
    userLat: number,
    userLon: number,
  ): any[] {
    cakes.forEach((cake) => {
      const storeLat = cake.store.latitude;
      const storeLon = cake.store.longitude;
      const distance = calculateDistance(userLat, userLon, storeLat, storeLon);
      cake.store.distance = distance;

      // latitude, longitude 정보 제거
      delete cake.store.latitude;
      delete cake.store.longitude;
    });

    return cakes;
  }
}
