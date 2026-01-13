import { Database } from '../database_abstract'

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
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                gender VARCHAR(20) NOT NULL
            );
        `)

        db.public.many(`
            CREATE TABLE tickets (
                id SERIAL PRIMARY KEY,
                passenger_id VARCHAR(50) NOT NULL,
                flight_code VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (passenger_id) REFERENCES passengers(id),
                FOREIGN KEY (flight_code) REFERENCES flights(code),
                UNIQUE(passenger_id, flight_code)
            );
        `)

        db.public.many(`
            INSERT INTO flights (code, origin, destination, status)
            VALUES ('GOL-123', 'LHS', 'GAO', 'on time'),
                   ('TAM-124', 'CGH', 'NYC', 'delayed'),
                   ('AZU-125', 'FOR', 'LAX', 'on time');
        `)

        PostgreStrategy._instance = db

        return db
    }

    public async getFlights() {
        return PostgreStrategy._instance.public.many('SELECT * FROM flights')
    }

    public async addFlight(flight: {
        code: string
        origin: string
        destination: string
        status: string
    }) {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO flights (code, origin, destination, status) 
             VALUES ('${flight.code}', '${flight.origin}', '${flight.destination}', '${flight.status}')
             RETURNING *`
        )
    }

    public async getFlightByCode(code: string) {
        const flights = PostgreStrategy._instance.public.many(
            `SELECT * FROM flights WHERE code = '${code}'`
        )
        if (flights.length > 1) {
            throw new Error(
                `Data integrity error: Multiple flights found with code ${code}`
            )
        }
        return flights.length > 0 ? flights[0] : null
    }

    public async addPassenger(passenger: {
        id: string
        name: string
        email: string
        gender: string
    }): Promise<any> {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO passengers (id, name, email, gender) 
             VALUES ('${passenger.id}', '${passenger.name}', '${passenger.email}', '${passenger.gender}')
             RETURNING *`
        )
    }

    public async getPassengerById(id: string): Promise<any> {
        const passengers = PostgreStrategy._instance.public.many(
            `SELECT * FROM passengers WHERE id = '${id}'`
        )
        return passengers.length > 0 ? passengers[0] : null
    }

    public async getPassengerByEmail(email: string): Promise<any> {
        const passengers = PostgreStrategy._instance.public.many(
            `SELECT * FROM passengers WHERE email = '${email}'`
        )
        return passengers.length > 0 ? passengers[0] : null
    }

    public async addPassengerToFlight(
        passengerId: string,
        flightCode: string
    ): Promise<any> {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO tickets (passenger_id, flight_code) 
             VALUES ('${passengerId}', '${flightCode}')
             RETURNING *`
        )
    }

    public async getPassengersByFlight(flightCode: string): Promise<any> {
        return PostgreStrategy._instance.public.many(
            `SELECT p.* FROM passengers p
             INNER JOIN tickets t ON p.id = t.passenger_id
             WHERE t.flight_code = '${flightCode}'`
        )
    }

    public async passengerExistsInFlight(
        passengerId: string,
        flightCode: string
    ): Promise<boolean> {
        const tickets = PostgreStrategy._instance.public.many(
            `SELECT * FROM tickets WHERE passenger_id = '${passengerId}' AND flight_code = '${flightCode}'`
        )
        return tickets.length > 0
    }
}
