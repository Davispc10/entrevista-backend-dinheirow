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
                   ('AZU-125', 'FOR', 'LAX', 'on time');
        `);

        PostgreStrategy._instance = db;

        return db;
    }

    public async getFlights() {
        return PostgreStrategy._instance.public.many('SELECT code, origin, destination, status FROM flights');
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
}
