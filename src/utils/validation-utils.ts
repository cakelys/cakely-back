import { BadRequestException } from '@nestjs/common';

const validSortByValues = ['latest', 'popular', 'distance'];

export function validateSortBy(sortBy: string): void {
  if (!validSortByValues.includes(sortBy)) {
    throw new BadRequestException(
      `Invalid sortBy value. Allowed values are: ${validSortByValues.join(
        ', ',
      )}.`,
    );
  }
}

export function setDefaultSort(sortBy: string): string {
  if (!sortBy) {
    return 'popular';
  }
  return sortBy;
}

export function validateCoordinates(latitude: string, longitude: string): void {
  if (!latitude || !longitude) {
    throw new BadRequestException('latitude and longitude are required.');
  }
}

export function validateRequiredField(field: string, value: any): void {
  if (!value) {
    throw new BadRequestException(`${field} is required.`);
  }
}

export function setSortCriteria(sortBy: string): string {
  if (sortBy === 'popular') {
    return 'popularity';
  } else if (sortBy === 'distance') {
    return 'distance';
  }
  return 'createdDate';
}
