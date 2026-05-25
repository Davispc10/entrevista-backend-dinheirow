import { FlightCode } from "../value-objects/FlightCode";
import { PassengerData } from './Passenger'

export type CreateFlightData = {
    code: string
    origin: string
    destination: string
    status: string
}

export type FlightData = CreateFlightData & {
    passengers?: PassengerData[]
}

export class Flight {
    private passengers: PassengerData[]

    constructor(
        private code: FlightCode,
        private origin: string,
        private destination: string,
        private status: string,
        passengers: PassengerData[] = [],
        private maxCapacity: number = 180
    ) {
        this.passengers = passengers
    }

    static fromData(data: FlightData): Flight {
        return new Flight(
            new FlightCode(data.code),
            data.origin,
            data.destination,
            data.status,
            data.passengers || []
        )
    }

    toData(): FlightData {
        return {
            code: this.code.toString(),
            origin: this.origin,
            destination: this.destination,
            status: this.status,
            passengers: this.passengers,
        }
    }

    get availableSeats(): number {
      return 10
      // return this.maxCapacity - this.passengers.length;
    }

    canAddPassenger(): boolean {
        return !['cancelled', 'canceled', 'cancelado', 'cancelada'].includes(
            (this.status || '').toLowerCase()
        )
    }

    responsibleAirline(): string {
      return this.code.responsibleAirline()
    }
}
