import { Flight } from '../entities/Flight'
import { Passenger } from '../entities/Passenger'

export interface IPricingStrategy {
    calculatePrice(flight: Flight, passenger: Passenger, bookingDate: Date): number
}

export class StandardPricingStrategy implements IPricingStrategy {
    private readonly BASE_PRICE = 500

    calculatePrice(flight: Flight, passenger: Passenger, bookingDate: Date): number {
        const day = bookingDate.getDay()
        const weekendFactor = day === 0 || day === 6 ? 1.2 : 1.0
        return Math.round(this.BASE_PRICE * weekendFactor)
    }
}
