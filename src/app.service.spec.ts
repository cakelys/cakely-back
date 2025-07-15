import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { AppAvailability } from './utils/app-availability.enum';

describe('AppService', () => {
  let appService: AppService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    appService = moduleRef.get<AppService>(AppService);
  });

  describe('getAppStatus()', () => {
    it('serverStatus가 Maintenance이면 무조건 Maintenance를 반환해야 한다', async () => {
      const result = await appService.getAppStatus(
        'ios',
        '1.2.3',
        AppAvailability.Maintenance,
      );
      expect(result).toEqual({ availability: AppAvailability.Maintenance });
    });

    it('os와 version이 모두 유효하면 Normal을 반환해야 한다', async () => {
      const result = await appService.getAppStatus(
        'android',
        '1.0.0',
        AppAvailability.Normal,
      );
      expect(result).toEqual({ availability: AppAvailability.Normal });
    });

    it('유효하지 않은 os가 주어지면 ForceUpdateNeeded를 반환해야 한다', async () => {
      const result = await appService.getAppStatus(
        'windows',
        '1.0.0',
        AppAvailability.Normal,
      );
      expect(result).toEqual({
        availability: AppAvailability.ForceUpdateNeeded,
      });
    });

    it('유효하지 않은 version이 주어지면 ForceUpdateNeeded를 반환해야 한다', async () => {
      const result = await appService.getAppStatus(
        'ios',
        'abc.def',
        AppAvailability.Normal,
      );
      expect(result).toEqual({
        availability: AppAvailability.ForceUpdateNeeded,
      });
    });

    it('os와 version이 모두 유효하지 않으면 ForceUpdateNeeded를 반환해야 한다', async () => {
      const result = await appService.getAppStatus(
        'win',
        '0',
        AppAvailability.Normal,
      );
      expect(result).toEqual({
        availability: AppAvailability.ForceUpdateNeeded,
      });
    });
  });
});
