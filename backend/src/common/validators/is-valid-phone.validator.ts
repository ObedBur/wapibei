import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidPhoneNumber', async: false })
export class IsValidPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(phone: string): boolean {
    if (!phone) return false;
    // Strip all spaces, dashes, dots, parentheses
    const cleaned = phone.replace(/[\s\-.\(\)]/g, '');
    // Accept: +243XXXXXXXXX (12 chars) or 0XXXXXXXXX (10 chars)
    return /^\+243[0-9]{9}$/.test(cleaned) || /^0[0-9]{9}$/.test(cleaned);
  }

  defaultMessage(): string {
    return 'Numéro invalide. Format: +243XXXXXXXXX ou 0XXXXXXXXX (10 chiffres)';
  }
}

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPhoneNumberConstraint,
    });
  };
}

