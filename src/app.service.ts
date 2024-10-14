import { Injectable } from '@nestjs/common';
import { AppAvailability } from './utils/app-availability.enum';

@Injectable()
export class AppService {
  getAppStatus(
    os: string,
    version: string,
    serverStatus: AppAvailability,
  ): { availability: number } {
    const validOsList = ['ios', 'android'];
    const validVersions = ['1.0.0'];

    const isOsValid = validOsList.includes(os);
    const isVersionValid = validVersions.includes(version);
    const isValid = isOsValid && isVersionValid;

    if (serverStatus === AppAvailability.Maintenance) {
      return { availability: AppAvailability.Maintenance };
    } else {
      if (isValid) {
        return { availability: AppAvailability.Normal };
      } else {
        return { availability: AppAvailability.ForceUpdateNeeded };
      }
    }
  }
}
