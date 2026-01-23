import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePassengerDTO {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    gender: string;
}
