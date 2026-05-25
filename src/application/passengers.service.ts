import { BadRequestError, NotFoundError } from 'routing-controllers'
import { Database } from '../infra/databases/database_abstract'
import { DatabaseInstanceStrategy } from '../infra/databases/database'
import { CreatePassengerData } from '../domain/entities/Passenger'
import { Ticket } from '../domain/entities/Ticket'

export class PassengersService {
    private readonly _db: Database

    constructor() {
        this._db = DatabaseInstanceStrategy.getInstance()
    }

    public async createPassenger(passenger: CreatePassengerData) {
        if (!passenger) {
            throw new BadRequestError('Passenger data is required')
        }

        this.validateRequired(passenger.name, 'Name')
        this.validateRequired(passenger.email, 'Email')
        this.validateRequired(passenger.gender, 'Gender')

        const existingPassenger = await this._db.getPassengerByEmail(
            passenger.email
        )

        if (existingPassenger) {
            throw new BadRequestError('Passenger already exists')
        }

        return this._db.createPassenger(passenger)
    }

    public async linkPassengerToFlight(flightCode: string, passengerId: string) {
        if (!flightCode) {
            throw new BadRequestError('Flight code is required')
        }

        this.validateRequired(passengerId, 'Passenger id')

        const flight = await this._db.getFlightByCode(flightCode)

        if (!flight) {
            throw new NotFoundError(`Flight ${flightCode} not found`)
        }

        const passenger = await this._db.getPassengerById(passengerId)

        if (!passenger) {
            throw new NotFoundError(`Passenger ${passengerId} not found`)
        }

        if (!flight.canAddPassenger()) {
            throw new BadRequestError(
                'Passenger cannot be included in a cancelled flight'
            )
        }

        const ticket = Ticket.create(passenger, flightCode)

        return this._db.createTicket(ticket.toData())
    }

    private validateRequired(value: string, field: string) {
        if (typeof value !== 'string' || !value.trim()) {
            throw new BadRequestError(`${field} is required`)
        }
    }
}
