import { Module } from '@nestjs/common';
import { KakaoMapClient } from './kakao-map.client';

@Module({
  providers: [KakaoMapClient],
  exports: [KakaoMapClient],
})
export class KakaoMapModule {}
