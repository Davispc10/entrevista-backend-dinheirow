import { JsonController, Post, Delete, Param, Body } from 'routing-controllers'
import { FlightsService } from '../../application/flights.service'
import { CreatePassengerDto } from '../../application/dtos/CreatePassengerDto'

@JsonController('/passengers', { transformResponse: false })
export default class PassengersController {
    private _flightsService: FlightsService

    constructor() {
        this._flightsService = new FlightsService()
    }

    @Post('')
    async create(@Body() dto: CreatePassengerDto) {
        return {
            status: 201,
            data: await this._flightsService.addPassenger(dto),
        }
    }

    @Delete('/:id')
    async remove(@Param('id') id: string) {
        return {
            status: 200,
            data: await this._flightsService.removePassenger(id),
        }
    }
}
