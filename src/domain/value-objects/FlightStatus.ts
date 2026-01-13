export enum FlightStatus {
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    DELAYED = 'DELAYED',
    ON_TIME = 'ON_TIME',
}

export function normalizeFlightStatus(status: string): FlightStatus {
    const normalized = status.toUpperCase().trim();
    
    if (normalized === 'CANCELLED' || normalized === 'CANCELED') {
        return FlightStatus.CANCELLED;
    }
    if (normalized === 'ACTIVE') {
        return FlightStatus.ACTIVE;
    }
    if (normalized === 'DELAYED') {
        return FlightStatus.DELAYED;
    }
    if (normalized === 'ON TIME' || normalized === 'ON_TIME' || normalized === 'ONTIME') {
        return FlightStatus.ON_TIME;
    }
    
    return FlightStatus.ACTIVE;
}
