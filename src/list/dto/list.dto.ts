import {
    IsNotEmpty, 
    IsString, 
    IsNumber, 
    IsArray, 
    IsOptional, 
    IsUUID,
    IsPositive,
    MaxLength,
    Min,
    Max,
    ValidateNested,
    IsObject,
    IsEmail
} from "class-validator";
import { Type } from "class-transformer";
import { IsValidPropertyType, IsValidPropertyStatus, IsValidCategory } from '../../common/validators/property.validators';
import { UserDto } from "src/user/dto/user.dto";

// Address DTO for nested object validation
export class AddressDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    street?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    state?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    zip?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    country?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    mapUrl?: string;
}

export class ContactDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(100)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    others?: string;
 
}
export class CreateListDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    code?: string;

    @IsOptional()
    @IsNotEmpty()
    userId?: string;

    @IsOptional()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(0)
    @Type(() => Number)
    price?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => AddressDto)
    address?: AddressDto;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(20)
    numBedroom?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(20)
    numBathroom?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    garage?: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    area?: string;

    @IsOptional()
    @IsNumber()
    @Min(1800)
    @Max(new Date().getFullYear())
    yearBuilt?: number;

    @IsOptional()
    @IsString()
    @IsValidCategory() // Using custom validator
    @MaxLength(50)
    category?: string;

    @IsOptional()
    @IsString()
    @IsValidPropertyType() // Using custom validator
    @MaxLength(50)
    propertyType?: string;

    @IsOptional()
    @IsString()
    @IsValidPropertyStatus() // Using custom validator
    @MaxLength(50)
    propertyStatus?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    inventoryStatus?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;

    // @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => UserDto)
    user?: UserDto;

}

export class UpdateListDto {
    // Same as CreateListDto but all fields optional
    @IsOptional()
    @IsString()
    @MaxLength(100)
    code?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => AddressDto)
    address?: AddressDto;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(20)
    numBedroom?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(20)
    numBathroom?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    garage?: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    area?: string;

    @IsOptional()
    @IsNumber()
    @Min(1800)
    @Max(new Date().getFullYear())
    yearBuilt?: number;

    @IsOptional()
    @IsString()
    @IsValidCategory()
    @MaxLength(50)
    category?: string;

    @IsOptional()
    @IsString()
    @IsValidPropertyType()
    @MaxLength(50)
    propertyType?: string;

    @IsOptional()
    @IsString()
    @IsValidPropertyStatus()
    @MaxLength(50)
    propertyStatus?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    inventoryStatus?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;
}

export class ListResponseDto {
    id: string;
    code?: string;
    userId: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
    address?: AddressDto;
    contact?: ContactDto;
    user?: UserDto;
    numBedroom?: number;
    numBathroom?: number;
    garage?: number;
    area?: string;
    yearBuilt?: number;
    category?: string;
    propertyType?: string;
    propertyStatus?: string;
    inventoryStatus?: string;
    rating?: number;
    createdAt: Date;
    updatedAt: Date;
}