import { IsEmail, IsNotEmpty, IsString, IsUUID, Validate } from 'class-validator';
import { IsValidPhoneNumberConstraint } from '../../common/validators/is-valid-phone.validator';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @Validate(IsValidPhoneNumberConstraint)
  @IsNotEmpty()
  customerPhone: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;
}
