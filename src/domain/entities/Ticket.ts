import { FlightCode } from '../value-objects/FlightCode'
import { Passenger } from './Passenger'

export class Ticket {
    constructor(
        private owner: Passenger,
        private flightCode: FlightCode,
        private price: string,
        private departure: Date,
        private arrival: Date,
        private type: 'premium' | 'economy'
    ) {}

    belongsTo(passenger: Passenger) {
        return this.owner.equals(passenger)
    }
}
