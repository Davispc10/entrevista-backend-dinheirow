import { Passenger } from './Passenger'

export type CreateTicketData = {
    passengerId: string
    flightCode: string
}

export type TicketData = CreateTicketData & {
    id: string
}

export class Ticket {
    constructor(
        private id: string,
        private owner: Passenger,
        private flightCode: string
    ) {}

    static create(owner: Passenger, flightCode: string): Ticket {
        owner.addToFlight(flightCode)

        return new Ticket(Ticket.generateId(), owner, flightCode)
    }

    toData(): TicketData {
        return {
            id: this.id,
            passengerId: this.owner.getId(),
            flightCode: this.flightCode,
        }
    }

    private static generateId() {
        return `ticket-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
    }
}
