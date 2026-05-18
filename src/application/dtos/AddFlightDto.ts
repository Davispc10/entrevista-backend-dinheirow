import { IsString, Matches, IsIn } from 'class-validator'

export class AddFlightDto {
    @Matches(/^[A-Z]{3}-\d{3}$/)
    code!: string

    @IsString()
    origin!: string

    @IsString()
    destination!: string

    @IsIn(['on time', 'delayed', 'cancelled'])
    status!: string
}
