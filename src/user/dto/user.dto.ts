import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, IsOptional } from "class-validator";
// import { CreateProfileDto } from "src/profile/dto/create-profile.dto";

export class UserDto{
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

    @IsOptional()
    role: string;

    // @IsOptional()
    // profile: CreateProfileDto | null;
}