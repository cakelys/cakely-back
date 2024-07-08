// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { getAuth } from 'firebase-admin/auth';
// import { Model } from 'mongoose';
// import { AuthGetUserInfoDto } from './dto/auth-get-user-info.dto';
// import { User } from 'src/users/entities/user.entity';

// @Injectable()
// export class FirebaseService {
//   constructor(
//     @InjectModel(User.name) private readonly MemberModel: Model<User>,
//   ) {}
//   // 토큰을 받으면 firebase에 접근해서 유효한 토큰인지 확인하고 유저의 uid를 반환하는 함수
//   async verifyAccessToken(accessToken: string): Promise<string> {
//     if (!accessToken.startsWith('Bearer ')) {
//       console.log('Invalid token');
//       throw new UnauthorizedException();
//       // return 'Invalid token';
//     }

//     try {
//       const parsedAccessToken = accessToken.substring(7, accessToken.length);
//       // console.log('accessToken:', accessToken);
//       const decodedToken = await getAuth().verifyIdToken(parsedAccessToken);
//       // console.log('decodedToken:', decodedToken);
//       const uid = decodedToken.uid;
//       // console.log('uid:', uid);
//       return uid;
//     } catch (error) {
//       console.log(error);
//       throw new UnauthorizedException();
//       // return 'Invalid token';
//     }
//   }

//   // mongodb에서 사용자가 있는지 확인하는 함수
//   async validateUser(uid: string): Promise<boolean> {
//     // mongodb에서 uid를 검색해서 있으면 true, 없으면 false를 반환
//     const memberInfo = await this.MemberModel.findOne(
//       { uid: uid },
//       { _id: 0, member_name: 1, member_image: 1, status: 1 }, // 원하는 필드만 가져오기
//     ).exec();

//     if (memberInfo === null) {
//       return false;
//     }
//     if (memberInfo.status === '탈퇴') {
//       return false;
//     }
//     return true;
//   }

//   async getUserInfoByAccessToken(
//     accessToken: string,
//   ): Promise<AuthGetUserInfoDto | string> {
//     if (!accessToken.startsWith('Bearer ')) {
//       // console.log('Invalid token');
//       throw new UnauthorizedException();
//       // return 'Invalid token';
//     }

//     try {
//       const parsedAccessToken = accessToken.substring(7, accessToken.length);
//       const decodedToken = await getAuth().verifyIdToken(parsedAccessToken);
//       // console.log('decodedToken:', decodedToken);
//       const uid = decodedToken.uid;
//       const email = decodedToken.email;
//       const userName = decodedToken.name;
//       const userImage = decodedToken.picture;
//       return new AuthGetUserInfoDto(uid, email, userName, userImage);
//     } catch (error) {
//       throw new UnauthorizedException();
//       // return 'Invalid token';
//     }
//   }

//   // 사용자 삭제 함수
//   async deleteUser(uid: string) {
//     try {
//       await getAuth().deleteUser(uid);
//       // 사용자 삭제 성공 처리
//     } catch (error) {
//       // 사용자 삭제 실패 처리
//       console.error('사용자 삭제 실패', error);
//     }
//   }
// }
