import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto{
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    email: string;

    @IsNotEmpty()
    @MaxLength(24)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    password: string;

}