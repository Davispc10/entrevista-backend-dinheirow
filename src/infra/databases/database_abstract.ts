import {
    CreatePassengerData,
    Passenger,
    PassengerData,
} from '../../domain/entities/Passenger';
import { CreateFlightData, Flight, FlightData } from '../../domain/entities/Flight';
import { TicketData } from '../../domain/entities/Ticket';

export abstract class Database {
    public static _instance: any;

    public static getInstance() {
        // subclass must implement this method
    }

    public abstract getFlights(): Promise<FlightData[]>;
    // public abstract updateFlightStatus(code: string): any;
    public abstract getFlightByCode(code: string): Promise<Flight | null>;
    public abstract createPassenger(
        passenger: CreatePassengerData
    ): Promise<PassengerData>;
    public abstract getPassengerById(
        passengerId: string
    ): Promise<Passenger | null>;
    public abstract getPassengerByEmail(
        email: string
    ): Promise<Passenger | null>;
    public abstract createTicket(ticket: TicketData): Promise<TicketData>;
    public abstract addFlight(flight: CreateFlightData): Promise<FlightData>;
}
