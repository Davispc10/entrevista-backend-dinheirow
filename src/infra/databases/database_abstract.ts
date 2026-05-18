export abstract class Database {
    public static _instance: any

    public static getInstance() {
        // subclass must implement this method
    }

    public abstract getFlights(): any
    public abstract updateFlightStatus(code: string, status: string): any
    public abstract getFlightByCode(code: string): any
    public abstract addFlight(flight: {
        code: string
        origin: string
        destination: string
        status: string
    }): any

    public async addPassenger(passenger: {
        id: string
        name: string
        email: string
        gender: string
    }): Promise<any> {
        throw new Error('addPassenger not implemented')
    }

    public async removePassenger(id: string): Promise<any> {
        throw new Error('removePassenger not implemented')
    }

    public async getPassengerById(id: string): Promise<any> {
        throw new Error('getPassengerById not implemented')
    }

    public async addTicket(ticket: {
        flightCode: string
        passengerId: string
        price: string
        type: string
    }): Promise<any> {
        throw new Error('addTicket not implemented')
    }

    public async removeTicket(
        flightCode: string,
        passengerId: string
    ): Promise<any> {
        throw new Error('removeTicket not implemented')
    }

    public async countTicketsByFlight(flightCode: string): Promise<number> {
        throw new Error('countTicketsByFlight not implemented')
    }

    public async findTicket(
        flightCode: string,
        passengerId: string
    ): Promise<any> {
        throw new Error('findTicket not implemented')
    }

    public async getTicketsByFlight(flightCode: string): Promise<any[]> {
        throw new Error('getTicketsByFlight not implemented')
    }
}
