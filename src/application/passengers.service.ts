import { Database } from '../infra/databases/database_abstract';
import { DatabaseInstanceStrategy } from '../infra/databases/database';
import { FlightsService } from './flights.service';
import { Flight } from '../domain/entities/Flight';
import { FlightCode } from '../domain/value-objects/FlightCode';

export class PassengersService {
    private readonly _db: Database;
    private readonly _flightsService: FlightsService;

    constructor() {
        this._db = DatabaseInstanceStrategy.getInstance();
        this._flightsService = new FlightsService();
    }

    public async addPassenger(passenger: {
        id: string;
        name: string;
        email: string;
        gender: string;
    }) {
        const existingPassenger = await this._db.getPassengerByEmail(passenger.email);
        if (existingPassenger) {
            throw new Error(`Passenger with email ${passenger.email} already exists`);
        }

        return this._db.addPassenger(passenger);
    }

    public async getPassengerById(id: string) {
        const passenger = await this._db.getPassengerById(id);
        if (!passenger) {
            throw new Error(`Passenger with id ${id} not found`);
        }
        return passenger;
    }

    public async addPassengerToFlight(passengerId: string, flightCode: string) {
        const passenger = await this._db.getPassengerById(passengerId);
        if (!passenger) {
            throw new Error(`Passenger with id ${passengerId} not found`);
        }

        const flightData = await this._flightsService.getFlightByCode(flightCode);
        if (!flightData) {
            throw new Error(`Flight with code ${flightCode} not found`);
        }

        const flightCodeVO = new FlightCode(flightData.code);
        const flight = new Flight(
            flightCodeVO,
            flightData.origin,
            flightData.destination,
            flightData.status
        );

        if (!flight.canAddPassenger()) {
            throw new Error(`Cannot add passenger to cancelled flight ${flightCode}`);
        }

        const passengerAlreadyInFlight = await this._db.passengerExistsInFlight(passengerId, flightCode);

        if (passengerAlreadyInFlight) {
            throw new Error(`Passenger ${passengerId} is already in flight ${flightCode}`);
        }

        return this._db.addPassengerToFlight(passengerId, flightCode);
    }
}
