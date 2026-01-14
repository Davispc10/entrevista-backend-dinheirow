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
                status VARCHAR(50)
            );
        `);

        db.public.many(`
            INSERT INTO flights (code, origin, destination, status)
            VALUES ('GOL-123', 'LHS', 'GAO', 'on time'),
                   ('TAM-124', 'CGH', 'NYC', 'delayed'),
                   ('TAM-111', 'CGH', 'NYC', 'cancelled'),
                   ('AZU-125', 'FOR', 'LAX', 'on time');
        `);

        db.public.many(`
            CREATE TABLE passengers (
                id VARCHAR(10) PRIMARY KEY,
                name VARCHAR(50),
                email VARCHAR(50),
                gender VARCHAR(50)
            );
        `)

        db.public.many(`
            CREATE TABLE ticket (
                owner_id VARCHAR(10),
                flight_id VARCHAR(10),
                price VARCHAR(10),
                departure VARCHAR(10),
                arrival VARCHAR(10),
                type VARCHAR(10),
                FOREIGN KEY (owner_id) REFERENCES passengers(id),
                FOREIGN KEY (flight_id) REFERENCES flights(code),
                PRIMARY KEY (owner_id, flight_id)
            );
        `)

        PostgreStrategy._instance = db;

        return db;
    }

    public async getFlights() {
        return PostgreStrategy._instance.public.many('SELECT * FROM flights');
    }

    public async addFlight(flight: {
        code: string;
        origin: string;
        destination: string;
        status: string;
    }) {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO flights (code, origin, destination, status) VALUES ('${flight.code}', '${flight.origin}', '${flight.destination}', '${flight.status}') RETURNING *`,
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

    public addPassenger(passenger: { id: string; name: string; email: string; gender: string; }) {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO passengers(id, name, email, gender) VALUES ('${passenger.id}', '${passenger.name}', '${passenger.email}', '${passenger.gender}') RETURNING *`);
    }
    public addTicket(ticket: { ownerId: string; flightId: string; price: string; departure: string; arrival: string; type: string; }) {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO ticket(owner_id, flight_id, price, departure, arrival, type) VALUES('${ticket.ownerId}', '${ticket.flightId}', '${ticket.price}', '${ticket.departure}', '${ticket.arrival}', '${ticket.type}') RETURNING *`
        )
    }
}
