import {
    JsonController,
    Get,
    Param,
    Put,
    Post,
    Body,
} from 'routing-controllers';
import { FlightsService } from '../../application/flights.service';
import { PassengersService } from '../../application/passengers.service';

@JsonController('/flights', { transformResponse: false })
export default class FlightsController {
    private _flightsService: FlightsService;
    private _passengersService: PassengersService;

    constructor() {
        this._flightsService = new FlightsService();
        this._passengersService = new PassengersService();
    }

    @Get('')
    async getAll() {
        return {
            status: 200,
            data: await this._flightsService.getFlights(),
        };
    }

    @Get('/:code')
    async getByCode(@Param('code') code: string) {
        return {
            status: 200,
            data: await this._flightsService.getFlightByCode(code),
        };
    }

    @Put('/:code')
    async updateFlightStatus(@Param('code') code: string) {
        return {
            status: 201,
            data: await this._flightsService.updateFlightStatus(code),
        };
    }

    // add flight
    @Post('')
    async addFlight(
        @Body()
        flight: {
            code: string;
            origin: string;
            destination: string;
            status: string;
        },
    ) {
        return {
            status: 200,
            data: await this._flightsService.addFlight(flight),
        };
    }

    @Post('/:code/passengers')
    async addPassengerToFlight(
        @Param('code') code: string,
        @Body()
        payload: {
            passengerId: string;
        }
    ) {
        return {
            status: 200,
            data: await this._passengersService.linkPassengerToFlight(
                code,
                payload && payload.passengerId
            ),
        };
    }
}
