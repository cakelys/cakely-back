import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Post('login')
  logIn(@Req() request): void {
    const uid = request.userId;
    this.usersService.logIn(uid);
  }

  @Post('signin')
  signIn(@Req() request) {
    const accessToken = request.headers['authorization'];
    return this.usersService.signIn(accessToken);
  }

  @UseGuards(AuthGuard)
  @Get('my')
  async getUserInfo(@Req() request) {
    const uid = request.userId;
    const result = await this.usersService.getUserInfo(uid);
    return result;
  }
}
