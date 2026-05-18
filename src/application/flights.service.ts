import { Database } from '../infra/databases/database_abstract'
import { DatabaseInstanceStrategy } from '../infra/databases/database'
import { Flight } from '../domain/entities/Flight'
import { Passenger } from '../domain/entities/Passenger'
import { Ticket } from '../domain/entities/Ticket'
import { FlightCode } from '../domain/value-objects/FlightCode'
import { StandardPricingStrategy } from '../domain/services/PricingStrategy'
import { NotFoundError } from 'routing-controllers'

export class FlightsService {
    private readonly _db: Database
    private readonly _pricing = new StandardPricingStrategy()

    constructor() {
        this._db = DatabaseInstanceStrategy.getInstance()
    }

    public async getFlights() {
        return this._db.getFlights()
    }

    public async updateFlightStatus(code: string, newStatus: string) {
        // get flight by code
        const flight = await this.getFlightByCode(code)
        const flightInstance = new Flight(
            flight.code,
            flight.origin,
            flight.destination,
            flight.status,
            flight.maxCapacity,
            []
        )

        if (!flight) throw new NotFoundError('Flight not found')
        if (!flightInstance.isStatusValid(newStatus))
            throw new Error('Status invalido')

        // verificar status
        if (flight.status === 'delayed' && newStatus !== 'cancelled')
            throw new Error('Não pode mudar para cancelled')
        if (flight.status === 'cancelled')
            throw new Error('Voo cancelado, não pode alterar status')

        return this._db.updateFlightStatus(code, newStatus)
    }

    public async addFlight(flight: {
        code: string
        origin: string
        destination: string
        status: string
    }) {
        return this._db.addFlight(flight)
    }

    public async getFlightByCode(code: string) {
        return this._db.getFlightByCode(code)
    }

    public async addPassenger(passenger: {
        id: string
        name: string
        email: string
        gender: string
    }) {
        return this._db.addPassenger(passenger)
    }

    public async removePassenger(id: string) {
        return this._db.removePassenger(id)
    }

    private async loadFlightAggregate(flightCode: string): Promise<Flight> {
        const flightRow = await this._db.getFlightByCode(flightCode)
        if (!flightRow) throw new Error('Flight not found')

        const ticketRows = await this._db.getTicketsByFlight(flightCode)
        const tickets = ticketRows.map(
            (r: any) =>
                new Ticket(
                    new Passenger(r.p_id, r.p_name, r.p_email, r.p_gender),
                    new FlightCode(flightRow.code),
                    r.price,
                    r.departure ?? new Date(),
                    r.arrival ?? new Date(),
                    r.type
                )
        )

        return new Flight(
            new FlightCode(flightRow.code),
            flightRow.origin,
            flightRow.destination,
            flightRow.status,
            180,
            tickets
        )
    }

    private async loadPassenger(id: string): Promise<Passenger> {
        const row = await this._db.getPassengerById(id)
        if (!row) throw new Error('Passenger not found')
        return new Passenger(row.id, row.name, row.email, row.gender)
    }

    public async addPassengerToFlight(
        flightCode: string,
        dto: { passengerId: string; type: 'premium' | 'economy' }
    ) {
        const flight = await this.loadFlightAggregate(flightCode)
        const passenger = await this.loadPassenger(dto.passengerId)

        const basePrice = this._pricing.calculatePrice(
            flight,
            passenger,
            new Date()
        )
        const finalPrice = dto.type === 'premium' ? basePrice * 2.5 : basePrice

        flight.addPassenger(
            passenger,
            dto.type,
            new Date(),
            new Date(),
            finalPrice.toFixed(2)
        )

        return this._db.addTicket({
            flightCode,
            passengerId: dto.passengerId,
            price: finalPrice.toFixed(2),
            type: dto.type,
        })
    }

    public async removePassengerFromFlight(
        flightCode: string,
        passengerId: string
    ) {
        const flight = await this.loadFlightAggregate(flightCode)
        const passenger = await this.loadPassenger(passengerId)

        flight.removePassenger(passenger)

        return this._db.removeTicket(flightCode, passengerId)
    }
}
