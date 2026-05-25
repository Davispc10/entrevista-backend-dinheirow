import { Body, JsonController, Post } from 'routing-controllers'
import { PassengersService } from '../../application/passengers.service'
import { CreatePassengerData } from '../../domain/entities/Passenger'

@JsonController('/passengers', { transformResponse: false })
export default class PassengersController {
    private _passengersService: PassengersService

    constructor() {
        this._passengersService = new PassengersService()
    }

    @Post('')
    async createPassenger(
        @Body()
        passenger: CreatePassengerData
    ) {
        return {
            status: 200,
            data: await this._passengersService.createPassenger(passenger),
        }
    }
}
