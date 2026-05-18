import { IsString, IsEmail } from 'class-validator'

export class CreatePassengerDto {
    @IsString()
    id!: string

    @IsString()
    name!: string

    @IsEmail()
    email!: string

    @IsString()
    gender!: string
}
