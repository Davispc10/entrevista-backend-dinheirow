import { IsString, IsIn } from 'class-validator'

export class AddPassengerDto {
    @IsString()
    passengerId!: string

    @IsIn(['premium', 'economy'])
    type!: 'premium' | 'economy'
}
