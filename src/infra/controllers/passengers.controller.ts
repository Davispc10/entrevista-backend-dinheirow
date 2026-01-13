import {
    JsonController,
    Get,
    Param,
    Post,
    Body,
    HttpCode,
} from 'routing-controllers'
import { PassengersService } from '../../application/passengers.service'
import { randomUUID } from 'crypto'

@JsonController('/passengers', { transformResponse: false })
export default class PassengersController {
    private readonly _passengersService: PassengersService

    constructor() {
        this._passengersService = new PassengersService()
    }

    @Post('')
    @HttpCode(201)
    async addPassenger(
        @Body()
        passenger: {
            name: string
            email: string
            gender: string
        }
    ) {
        const passengerWithId = {
            id: randomUUID(),
            ...passenger,
        }

        return {
            status: 201,
            data: await this._passengersService.addPassenger(passengerWithId),
        }
    }

    @Get('/:id')
    async getById(@Param('id') id: string) {
        return {
            status: 200,
            data: await this._passengersService.getPassengerById(id),
        }
    }

    @Post('/:id/flights/:flightCode')
    @HttpCode(201)
    async addPassengerToFlight(
        @Param('id') id: string,
        @Param('flightCode') flightCode: string
    ) {
        return {
            status: 201,
            data: await this._passengersService.addPassengerToFlight(
                id,
                flightCode
            ),
        }
    }
}
