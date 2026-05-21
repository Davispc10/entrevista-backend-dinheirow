export abstract class Database {
    public static _instance: any

    public static getInstance() {
        // subclass must implement this method
    }

    public abstract getFlights(): any
    // public abstract updateFlightStatus(code: string): any;
    public abstract getFlightByCode(code: string): any
    public abstract addFlight(flight: {
        code: string
        origin: string
        destination: string
        status: string
    }): any
    public abstract updateFlight(flight: {
        code: string
        origin: string
        destination: string
        status: string
    }): any
}
