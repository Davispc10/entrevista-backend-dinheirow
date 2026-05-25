export class FlightCode {
    private readonly value: string;

    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new Error('Invalid flight code format. Expected format: ABC-1 to ABC-999');
        }
        this.value = value.toUpperCase();
    }

    private isValid(code: string): boolean {
        const flightCodeRegex = /^[A-Z]{3}-\d{1,3}$/;
        return flightCodeRegex.test(code.toUpperCase());
    }

    responsibleAirline(): string {
      return this.value.split('-')[0]
    }

    equals(other: FlightCode): boolean {
        return this.value === other.toString();
    }

    toString(): string {
        return this.value;
    }
}
