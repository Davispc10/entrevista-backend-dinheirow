export class Passenger {
    constructor(
        private id: string,
        private name: string,
        private email: string,
        private gender: string
    ) {}

    hasId(id: string): boolean {
        return this.id === id
    }

    equals(p: Passenger) {
        return this.email.toLowerCase() === p.email.toLowerCase()
    }
}
