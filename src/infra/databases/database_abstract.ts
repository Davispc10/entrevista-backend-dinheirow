export abstract class Database {
    public static _instance: any;

    public static getInstance() {
        // subclass must implement this method
    }

    public abstract getFlights(): any;
    // public abstract updateFlightStatus(code: string): any;
    public abstract getFlightByCode(code: string): any;
    public abstract addFlight(flight: {
        code: string;
        origin: string;
        destination: string;
        status: string;
    }): any;
    public abstract addPassenger(passenger: {
        id: string;
        name: string;
        email: string;
        gender: string;
    }): any;
    public abstract addTicket(ticket: {
        ownerId: string;
        flightId: string;
        price: string;
        departure: string;
        arrival: string;
        type: string;
    });
}
