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
      const userId = await this.firebaseService.verifyAccessToken(accessToken);
      if (userId === 'Invalid token') {
        return false;
      }
      const isValidUser = await this.firebaseService.validateUser(userId);
      if (!isValidUser) {
        throw new UnauthorizedException();
      }
      request.userId = userId;
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
