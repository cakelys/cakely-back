import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KakaoMapClient {
  async convertCoordinatesToAddress(
    latitude: number,
    longitude: number,
  ): Promise<string> {
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}&input_coord=WGS84`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
      },
    });

    try {
      const address = response.data.documents[0].address.address_name;
      return address;
    } catch (e) {
      return '';
    }
  }
}
