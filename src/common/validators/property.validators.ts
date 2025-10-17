import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidPropertyType(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidPropertyType',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const validTypes = ['house', 'apartment', 'condo', 'townhouse', 'land', 'office', 'retail'];
                    return typeof value === 'string' && validTypes.includes(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be one of: house, apartment, condo, townhouse, land, office, retail`;
                }
            },
        });
    };
}

export function IsValidPropertyStatus(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidPropertyStatus',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const validStatuses = ['for rent', 'for sale', 'sold', 'rented'];
                    return typeof value === 'string' && validStatuses.includes(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be one of: for rent, for sale, sold, rented`;
                }
            },
        });
    };
}

export function IsValidCategory(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidCategory',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const validCategories = ['residential', 'commercial', 'industrial', 'mixed-use'];
                    return typeof value === 'string' && validCategories.includes(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be one of: residential, commercial, industrial, mixed-use`;
                }
            },
        });
    };
}