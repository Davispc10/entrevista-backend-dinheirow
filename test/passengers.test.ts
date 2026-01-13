import { describe, it } from 'mocha'
import * as assert from 'assert'
import request from 'supertest'
import app from '../src/index'

describe('Passengers API Integration Tests', () => {
    describe('POST /api/v1/passengers', () => {
        it('should create a new passenger', async () => {
            const newPassenger = {
                name: 'John Doe',
                email: `john.doe.${Date.now()}@email.com`,
                gender: 'Male',
            }

            const response = await request(app)
                .post('/api/v1/passengers')
                .send(newPassenger)
                .expect(201)

            assert.strictEqual(response.body.status, 201)
            assert.ok(response.body.data)
            assert.strictEqual(response.body.data.name, newPassenger.name)
            assert.strictEqual(response.body.data.email, newPassenger.email)
            assert.strictEqual(response.body.data.gender, newPassenger.gender)
            assert.ok(response.body.data.id)
        })

        it('should prevent creating a passenger with duplicate email', async () => {
            const email = `duplicate.${Date.now()}@email.com`
            const newPassenger = {
                name: 'First Passenger',
                email: email,
                gender: 'Male',
            }

            await request(app)
                .post('/api/v1/passengers')
                .send(newPassenger)
                .expect(201)

            const duplicatePassenger = {
                name: 'Second Passenger',
                email: email,
                gender: 'Female',
            }

            const response = await request(app)
                .post('/api/v1/passengers')
                .send(duplicatePassenger)
                .expect(500)

            assert.ok(response.body.message.includes('already exists'))
        })
    })

    describe('GET /api/v1/passengers/:id', () => {
        it('should get passenger by id', async () => {
            const newPassenger = {
                name: 'Jane Smith',
                email: `jane.smith.${Date.now()}@email.com`,
                gender: 'Female',
            }

            const createResponse = await request(app)
                .post('/api/v1/passengers')
                .send(newPassenger)
                .expect(201)

            const passengerId = createResponse.body.data.id

            const response = await request(app)
                .get(`/api/v1/passengers/${passengerId}`)
                .expect(200)

            assert.strictEqual(response.body.status, 200)
            assert.ok(response.body.data)
            assert.strictEqual(response.body.data.id, passengerId)
            assert.strictEqual(response.body.data.name, newPassenger.name)
        })

        it('should return error for non-existent passenger', async () => {
            const response = await request(app)
                .get('/api/v1/passengers/non-existent-id')
                .expect(500)

            assert.ok(response.body.message.includes('not found'))
        })
    })

    describe('POST /api/v1/passengers/:id/flights/:flightCode', () => {
        it('should add passenger to active flight', async () => {
            const newPassenger = {
                name: 'Test Passenger',
                email: `test.${Date.now()}@email.com`,
                gender: 'Male',
            }

            const passengerResponse = await request(app)
                .post('/api/v1/passengers')
                .send(newPassenger)
                .expect(201)

            const passengerId = passengerResponse.body.data.id

            const timestamp = Date.now().toString().slice(-3)
            const newFlight = {
                code: `TES-${timestamp}`,
                origin: 'JFK',
                destination: 'LAX',
                status: 'ACTIVE',
            }

            const flightResponse = await request(app)
                .post('/api/v1/flights')
                .send(newFlight)
                .expect(200)

            const flightCode = flightResponse.body.data.code

            const response = await request(app)
                .post(`/api/v1/passengers/${passengerId}/flights/${flightCode}`)
                .expect(201)

            assert.strictEqual(response.body.status, 201)
            assert.ok(response.body.data)
            assert.strictEqual(response.body.data.passenger_id, passengerId)
            assert.strictEqual(response.body.data.flight_code, flightCode)
        })

        it('should prevent adding passenger to cancelled flight', async () => {
            const newPassenger = {
                name: 'Cancelled Flight Passenger',
                email: `cancelled.${Date.now()}@email.com`,
                gender: 'Female',
            }

            const passengerResponse = await request(app)
                .post('/api/v1/passengers')
                .send(newPassenger)
                .expect(201)

            const passengerId = passengerResponse.body.data.id

            const timestamp = Date.now().toString().slice(-3)
            const cancelledFlight = {
                code: `CAN-${timestamp}`,
                origin: 'SFO',
                destination: 'NYC',
                status: 'cancelled',
            }

            const flightResponse = await request(app)
                .post('/api/v1/flights')
                .send(cancelledFlight)
                .expect(200)

            const flightCode = flightResponse.body.data.code

            const response = await request(app)
                .post(`/api/v1/passengers/${passengerId}/flights/${flightCode}`)
                .expect(500)

            assert.ok(response.body.message.includes('cancelled'))
        })

        it('should prevent adding same passenger twice to the same flight', async () => {
            const newPassenger = {
                name: 'Duplicate Passenger',
                email: `duplicate.flight.${Date.now()}@email.com`,
                gender: 'Male',
            }

            const passengerResponse = await request(app)
                .post('/api/v1/passengers')
                .send(newPassenger)
                .expect(201)

            const passengerId = passengerResponse.body.data.id

            const timestamp = Date.now().toString().slice(-3)
            const newFlight = {
                code: `DUP-${timestamp}`,
                origin: 'MIA',
                destination: 'ORD',
                status: 'ACTIVE',
            }

            const flightResponse = await request(app)
                .post('/api/v1/flights')
                .send(newFlight)
                .expect(200)

            const flightCode = flightResponse.body.data.code

            await request(app)
                .post(`/api/v1/passengers/${passengerId}/flights/${flightCode}`)
                .expect(201)

            const response = await request(app)
                .post(`/api/v1/passengers/${passengerId}/flights/${flightCode}`)
                .expect(500)

            assert.ok(response.body.message.includes('already in flight'))
        })

        it('should cadastrar um cliente e adicionar ele ao voo com retorno 201', async () => {
            const newPassenger = {
                name: 'Cliente Teste',
                email: `cliente.${Date.now()}@email.com`,
                gender: 'Male',
            }

            const passengerResponse = await request(app)
                .post('/api/v1/passengers')
                .send(newPassenger)
                .expect(201)

            const passengerId = passengerResponse.body.data.id

            const timestamp = Date.now().toString().slice(-3)
            const newFlight = {
                code: `CLI-${timestamp}`,
                origin: 'GRU',
                destination: 'GIG',
                status: 'ACTIVE',
            }

            const flightResponse = await request(app)
                .post('/api/v1/flights')
                .send(newFlight)
                .expect(200)

            const flightCode = flightResponse.body.data.code

            const response = await request(app)
                .post(`/api/v1/passengers/${passengerId}/flights/${flightCode}`)
                .expect(201)

            assert.strictEqual(response.body.status, 201)
            assert.ok(response.body.data)
            assert.strictEqual(response.body.data.passenger_id, passengerId)
            assert.strictEqual(response.body.data.flight_code, flightCode)
        })
    })
})
