import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LocationService } from '../services/location.service';

@ValidatorConstraint({ name: 'IsValidProvince', async: false })
export class IsValidProvinceConstraint implements ValidatorConstraintInterface {
  private readonly locationService = new LocationService();

  validate(province: string): boolean {
    if (!province) return false;
    return this.locationService.isValidProvince(province);
  }

  defaultMessage(): string {
    const provinces = this.locationService.getAllProvinces();
    return `Province invalide. Provinces valides: ${provinces.join(', ')}`;
  }
}

export function IsValidProvince(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidProvinceConstraint,
    });
  };
}

