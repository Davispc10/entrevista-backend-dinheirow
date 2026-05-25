import { Database } from '../database_abstract'
import {
    CreatePassengerData,
    Passenger,
    PassengerData,
} from '../../../domain/entities/Passenger'
import { TicketData } from '../../../domain/entities/Ticket'
import {
    CreateFlightData,
    Flight,
    FlightData,
} from '../../../domain/entities/Flight'

import { newDb, IMemoryDb } from 'pg-mem'

export class PostgreStrategy extends Database {
    _instance: IMemoryDb

    constructor() {
        super()
        this.getInstance()
    }

    private async getInstance() {
        const db = newDb()

        db.public.many(`
            CREATE TABLE flights (
                code VARCHAR(10) PRIMARY KEY,
                origin VARCHAR(50),
                destination VARCHAR(50),
                status VARCHAR(50)
            );
        `)

        db.public.many(`
            CREATE TABLE passengers (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                gender VARCHAR(50)
            );
        `)

        db.public.many(`
            CREATE TABLE tickets (
                id VARCHAR(50) PRIMARY KEY,
                flight_code VARCHAR(10),
                passenger_id VARCHAR(50),
                UNIQUE (flight_code, passenger_id),
                FOREIGN KEY (flight_code) REFERENCES flights(code),
                FOREIGN KEY (passenger_id) REFERENCES passengers(id)
            );
        `)

        db.public.many(`
            INSERT INTO flights (code, origin, destination, status)
            VALUES ('GOL-123', 'LHS', 'GAO', 'on time'),
                   ('TAM-124', 'CGH', 'NYC', 'delayed'),
                   ('AZU-125', 'FOR', 'LAX', 'on time'),
                   ('AZU-678', 'LAX', 'CGH', 'cancelled');
        `)

        PostgreStrategy._instance = db

        return db
    }

    public async getFlights(): Promise<FlightData[]> {
        return PostgreStrategy._instance.public.many('SELECT * FROM flights')
    }

    public async addFlight(flight: CreateFlightData): Promise<FlightData> {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO flights (code, origin, destination, status)
             VALUES (${this.toSqlString(flight.code)}, ${this.toSqlString(
                flight.origin
            )}, ${this.toSqlString(flight.destination)}, ${this.toSqlString(
                flight.status
            )})
             ON CONFLICT (code) DO UPDATE
             SET origin = EXCLUDED.origin,
                 destination = EXCLUDED.destination,
                 status = EXCLUDED.status
             RETURNING code, origin, destination, status`
        )
    }

    public async getFlightByCode(code: string): Promise<Flight | null> {
        const flights = PostgreStrategy._instance.public.many(
            `SELECT * FROM flights WHERE code = ${this.toSqlString(code)}`
        )
        if (flights.length > 1) {
            throw new Error(
                `Data integrity error: Multiple flights found with code ${code}`
            )
        }
        if (flights.length === 0) {
            return null
        }

        const passengers = PostgreStrategy._instance.public.many(
            `SELECT p.id, p.name, p.email, p.gender
             FROM passengers p
             INNER JOIN tickets t ON t.passenger_id = p.id
             WHERE t.flight_code = ${this.toSqlString(code)}`
        )

        return Flight.fromData({
            ...flights[0],
            passengers,
        })
    }

    public async createPassenger(
        passenger: CreatePassengerData
    ): Promise<PassengerData> {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO passengers (id, name, email, gender)
             VALUES (${this.toSqlString(
                 this.generatePassengerId()
             )}, ${this.toSqlString(passenger.name)}, ${this.toSqlString(
                passenger.email
            )}, ${this.toSqlString(passenger.gender)})
             RETURNING id, name, email, gender`
        )
    }

    public async getPassengerById(
        passengerId: string
    ): Promise<Passenger | null> {
        const passengers = PostgreStrategy._instance.public.many(
            `SELECT id, name, email, gender
             FROM passengers
             WHERE id = ${this.toSqlString(passengerId)}`
        )

        return passengers.length > 0 ? Passenger.fromData(passengers[0]) : null
    }

    public async getPassengerByEmail(
        email: string
    ): Promise<Passenger | null> {
        const passengers = PostgreStrategy._instance.public.many(
            `SELECT id, name, email, gender
             FROM passengers
             WHERE email = ${this.toSqlString(email)}`
        )

        return passengers.length > 0 ? Passenger.fromData(passengers[0]) : null
    }

    public async createTicket(ticket: TicketData): Promise<TicketData> {
        const tickets = PostgreStrategy._instance.public.many(
            `SELECT id, flight_code as "flightCode", passenger_id as "passengerId"
             FROM tickets
             WHERE flight_code = ${this.toSqlString(ticket.flightCode)}
               AND passenger_id = ${this.toSqlString(ticket.passengerId)}`
        )

        if (tickets.length > 0) {
            return tickets[0]
        }

        return PostgreStrategy._instance.public.one(
            `INSERT INTO tickets (id, flight_code, passenger_id)
             VALUES (${this.toSqlString(ticket.id)}, ${this.toSqlString(
                ticket.flightCode
            )}, ${this.toSqlString(
                ticket.passengerId
            )})
             RETURNING id, flight_code as "flightCode", passenger_id as "passengerId"`
        )
    }

    private toSqlString(value: string) {
        return `'${value.replace(/'/g, "''")}'`
    }

    private generatePassengerId() {
        return `passenger-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
    }
}
