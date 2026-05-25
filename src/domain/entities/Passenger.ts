export type CreatePassengerData = {
    name: string
    email: string
    gender: string
}

export type PassengerData = CreatePassengerData & {
    id: string
}

export class Passenger {
    private flightCodes: string[] = []

    constructor(
        private id: string,
        private name: string,
        private email: string,
        private gender: string
    ) {}

    static fromData(data: PassengerData): Passenger {
        return new Passenger(data.id, data.name, data.email, data.gender)
    }

    getId(): string {
        return this.id
    }

    toData(): PassengerData {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            gender: this.gender,
        }
    }

    addToFlight(flightCode: string): void {
        if (!this.flightCodes.includes(flightCode)) {
            this.flightCodes.push(flightCode)
        }
    }

    isOnFlight(flightCode: string): boolean {
        return this.flightCodes.includes(flightCode)
    }
}
