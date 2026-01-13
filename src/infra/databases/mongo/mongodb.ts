import { Database } from '../database_abstract';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { FlightsModel } from './models/flights.model';
import { PassengersModel } from './models/passengers.model';
import { TicketsModel } from './models/tickets.model';

export class MongoStrategy extends Database {
    constructor() {
        super();
        this.getInstance();
    }

    private async getInstance() {
        const mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();

        const mongooseOpts = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        };

        const flights = [
            {
                code: 'TAM-123',
                origin: 'EZE',
                destination: 'LDN',
                status: 'on time',
            },
            {
                code: 'GOL-678',
                origin: 'CRC',
                destination: 'MIA',
                status: 'on time',
            },
        ];

        (async () => {
            await mongoose.connect(uri, mongooseOpts);
            await FlightsModel.create(flights);
        })();
    }

    public async getFlights() {
        return FlightsModel.find({});
    }

    public async addFlight(flight: {
        code: string;
        origin: string;
        destination: string;
        status: string;
    }) {
        return FlightsModel.create(flight)
    }

    public async getFlightByCode(code: string) {
        const flights = await FlightsModel.find({ code });
        if (flights.length > 1) {
            throw new Error(`Data integrity error: Multiple flights found with code ${code}`);
        }
        return flights.length > 0 ? flights[0] : null;
    }

    public async addPassenger(passenger: {
        id: string;
        name: string;
        email: string;
        gender: string;
    }): Promise<any> {
        return PassengersModel.create(passenger);
    }

    public async getPassengerById(id: string): Promise<any> {
        return PassengersModel.findOne({ id });
    }

    public async getPassengerByEmail(email: string): Promise<any> {
        return PassengersModel.findOne({ email });
    }

    public async addPassengerToFlight(passengerId: string, flightCode: string): Promise<any> {
        return TicketsModel.create({
            passenger_id: passengerId,
            flight_code: flightCode,
        });
    }

    public async getPassengersByFlight(flightCode: string): Promise<any> {
        const tickets = await TicketsModel.find({ flight_code: flightCode });
        const passengerIds = tickets.map(ticket => ticket.passenger_id);
        return PassengersModel.find({ id: { $in: passengerIds } });
    }

    public async passengerExistsInFlight(passengerId: string, flightCode: string): Promise<boolean> {
        const ticket = await TicketsModel.findOne({ passenger_id: passengerId, flight_code: flightCode });
        return ticket !== null;
    }
}
