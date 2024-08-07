import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel('StoreLike') private readonly StoreLikeModel: Model<any>,
  ) {}

  async getNewCakesInLikedStores(uid: string) {
    const newCakesInLikedStores = await this.StoreLikeModel.aggregate([
      {
        $match: {
          userId: new ObjectId(uid),
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
          preserveNullAndEmptyArrays: true,
        },
      },
      // 케이크 가게 1개 랜덤 선택
      {
        $sample: { size: 1 },
      },
      {
        $lookup: {
          from: 'cakes',
          localField: 'store._id',
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
        $sort: { 'cakes.createdDate': -1 },
      },
      {
        $limit: 6,
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: 'cakes._id',
          foreignField: 'cakeId',
          as: 'cakeLikes',
        },
      },
      {
        $unwind: {
          path: '$cakeLikes',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          'store.id': '$store._id',
          'store.name': '$store.name',
          'store.logo': '$store.logo',
          cake: {
            id: '$cakes._id',
            photo: { $arrayElemAt: ['$cakes.photos', 0] },
            isLiked: { $cond: { if: '$cakeLikes', then: true, else: false } },
          },
        },
      },
    ]);
    return { newCakes: newCakesInLikedStores };
  }

  async getAllLikedStores(
    uid: string,
    sortCriteria: string,
    userLatitude: number,
    userLongitude: number,
    page: number,
  ): Promise<any> {
    const pageSize = 10; // 한 페이지에 표시할 항목 수
    const skip = (page - 1) * pageSize; // 페이지 번호에 따라 스킵할 항목 수 계산

    const allLikedStores = await this.StoreLikeModel.aggregate([
      {
        $match: {
          userId: new ObjectId(uid),
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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          distance: {
            $multiply: [
              6371, // 지구의 반지름
              {
                $sqrt: {
                  $add: [
                    {
                      $pow: [
                        {
                          $subtract: ['$store.latitude', userLatitude],
                        },
                        2,
                      ],
                    },
                    {
                      $pow: [
                        {
                          $subtract: ['$store.longitude', userLongitude],
                        },
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
        $addFields: {
          sortField: {
            $switch: {
              branches: [
                {
                  case: { $eq: [sortCriteria, 'createdDate'] },
                  then: '$createdDate',
                },
                {
                  case: { $eq: [sortCriteria, 'popularity'] },
                  then: '$store.popularity',
                },
                {
                  case: { $eq: [sortCriteria, 'distance'] },
                  then: '$distance',
                },
              ],
              default: '$store.popularity',
            },
          },
        },
      },
      {
        $sort: {
          sortField: sortCriteria === 'distance' ? 1 : -1,
        },
      },
      {
        $project: {
          _id: 0,
          store: {
            id: '$store._id',
            name: '$store.name',
            address: '$store.address',
            distance: '$distance',
            logo: '$store.logo',
          },
        },
      },
      {
        $addFields: {
          'store.isLiked': true,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    return { likedStores: allLikedStores };
  }
}
