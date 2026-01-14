import { Database } from '../infra/databases/database_abstract';
import { DatabaseInstanceStrategy } from '../infra/databases/database';
import { ValidationError } from 'class-validator';

export class PassengersService {
    private readonly _db: Database;

    constructor() {
        this._db = DatabaseInstanceStrategy.getInstance();
    }

    // public async getFlights() {
    //     return this._db.getFlights();
    // }

    // public async updateFlightStatus(code: string) {
    //     // return this._db.updateFlightStatus(code);
    // }

    public async addPassenger(passenger: {
        id: string;
        name: string;
        email: string;
        gender: string;
    }) {
        return await this._db.addPassenger(passenger);
    }

    // public async getFlightByCode(code: string) {
    //     return this._db.getFlightByCode(code);
    // }

    public async addTicket(ticket: {
        ownerId: string,
        flightId: string,
        price: string,
        departure: string,
        arrival: string,
        type: string
    }) {
        const { flightId } = ticket;
        const flight = await this._db.getFlightByCode(flightId);
        if (flight.status === "cancelled") {
            throw new Error(`Flight ${flightId} is cancelled!`)
        }

        return await this._db.addTicket(ticket);
    }
}
