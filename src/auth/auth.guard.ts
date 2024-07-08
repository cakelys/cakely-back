// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { FirebaseService } from './firebase.service';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private readonly firebaseService: FirebaseService) {}

//   // uid를 request에 포함한다.
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const accessToken = request.headers['authorization'];
//     if (accessToken) {
//       const uid = await this.firebaseService.verifyAccessToken(accessToken);
//       if (uid === 'Invalid token') {
//         return false;
//       }
//       const isValidUser = await this.firebaseService.validateUser(uid);
//       if (!isValidUser) {
//         throw new UnauthorizedException();
//       }
//       request.userId = uid; // request에 user id 설정 -> request에 따로 추가할 필요없음. param으로 올 것.
//       return true;
//     } else {
//       throw new UnauthorizedException();
//     }
//   }
// }
