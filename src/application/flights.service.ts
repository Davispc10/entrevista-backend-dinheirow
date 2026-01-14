import { Database } from '../infra/databases/database_abstract';
import { DatabaseInstanceStrategy } from '../infra/databases/database';

export class FlightsService {
    private readonly _db: Database;

    constructor() {
        this._db = DatabaseInstanceStrategy.getInstance();
    }

    public async getFlights() {
        return this._db.getFlights();
    }

    public async updateFlightStatus(code: string) {
        // return this._db.updateFlightStatus(code);
    }

    public async addFlight(flight: {
        code: string;
        origin: string;
        destination: string;
        status: string;
    }) {
        return await this._db.addFlight(flight);
    }

    public async getFlightByCode(code: string) {
        return this._db.getFlightByCode(code);
    }
}
