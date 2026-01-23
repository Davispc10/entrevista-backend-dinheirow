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
        return this._db.addFlight(flight);
    }

    public async getFlightByCode(code: string) {
        return this._db.getFlightByCode(code);
    }

    public async addPassenger(flightCode: string, passengerData: {
        id: string;
        name: string;
        email: string;
        gender: string;
    }) {
        // Check if passenger with this email already exists
        const existingPassenger = await this._db.getPassengerByEmail(passengerData.email);
        if (existingPassenger) {
            throw new Error('Passenger already exists');
        }

        // Create the passenger
        const passenger = await this._db.addPassenger(passengerData);

        // Get flight details
        const flight = await this._db.getFlightByCode(flightCode);

        let seatReserved = false;
        let reservationMessage = 'Assento reservado com sucesso';

        // Validate flight and reserve seat
        if (!flight) {
            reservationMessage = 'Voo não encontrado. Assento não reservado.';
        } else if (flight.status !== 'ACTIVE') {
            reservationMessage = `Voo está com status ${flight.status}. Assento não reservado.`;
        } else {
            // Check if flight has available seats
            const currentPassengers = await this._db.countTicketsByFlight(flightCode);
            if (currentPassengers >= flight.max_capacity) {
                reservationMessage = 'Voo lotado. Assento não reservado.';
            } else {
                // Reserve the seat
                await this._db.addTicket(passenger.id, flightCode);
                seatReserved = true;
            }
        }

        return {
            passenger,
            seatReserved,
            reservationMessage
        };
    }
}
