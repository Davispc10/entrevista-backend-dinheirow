import {
    JsonController,
    Get,
    Param,
    Put,
    Post,
    Body,
} from 'routing-controllers';
import { PassengersService } from '../../application/passengers.service';

@JsonController('/passengers', { transformResponse: false })
export default class PassengersController {
    private _passengersService: PassengersService;

    constructor() {
        this._passengersService = new PassengersService();
    }

    // add passenger
    @Post('')
    async addPassenger(
        @Body()
        passenger: {
            id: string,
            name: string,
            email: string,
            gender: string
        },
    ) {
        const data = await this._passengersService.addPassenger(passenger);
        return {
            status: 200,
            data,
        };
    }

    @Post('/ticket')
    async addTicket(
        @Body()
        ticket: {
            ownerId: string,
            flightId: string,
            price: string,
            departure: string,
            arrival: string,
            type: string,
        },
    ) {
        const data = await this._passengersService.addTicket(ticket);
        return {
            status: 200,
            data,
        };
    }
}
