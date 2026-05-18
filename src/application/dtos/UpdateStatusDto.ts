import { IsIn } from 'class-validator'

export class UpdateStatusDto {
    @IsIn(['on time', 'delayed', 'cancelled'])
    status!: string
}
