import { Database } from '../database_abstract';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { FlightsModel } from './models/flights.model';

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
    public addPassenger(passenger: { id: string; name: string; email: string; gender: string; }) {
        throw new Error('Method not implemented.');
    }
    public addTicket(ticket: { ownerId: string; flightId: string; price: string; departure: string; arrival: string; type: string; }) {
        throw new Error('Method not implemented.');
    }
}
