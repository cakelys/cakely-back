import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KakaoMapClient {
  async convertCoordinatesToAddress(
    latitude: number,
    longitude: number,
  ): Promise<{
    roadAddress: string;
    address: string;
  } | null> {
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}&input_coord=WGS84`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
      },
    });

    try {
      const roadAddress = response.data.documents[0].road_address.address_name;
      const address = response.data.documents[0].address.address_name;
      return {
        roadAddress,
        address,
      };
    } catch (e) {
      return null;
    }
  }

  async convertAddressToCoordinates(
    address: string,
  ): Promise<{ latitude: number; longitude: number | null }> {
    const url = `https://dapi.kakao.com/v2/local/search/address.json`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
      },
      params: {
        query: address,
      },
    });

    try {
      const latitude = parseFloat(response.data.documents[0].y);
      const longitude = parseFloat(response.data.documents[0].x);
      return { latitude, longitude };
    } catch (e) {
      return null;
    }
  }
}
