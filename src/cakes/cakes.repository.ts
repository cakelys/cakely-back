import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Store } from 'src/stores/entities/store.entity';
import { Cake } from './entities/cake.entity';

@Injectable()
export class CakesRepository {
  constructor(
    @InjectModel('Cake') private readonly cakeModel: Model<Cake>,
    @InjectModel('Store') private readonly storeModel: Model<Store>,
  ) {}

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
        $project: {
          'cake.createdDate': 0,
        },
      },
      {
        $limit: 5,
      },
    ]);

    return todays;
  }

  async getCakeByCategory(
    uid: string,
    category: string,
    sortCriteria: string,
    userLatitude: number,
    userLongitude: number,
    page: number,
  ): Promise<any> {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

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
              6371,
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
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

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
              6371,
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
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ]);

    return recommendCakes;
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
          likesCount: { $size: '$result' },
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
              6371,
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
            id: '$_id',
            photo: { $arrayElemAt: ['$photos', 0] },
            tags: '$tags',
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
          'store.siteUrl': { $arrayElemAt: ['$store.siteUrl', 0] },
        },
      },
    ]);

    if (cake.length <= 0) {
      throw new NotFoundException('해당 케이크를 찾을 수 없습니다.');
    }

    const recommendedCakes = await this.cakeModel.aggregate([
      {
        $sample: { size: 10 },
      },
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
        $addFields: {
          isLiked: {
            $cond: {
              if: {
                $eq: [new ObjectId(uid), '$likes.userId'],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          photo: { $arrayElemAt: ['$photos', 0] },
          isLiked: '$isLiked',
        },
      },
    ]);

    return { ...cake[0], recommendedCakes };
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
    ]);

    return cakes;
  }

  async getCategories(categoryListJsonData: any): Promise<any> {
    const categoriesWithPhotos = await Promise.all(
      categoryListJsonData.map(async (category) => {
        const cake = await this.cakeModel.aggregate([
          {
            $match: {
              categories: category.name,
            },
          },
          {
            $sort: {
              createdDate: -1,
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: 0,
              photo: { $arrayElemAt: ['$photos', 0] },
            },
          },
        ]);

        return {
          ...category,
          photo: cake?.[0]?.photo ? cake?.[0]?.photo : null,
        };
      }),
    );

    return categoriesWithPhotos;
  }

  async createCake(createCakeDto: any) {
    const storeInstarId = createCakeDto['storeInstarId'];
    const store = await this.storeModel.findOne({ instarId: storeInstarId });

    if (!store) {
      throw new NotFoundException('가게를 찾을 수 없습니다.');
    }

    createCakeDto['storeId'] = store._id;

    const newCake = await this.cakeModel.create(createCakeDto);
    return newCake;
  }

  async getWorldCupCakesData(): Promise<any> {
    const worldCupCakes = await this.cakeModel.aggregate([
      {
        $sample: { size: 8 },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: '_id',
          foreignField: 'cakeId',
          as: 'likes',
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          photo: { $arrayElemAt: ['$photos', 0] },
        },
      },
    ]);

    return worldCupCakes;
  }

  async getWorldCupWinnerData(uid: string, cakeId: string) {
    const worldCupWinner = await this.cakeModel.aggregate([
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
    ]);

    return worldCupWinner[0];
  }
}
