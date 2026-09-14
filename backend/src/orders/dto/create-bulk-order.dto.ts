import { IsEmail, IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, Min, Validate, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { IsValidPhoneNumber, IsValidPhoneNumberConstraint } from '../../common/validators/is-valid-phone.validator';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateBulkOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

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
