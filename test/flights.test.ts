import { describe, it } from 'mocha';
import * as assert from 'assert';
import request from 'supertest';
import app from '../src/index';

function generateFlightCode(): string {
    const airlines = ['GOL', 'AZU', 'TAM'];
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const number = Math.floor(Math.random() * 500) + 1;
    return `${airline}-${number.toString()}`;
}

describe('Flights API Integration Tests', () => {
    
    describe('GET /api/v1/flights', () => {
        it('should return all flights', async () => {
            const response = await request(app)
                .get('/api/v1/flights')
                .expect(200);
            
            assert.strictEqual(response.body.status, 200);
            assert.ok(response.body.data);
            assert.ok(Array.isArray(response.body.data));
            assert.ok(response.body.data.length > 0);
        });

        it('should return flights with correct structure', async () => {
            const response = await request(app)
                .get('/api/v1/flights')
                .expect(200);
            
            const flight = response.body.data[0];
            assert.ok(flight.code);
            assert.ok(flight.origin);
            assert.ok(flight.destination);
            assert.ok(flight.status);
        });
    });

    describe('POST /api/v1/flights', () => {
        it('should add a new flight', async () => {
            const newFlight = {
                code: generateFlightCode(),
                origin: 'JFK',
                destination: 'LAX',
                status: 'ACTIVE'
            };

            const response = await request(app)
                .post('/api/v1/flights')
                .send(newFlight)
                .expect(200);
            
            assert.strictEqual(response.body.status, 200);
            assert.ok(response.body.data);
            assert.strictEqual(response.body.data.code, newFlight.code);
            assert.strictEqual(response.body.data.origin, newFlight.origin);
            assert.strictEqual(response.body.data.destination, newFlight.destination);
            assert.strictEqual(response.body.data.status, newFlight.status);
        });

        it('should retrieve flight by code', async () => {
            const newFlight = {
                code: generateFlightCode(),
                origin: 'SEA',
                destination: 'PDX',
                status: 'ACTIVE'
            };

            await request(app)
                .post('/api/v1/flights')
                .send(newFlight)
                .expect(200);

            const response = await request(app)
                .get(`/api/v1/flights/${newFlight.code}`)
                .expect(200);
            
            assert.strictEqual(response.body.data.code, newFlight.code);
            assert.strictEqual(response.body.data.origin, newFlight.origin);
        });
    });

    describe('POST /api/v1/flights/:code/passengers', () => {
        const passengerId = '550e8400-e29b-41d4-a716-446655440000';
        const passengerData = {
            id: passengerId,
            name: 'John Doe',
            email: 'john.doe@example.com',
            gender: 'Male'
        };

        it('should add a passenger and reserve a seat successfully', async () => {
            const flightCode = 'GOL-123'; // ACTIVE flight with capacity
            
            const response = await request(app)
                .post(`/api/v1/flights/${flightCode}/passengers`)
                .send(passengerData)
                .expect(201);
            
            assert.strictEqual(response.body.status, 201);
            assert.strictEqual(response.body.data.email, passengerData.email);
            assert.strictEqual(response.body.data.name, passengerData.name);
            assert.strictEqual(response.body.reservation.reserved, true);
            assert.strictEqual(response.body.reservation.message, 'Assento reservado com sucesso');
        });

        it('should add passenger but not reserve seat if flight does not exist', async () => {
            const flightCode = 'XXX-999'; // Non-existent flight
            const data = { 
                ...passengerData, 
                id: '550e8400-e29b-41d4-a716-446655440001', 
                email: 'john2@example.com' 
            };

            const response = await request(app)
                .post(`/api/v1/flights/${flightCode}/passengers`)
                .send(data)
                .expect(201);
            
            assert.strictEqual(response.body.status, 201);
            assert.strictEqual(response.body.data.email, data.email);
            assert.strictEqual(response.body.reservation.reserved, false);
            assert.strictEqual(response.body.reservation.message, 'Voo não encontrado. Assento não reservado.');
        });

        it('should add passenger but not reserve seat if flight is CANCELLED', async () => {
            const flightCode = 'TAM-124'; // CANCELLED flight
            const data = { 
                ...passengerData, 
                id: '550e8400-e29b-41d4-a716-446655440002', 
                email: 'john3@example.com' 
            };

            const response = await request(app)
                .post(`/api/v1/flights/${flightCode}/passengers`)
                .send(data)
                .expect(201);
            
            assert.strictEqual(response.body.status, 201);
            assert.strictEqual(response.body.data.email, data.email);
            assert.strictEqual(response.body.reservation.reserved, false);
            assert.ok(response.body.reservation.message.includes('CANCELLED'));
            assert.ok(response.body.reservation.message.includes('Assento não reservado.'));
        });

        it('should add passenger but not reserve seat if flight is full', async () => {
            const flightCode = 'AZU-125'; // Flight with max_capacity 1
            
            // First passenger (fills the flight)
            const firstPassenger = {
                ...passengerData,
                id: '550e8400-e29b-41d4-a716-446655440003',
                email: 'full1@example.com'
            };
            
            await request(app)
                .post(`/api/v1/flights/${flightCode}/passengers`)
                .send(firstPassenger)
                .expect(201);

            // Second passenger (should not get a seat)
            const secondPassenger = {
                ...passengerData,
                id: '550e8400-e29b-41d4-a716-446655440004',
                email: 'full2@example.com'
            };
            
            const response = await request(app)
                .post(`/api/v1/flights/${flightCode}/passengers`)
                .send(secondPassenger)
                .expect(201);
            
            assert.strictEqual(response.body.status, 201);
            assert.strictEqual(response.body.data.email, secondPassenger.email);
            assert.strictEqual(response.body.reservation.reserved, false);
            assert.strictEqual(response.body.reservation.message, 'Voo lotado. Assento não reservado.');
        });

        it('should return 400 if passenger email already exists', async () => {
            const flightCode = 'GOL-123';
            
            // Try to add the same passenger again (email already used in first test)
            const response = await request(app)
                .post(`/api/v1/flights/${flightCode}/passengers`)
                .send(passengerData)
                .expect(400);
            
            assert.strictEqual(response.body.status, 400);
            assert.strictEqual(response.body.message, 'Passenger already exists');
        });
    });
});