import { Database } from '../database_abstract';

import { newDb, IMemoryDb } from 'pg-mem';

export class PostgreStrategy extends Database {
    
    _instance: IMemoryDb;

    constructor() {
        super();
        this.getInstance();
    }

    private async getInstance() {
        const db = newDb();

        db.public.many(`
            CREATE TABLE flights (
                code VARCHAR(10) PRIMARY KEY,
                origin VARCHAR(50),
                destination VARCHAR(50),
                status VARCHAR(50),
                max_capacity INTEGER DEFAULT 180
            );
        `);

        db.public.many(`
            CREATE TABLE passengers (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                gender VARCHAR(20) NOT NULL
            );
        `);

        db.public.many(`
            CREATE TABLE tickets (
                id SERIAL PRIMARY KEY,
                passenger_id VARCHAR(36) REFERENCES passengers(id),
                flight_code VARCHAR(10) REFERENCES flights(code),
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        db.public.many(`
            INSERT INTO flights (code, origin, destination, status, max_capacity)
            VALUES ('GOL-123', 'LHS', 'GAO', 'ACTIVE', 180),
                   ('TAM-124', 'CGH', 'NYC', 'CANCELLED', 180),
                   ('AZU-125', 'FOR', 'LAX', 'ACTIVE', 1);
        `);

        PostgreStrategy._instance = db;

        return db;
    }

    public async getFlights() {
        return PostgreStrategy._instance.public.many('SELECT code, origin, destination, status, max_capacity FROM flights');
    }

    public async addFlight(flight: {
        code: string;
        origin: string;
        destination: string;
        status: string;
    }) {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO flights (code, origin, destination, status) 
            VALUES ('${flight.code}', '${flight.origin}', '${flight.destination}', '${flight.status}') 
            RETURNING *`,
        );
    }

    public async getFlightByCode(code: string) {
        const flights = PostgreStrategy._instance.public.many(
            `SELECT * FROM flights WHERE code = '${code}'`
        );
        if (flights.length > 1) {
            throw new Error(`Data integrity error: Multiple flights found with code ${code}`);
        }
        return flights.length > 0 ? flights[0] : null;
    }

    public async getPassengerByEmail(email: string) {
        const passengers = PostgreStrategy._instance.public.many(
            `SELECT * FROM passengers WHERE email = '${email}'`
        );
        return passengers.length > 0 ? passengers[0] : null;
    }

    public async addPassenger(passenger: {
        id: string;
        name: string;
        email: string;
        gender: string;
    }) {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO passengers (id, name, email, gender) 
             VALUES ('${passenger.id}', '${passenger.name}', '${passenger.email}', '${passenger.gender}') 
             RETURNING *`
        );
    }

    public async addTicket(passengerId: string, flightCode: string) {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO tickets (passenger_id, flight_code) 
             VALUES ('${passengerId}', '${flightCode}') 
             RETURNING *`
        );
    }

    public async countTicketsByFlight(flightCode: string): Promise<number> {
        const result = PostgreStrategy._instance.public.many(
            `SELECT COUNT(*) as count FROM tickets WHERE flight_code = '${flightCode}'`
        );
        return parseInt(result[0].count);
    }
}
