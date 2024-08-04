import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class CakesRepository {
  constructor(@InjectModel('Cake') private readonly cakeModel: Model<any>) {}

  // 오늘의 케이크 데이터를 가져오는 함수
  async getTodayCakesData(uid: string): Promise<any> {
    const todays = await this.cakeModel.aggregate([
      {
        $lookup: {
          from: 'cakeLikes',
          localField: '_id',
          foreignField: 'cakeId',
          as: 'likes',
        },
      },
      {
        $unwind: {
          path: '$likes',
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
        $lookup: {
          from: 'storeLikes',
          localField: 'store._id',
          foreignField: 'storeId',
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
          _id: 0,
          cake: {
            id: '$_id',
            photo: { $arrayElemAt: ['$photos', 0] },
            isLiked: {
              $cond: {
                if: {
                  $eq: ['$likes.userId', new ObjectId(uid)],
                },
                then: true,
                else: false,
              },
            },
            createdDate: '$createdDate',
          },
          'store.isLiked': {
            $cond: {
              if: {
                $eq: ['$result.userId', new ObjectId(uid)],
              },
              then: true,
              else: false,
            },
          },
          'store.id': '$store._id',
          'store.name': 1,
          'store.logo': 1,
          'store.address': 1,
        },
      },
      {
        $sort: {
          'cake.createdDate': -1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    return { todays };
  }

  // 카테고리별 케이크 데이터를 가져오는 함수
  async getCakeByCategory(
    uid: string,
    category: string,
    sortCriteria: string,
    userLatitude: number,
    userLongitude: number,
    page: number,
  ): Promise<any> {
    const pageSize = 10; // 한 페이지에 표시할 항목 수
    const skip = (page - 1) * pageSize; // 페이지 번호에 따라 스킵할 항목 수 계산

    const categoryCakes = await this.cakeModel.aggregate([
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
        $addFields: {
          distance: {
            $multiply: [
              6371, // Earth radius in kilometers
              {
                $sqrt: {
                  $add: [
                    {
                      $pow: [
                        { $subtract: ['$store.latitude', userLatitude] },
                        2,
                      ],
                    },
                    {
                      $pow: [
                        { $subtract: ['$store.longitude', userLongitude] },
                        2,
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $sort: {
          [sortCriteria]: sortCriteria === 'distance' ? 1 : -1,
        },
      },
      {
        $project: {
          _id: 0,
          cake: {
            id: '$_id',
            photo: { $arrayElemAt: ['$photos', 0] },
            isLiked: {
              $cond: {
                if: {
                  $eq: ['$result.userId', new ObjectId(uid)],
                },
                then: true,
                else: false,
              },
            },
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ]);

    return { category, categoryCakes: categoryCakes };
  }

  async getRecommendCakes(
    uid: string,
    sortCriteria: string,
    userLatitude: number,
    userLongitude: number,
    page: number,
  ): Promise<any> {
    const pageSize = 10; // 한 페이지에 표시할 항목 수
    const skip = (page - 1) * pageSize; // 페이지 번호에 따라 스킵할 항목 수 계산

    const recommendCakes = await this.cakeModel.aggregate([
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
          size: 100,
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
        $addFields: {
          distance: {
            $multiply: [
              6371, // Earth radius in kilometers
              {
                $sqrt: {
                  $add: [
                    {
                      $pow: [
                        { $subtract: ['$store.latitude', userLatitude] },
                        2,
                      ],
                    },
                    {
                      $pow: [
                        { $subtract: ['$store.longitude', userLongitude] },
                        2,
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $sort: {
          [sortCriteria]: sortCriteria === 'distance' ? 1 : -1,
        },
      },
      {
        $project: {
          _id: 0,
          cake: {
            id: '$_id',
            // photos: 1,
            photo: { $arrayElemAt: ['$photos', 0] },
            isLiked: {
              $cond: {
                if: {
                  $eq: ['$result.userId', new ObjectId(uid)],
                },
                then: true,
                else: false,
              },
            },
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ]);

    return { recommendCakes };
  }

  async getCakeByIdData(
    uid: string,
    cakeId: string,
    userLatitude: number,
    userLongitude: number,
  ): Promise<any> {
    const cake = await this.cakeModel.aggregate([
      {
        $match: {
          _id: new ObjectId(cakeId),
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
        $addFields: {
          likesCount: { $size: '$result' }, // Calculate the number of likes
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
        $lookup: {
          from: 'storeLikes',
          localField: 'store._id',
          foreignField: 'storeId',
          as: 'storeLikes',
        },
      },
      {
        $unwind: {
          path: '$storeLikes',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          distance: {
            $multiply: [
              6371, // Earth radius in kilometers
              {
                $sqrt: {
                  $add: [
                    {
                      $pow: [
                        { $subtract: ['$store.latitude', userLatitude] },
                        2,
                      ],
                    },
                    {
                      $pow: [
                        { $subtract: ['$store.longitude', userLongitude] },
                        2,
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          cake: {
            // photos: 1,
            id: '$_id',
            photo: { $arrayElemAt: ['$photos', 0] },
            tags: 1,
            isLiked: {
              $cond: {
                if: {
                  $eq: ['$result.userId', new ObjectId(uid)],
                },
                then: true,
                else: false,
              },
            },
            likesCount: '$likesCount',
          },
          'store.isLiked': {
            $cond: {
              if: {
                $eq: ['$result.userId', new ObjectId(uid)],
              },
              then: true,
              else: false,
            },
          },
          'store.id': '$store._id',
          'store.name': 1,
          'store.logo': 1,
          'store.address': 1,
          'store.distance': '$distance',
          'store.siteUrl': 1,
        },
      },
    ]);

    if (cake.length <= 0) {
      throw new NotFoundException('해당 케이크를 찾을 수 없습니다.');
    }
    return { cakeDetailWithStore: cake[0] };
  }

  async getCakesByIdData(uid: string, cakeIds: string[]): Promise<any> {
    const cakes = await this.cakeModel.aggregate([
      {
        $match: {
          _id: { $in: cakeIds.map((cakeId) => new ObjectId(cakeId)) },
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
          _id: 0,
          cake: {
            id: '$_id',
            photo: { $arrayElemAt: ['$photos', 0] },
            isLiked: {
              $cond: {
                if: {
                  $eq: ['$result.userId', new ObjectId(uid)],
                },
                then: true,
                else: false,
              },
            },
          },
        },
      },
    ]);

    return { cakes };
  }

  // 새 케이크 데이터를 추가하는 함수
  async addCake(cakeData: any): Promise<any> {
    const newCake = new this.cakeModel(cakeData);
  }

  // 케이크 데이터를 업데이트하는 함수
  async updateCake(cakeId: string, updateData: any): Promise<any> {
    return this.cakeModel
      .findByIdAndUpdate(cakeId, updateData, { new: true })
      .exec();
  }

  // 케이크 데이터를 삭제하는 함수
  async deleteCake(cakeId: string): Promise<any> {
    return this.cakeModel.findByIdAndDelete(cakeId).exec();
  }
}
