import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsOptional,
  Validate
} from 'class-validator';
import { Transform } from 'class-transformer';
import { 
  IsValidPhoneNumberConstraint,
  IsValidProvinceConstraint,
  IsValidCommuneConstraint,
  IsBoutiqueRequiredForVendorConstraint,
  IsStrongPasswordConstraint
} from '../../common/validators';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsStrongPasswordConstraint)
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidPhoneNumberConstraint)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidProvinceConstraint)
  province!: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidCommuneConstraint)
  commune!: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @Validate(IsBoutiqueRequiredForVendorConstraint)
  boutiqueName?: string;
  
  @IsEnum(UserRole) 
  @IsNotEmpty()
  role!: UserRole; 

  @IsString()
  @IsOptional()
  kycStatus?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => ['fr', 'en', 'sw'].includes(value) ? value : 'fr')
  language?: string;
}

