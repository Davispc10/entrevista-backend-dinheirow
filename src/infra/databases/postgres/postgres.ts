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
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                gender VARCHAR(20)
            );
        `)

        db.public.many(`
            CREATE TABLE tickets (
                id VARCHAR(36) PRIMARY KEY,
                flight_code VARCHAR(10) REFERENCES flights(code),
                passenger_id VARCHAR(36) REFERENCES passengers(id),
                price VARCHAR(20),
                departure TIMESTAMP,
                arrival TIMESTAMP,
                type VARCHAR(10)
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

    public updateFlightStatus(code: string, status: string) {
        const rows = PostgreStrategy._instance.public.many(
            `UPDATE flights set status = '${status}' WHERE code = '${code}' RETURNING *`
        )
        if (!rows) throw new Error('')

        return rows[0]
    }

    public async addFlight(flight: {
        code: string
        origin: string
        destination: string
        status: string
    }) {
        return PostgreStrategy._instance.public.one(
            `INSERT INTO flights (code, origin, destination, status) VALUES ('${flight.code}', '${flight.origin}', '${flight.destination}', '${flight.status}') RETURNING *`
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
    }) {
        PostgreStrategy._instance.public.one(
            `INSERT INTO passengers (id, name, email, gender) VALUES ('${passenger.id}', '${passenger.name}', '${passenger.email}', '${passenger.gender}')`
        )
        return passenger
    }

    public async removePassenger(id: string) {
        PostgreStrategy._instance.public.none(
            `DELETE FROM tickets WHERE passenger_id = '${id}'`
        )
        PostgreStrategy._instance.public.none(
            `DELETE FROM passengers WHERE id = '${id}'`
        )
        return { id }
    }

    public async getPassengerById(id: string) {
        const rows = PostgreStrategy._instance.public.many(
            `SELECT * FROM passengers WHERE id = '${id}'`
        )
        return rows.length > 0 ? rows[0] : null
    }

    public async addTicket(ticket: {
        flightCode: string
        passengerId: string
        price: string
        type: string
    }) {
        const id = `tkt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        PostgreStrategy._instance.public.none(
            `INSERT INTO tickets (id, flight_code, passenger_id, price, type) VALUES ('${id}', '${ticket.flightCode}', '${ticket.passengerId}', '${ticket.price}', '${ticket.type}')`
        )
        return { id, ...ticket }
    }

    public async removeTicket(flightCode: string, passengerId: string) {
        PostgreStrategy._instance.public.none(
            `DELETE FROM tickets WHERE flight_code = '${flightCode}' AND passenger_id = '${passengerId}'`
        )
        return { flightCode, passengerId }
    }

    public async countTicketsByFlight(flightCode: string): Promise<number> {
        const rows = PostgreStrategy._instance.public.many(
            `SELECT COUNT(*)::int AS count FROM tickets WHERE flight_code = '${flightCode}'`
        )
        return rows[0]?.count ?? 0
    }

    public async findTicket(flightCode: string, passengerId: string) {
        const rows = PostgreStrategy._instance.public.many(
            `SELECT * FROM tickets WHERE flight_code = '${flightCode}' AND passenger_id = '${passengerId}'`
        )
        return rows.length > 0 ? rows[0] : null
    }

    public async getTicketsByFlight(flightCode: string): Promise<any[]> {
        return PostgreStrategy._instance.public.many(
            `SELECT t.*, p.id AS p_id, p.name AS p_name, p.email AS p_email, p.gender AS p_gender
             FROM tickets t
             JOIN passengers p ON p.id = t.passenger_id
             WHERE t.flight_code = '${flightCode}'`
        )
    }
}
