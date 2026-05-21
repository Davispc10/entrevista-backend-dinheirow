import { describe, it } from 'mocha'
import * as assert from 'assert'
import request from 'supertest'
import app from '../src/index'

function generateFlightCode(): string {
    const airlines = ['GOL', 'AZU', 'TAM']
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    const number = Math.floor(Math.random() * 500) + 1
    return `${airline}-${number.toString()}`
}

describe('Flights API Integration Tests', () => {
    describe('GET /api/v1/flights', () => {
        it('should return all flights', async () => {
            const newFlight = {
                code: generateFlightCode(),
                origin: 'JFK',
                destination: 'LAX',
                status: 'ACTIVE',
            }

            await request(app)
                .post('/api/v1/flights')
                .send(newFlight)
                .expect(200)

            const response = await request(app)
                .get('/api/v1/flights')
                .expect(200)

            assert.strictEqual(response.body.status, 200)
            assert.ok(response.body.data)
            assert.ok(Array.isArray(response.body.data))
            assert.ok(response.body.data.length > 0)
        })

        it('should return flights with correct structure', async () => {
            const response = await request(app)
                .get('/api/v1/flights')
                .expect(200)

            const flight = response.body.data[0]
            assert.ok(flight.code)
            assert.ok(flight.origin)
            assert.ok(flight.destination)
            assert.ok(flight.status)
        })
    })

    describe('POST /api/v1/flights', () => {
        it('should add a new flight', async () => {
            const newFlight = {
                code: generateFlightCode(),
                origin: 'JFK',
                destination: 'LAX',
                status: 'ACTIVE',
            }

            const response = await request(app)
                .post('/api/v1/flights')
                .send(newFlight)
                .expect(200)

            assert.strictEqual(response.body.status, 200)
            assert.ok(response.body.data)
            assert.strictEqual(response.body.data.code, newFlight.code)
            assert.strictEqual(response.body.data.origin, newFlight.origin)
            assert.strictEqual(
                response.body.data.destination,
                newFlight.destination
            )
            assert.strictEqual(response.body.data.status, newFlight.status)
        })

        it('should retrieve flight by code', async () => {
            const newFlight = {
                code: generateFlightCode(),
                origin: 'SEA',
                destination: 'PDX',
                status: 'ACTIVE',
            }

            await request(app)
                .post('/api/v1/flights')
                .send(newFlight)
                .expect(200)

            const response = await request(app)
                .get(`/api/v1/flights/${newFlight.code}`)
                .expect(200)

            assert.strictEqual(response.body.data.code, newFlight.code)
            assert.strictEqual(response.body.data.origin, newFlight.origin)
        })
    })
})
