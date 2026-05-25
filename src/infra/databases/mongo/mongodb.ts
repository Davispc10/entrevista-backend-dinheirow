import { Database } from '../database_abstract';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { FlightsModel } from './models/flights.model';
import { PassengersModel } from './models/passengers.model';
import { TicketsModel } from './models/tickets.model';
import {
    CreatePassengerData,
    Passenger,
    PassengerData,
} from '../../../domain/entities/Passenger';
import { TicketData } from '../../../domain/entities/Ticket';
import { CreateFlightData, Flight, FlightData } from '../../../domain/entities/Flight';

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
            {
                code: 'AZU-678',
                origin: 'LAX',
                destination: 'CGH',
                status: 'cancelled',
            },
        ];

        (async () => {
            await mongoose.connect(uri, mongooseOpts);
            await FlightsModel.create(flights);
        })();
    }

    public async getFlights(): Promise<FlightData[]> {
        return FlightsModel.find({});
    }

    public async addFlight(flight: CreateFlightData): Promise<FlightData> {
        return FlightsModel.findOneAndUpdate({ code: flight.code }, flight, {
            new: true,
            upsert: true,
        });
    }

    public async getFlightByCode(code: string): Promise<Flight | null> {
        const flights = await FlightsModel.find({ code }).lean();
        if (flights.length > 1) {
            throw new Error(`Data integrity error: Multiple flights found with code ${code}`);
        }
        if (flights.length === 0) {
            return null;
        }

        const tickets = await TicketsModel.find({ flightCode: code }).lean();
        const passengers = await PassengersModel.find({
            _id: { $in: tickets.map((ticket) => ticket.passengerId) },
        });

        return Flight.fromData({
            ...flights[0],
            passengers: passengers.map((passenger) =>
                this.normalizePassenger(passenger)
            ),
        });
    }

    public async createPassenger(
        passenger: CreatePassengerData
    ): Promise<PassengerData> {
        const storedPassenger = await PassengersModel.create(passenger);

        return this.normalizePassenger(storedPassenger);
    }

    public async getPassengerById(
        passengerId: string
    ): Promise<Passenger | null> {
        const passenger = await PassengersModel.findById(passengerId);

        return passenger
            ? Passenger.fromData(this.normalizePassenger(passenger))
            : null;
    }

    public async getPassengerByEmail(
        email: string
    ): Promise<Passenger | null> {
        const passenger = await PassengersModel.findOne({ email });

        return passenger
            ? Passenger.fromData(this.normalizePassenger(passenger))
            : null;
    }

    public async createTicket(ticket: TicketData): Promise<TicketData> {
        const storedTicket = await TicketsModel.findOneAndUpdate(
            {
                flightCode: ticket.flightCode,
                passengerId: ticket.passengerId,
            },
            {
                $setOnInsert: {
                    _id: ticket.id,
                    flightCode: ticket.flightCode,
                    passengerId: ticket.passengerId,
                },
            },
            {
                new: true,
                upsert: true,
            }
        );

        return this.normalizeTicket(storedTicket);
    }

    private normalizePassenger(passenger: any): PassengerData {
        const data = passenger.toObject ? passenger.toObject() : passenger;

        return {
            id: data.id || data._id.toString(),
            name: data.name,
            email: data.email,
            gender: data.gender,
        };
    }

    private normalizeTicket(ticket: any): TicketData {
        const data = ticket.toObject ? ticket.toObject() : ticket;

        return {
            id: data._id.toString(),
            passengerId: data.passengerId,
            flightCode: data.flightCode,
        };
    }
}
