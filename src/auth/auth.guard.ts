import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization'];
    if (accessToken) {
      const uid = await this.firebaseService.verifyAccessToken(accessToken);
      if (uid === 'Invalid token') {
        return false;
      }
      const isValidUser = await this.firebaseService.validateUser(uid);
      if (!isValidUser) {
        throw new UnauthorizedException();
      }
      request.userId = uid;
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
