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
    }): Promise<any>;
    public abstract getPassengerById(id: string): Promise<any>;
    public abstract getPassengerByEmail(email: string): Promise<any>;
    public abstract addPassengerToFlight(passengerId: string, flightCode: string): Promise<any>;
    public abstract getPassengersByFlight(flightCode: string): Promise<any>;
    public abstract passengerExistsInFlight(passengerId: string, flightCode: string): Promise<boolean>;
}
