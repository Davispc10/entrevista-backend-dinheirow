import {
    JsonController,
    Get,
    Param,
    Put,
    Post,
    Body,
} from 'routing-controllers';
import { FlightsService } from '../../application/flights.service';

@JsonController('/flights', { transformResponse: false })
export default class FlightsController {
    private _flightsService: FlightsService;

    constructor() {
        this._flightsService = new FlightsService();
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
        const data = await this._flightsService.addFlight(flight);
        return {
            status: 200,
            data,
        };
    }
}
