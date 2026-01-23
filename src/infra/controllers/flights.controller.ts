import {
    JsonController,
    Get,
    Param,
    Put,
    Post,
    Body,
    HttpCode,
    Res,
} from 'routing-controllers';
import { FlightsService } from '../../application/flights.service';
import { CreatePassengerDTO } from './dtos/CreatePassengerDTO';
import { Response } from 'express';

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
            status: 204,
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
    @HttpCode(201)
    async addPassenger(
        @Param('code') code: string,
        @Body() passengerData: CreatePassengerDTO,
        @Res() response: Response
    ) {
        try {
            const result = await this._flightsService.addPassenger(code, passengerData);
            
            return response.status(201).json({
                status: 201,
                data: result.passenger,
                reservation: {
                    reserved: result.seatReserved,
                    message: result.reservationMessage
                }
            });
        } catch (error) {
            if (error.message === 'Passenger already exists') {
                return response.status(400).json({
                    status: 400,
                    message: error.message
                });
            }
            
            return response.status(500).json({
                status: 500,
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
}
