import { Controller, Get, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';
import { validateRequiredField } from './utils/validation-utils';
import { AppAvailability } from './utils/app-availability.enum';

@Controller({ version: ['1', VERSION_NEUTRAL] })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  getAppStatus(
    @Query('os') os: string,
    @Query('version') version: string,
  ): { availability: number; os: string; version: string } {
    validateRequiredField('os', os);
    validateRequiredField('version', version);

    const serverStatus = AppAvailability.Maintenance;

    const status = this.appService.getAppStatus(os, version, serverStatus);

    return {
      availability: status.availability,
      os: os,
      version: version,
    };
  }
}
