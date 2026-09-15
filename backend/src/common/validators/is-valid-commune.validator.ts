import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { LocationService } from '../services/location.service';

@ValidatorConstraint({ name: 'IsValidCommune', async: false })
export class IsValidCommuneConstraint implements ValidatorConstraintInterface {
  private readonly locationService = new LocationService();

  validate(commune: string, args: ValidationArguments): boolean {
    const province = (args.object as any).province;
    if (!province || !commune) return false;
    
    return this.locationService.isValidCommune(province, commune);
  }

  defaultMessage(args: ValidationArguments): string {
    const province = (args.object as any).province;
    if (!province) return 'Province manquante';
    
    const communes = this.locationService.getCommunes(province);
    return `Commune invalide pour ${province}. Communes valides: ${communes.join(', ')}`;
  }
}

export function IsValidCommune(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCommuneConstraint,
    });
  };
}

