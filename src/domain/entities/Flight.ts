import { FlightCode } from "../value-objects/FlightCode";
import { FlightStatus, normalizeFlightStatus } from "../value-objects/FlightStatus";

export class Flight {
    constructor(
        private code: FlightCode,
        private origin: string,
        private destination: string,
        private status: string,
        private maxCapacity: number = 180
    ) { }

    get availableSeats(): number {
      return 10
      // return this.maxCapacity - this.passengers.length;
    }

    canAddPassenger(): boolean {
        const normalizedStatus = normalizeFlightStatus(this.status);
        return normalizedStatus !== FlightStatus.CANCELLED;
    }

    responsibleAirline(): string {
      return this.code.responsibleAirline()
    }
}