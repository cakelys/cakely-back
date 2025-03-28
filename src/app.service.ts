import { Injectable } from '@nestjs/common';
import { AppAvailability } from './utils/app-availability.enum';

@Injectable()
export class AppService {
  async getAppStatus(
    os: string,
    version: string,
    serverStatus: AppAvailability,
  ): Promise<{ availability: number }> {
    const validOsList = ['ios', 'android'];

    const isOsValid = validOsList.includes(os);
    const versionPattern = /^(1|[2-9]\d*)\.(\d+)\.(\d+)$/;
    const isVersionValid = versionPattern.test(version);
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
