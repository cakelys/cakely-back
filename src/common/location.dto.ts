export class LocationDto {
  type: 'Point';
  coordinates: [number, number];

  constructor(latitude: number, longitude: number) {
    this.coordinates = [longitude, latitude];
  }
}
