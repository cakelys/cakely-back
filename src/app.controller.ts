import {
  BadRequestException,
  Controller,
  Get,
  Query,
  ValidationPipe,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { AppService } from './app.service';
import { validateRequiredField } from './utils/validation-utils';
import { AppAvailability } from './utils/app-availability.enum';
import { KakaoMapClient } from './clients/kakao.map.client';
import { GetAddressQueryDto } from './common/get-address-query.dto';

@Controller({ version: ['1', VERSION_NEUTRAL] })
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly kakaoMapClient: KakaoMapClient,
  ) {}

  @Get('status')
  async getAppStatus(
    @Query('os') os: string,
    @Query('version') version: string,
  ): Promise<{ availability: number; os: string; version: string }> {
    validateRequiredField('os', os);
    validateRequiredField('version', version);

    const serverStatus = AppAvailability.Normal;

    const status = await this.appService.getAppStatus(
      os,
      version,
      serverStatus,
    );

    return {
      availability: status.availability,
      os: os,
      version: version,
    };
  }

  @Get('location')
  async getAddressByCoordinates(
    @Query(ValidationPipe) query: GetAddressQueryDto,
  ) {
    const { latitude, longitude } = query;
    const result = await this.kakaoMapClient.convertCoordinatesToAddress(
      latitude,
      longitude,
    );

    if (!result) {
      throw new BadRequestException(
        '주소값이 유효하지 않습니다. 다른 주소로 시도해주세요.',
      );
    }

    const { roadAddress, address } = result;

    return {
      roadAddress,
      address,
    };
  }
}
