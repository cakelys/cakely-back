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
}
