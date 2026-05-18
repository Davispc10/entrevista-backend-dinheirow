import { FlightCode } from '../value-objects/FlightCode'
import { Passenger } from './Passenger'
import { Ticket } from './Ticket'

export class Flight {
    constructor(
        private code: FlightCode,
        private origin: string,
        private destination: string,
        private status: string,
        private maxCapacity: number = 180,
        private tickets: Ticket[]
    ) {}

    get availableSeats(): number {
        return this.maxCapacity - this.tickets.length
    }

    canAddPassenger(): boolean {
        return this.status === 'ACTIVE'
    }

    responsibleAirline(): string {
        return this.code.responsibleAirline()
    }

    addPassenger(
        passenger: Passenger,
        type: 'premium' | 'economy',
        departure: Date,
        arrival: Date,
        price: string
    ): Ticket {
        if (!this.canAddPassenger())
            throw new Error(`Flight not accepting passengers`)
        if (this.availableSeats <= 0) throw new Error(`No available sets`)
        if (this.tickets.some((t) => t.belongsTo(passenger)))
            throw new Error(`Passenger already on flight`)

        const ticket = new Ticket(
            passenger,
            this.code,
            price,
            departure,
            arrival,
            type
        )
        this.tickets.push(ticket)
        return ticket
    }

    removePassenger(passenger: Passenger): void {
        const idx = this.tickets.findIndex((t) => t.belongsTo(passenger))
        if (idx === -1) throw new Error('Passenger not on flight')
        this.tickets.splice(idx, 1)
    }

    isStatusValid(newStatus: string): boolean {
        const flightStatus = ['on time', 'delayed', 'cancelled']
        return flightStatus.includes(newStatus)
    }
}
