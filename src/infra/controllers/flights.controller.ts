import {
    JsonController,
    Get,
    Param,
    Put,
    Post,
    Delete,
    Body,
    NotFoundError,
} from 'routing-controllers'
import { FlightsService } from '../../application/flights.service'
import { AddFlightDto } from '../../application/dtos/AddFlightDto'
import { AddPassengerDto } from '../../application/dtos/AddPassengerDto'

@JsonController('/flights', { transformResponse: false })
export default class FlightsController {
    private _flightsService: FlightsService

    constructor() {
        this._flightsService = new FlightsService()
    }

    @Get('')
    async getAll() {
        return {
            status: 200,
            data: await this._flightsService.getFlights(),
        }
    }

    @Get('/:code')
    async getByCode(@Param('code') code: string) {
        return {
            status: 200,
            data: await this._flightsService.getFlightByCode(code),
        }
    }

    @Put('/:code')
    async updateFlightStatus(
        @Param('code') code: string,
        @Body() body: { status: string }
    ) {
        return {
            status: 201,
            data: await this._flightsService.updateFlightStatus(
                code,
                body.status
            ),
        }
    }

    // add flight
    @Post('')
    async addFlight(
        @Body()
        flight: {
            code: string
            origin: string
            destination: string
            status: string
        }
    ) {
        return {
            status: 200,
            data: await this._flightsService.addFlight(flight),
        }
    }

    // Add passenger to flight
    @Post('/:code/passengers')
    async addPassenger(
        @Param('code') code: string,
        @Body() dto: AddPassengerDto
    ) {
        const ticket = await this._flightsService.addPassengerToFlight(
            code,
            dto
        )
        return { status: 201, data: ticket }
    }

    // Remove passenger from flight
    @Delete('/:code/passengers/:passengerId')
    async removePassenger(
        @Param('code') code: string,
        @Param('passengerId') passengerId: string
    ) {
        const result = await this._flightsService.removePassengerFromFlight(
            code,
            passengerId
        )
        return { status: 200, data: result }
    }
}
