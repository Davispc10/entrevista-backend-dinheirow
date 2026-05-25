import { describe, it } from 'mocha'
import * as assert from 'assert'
import request from 'supertest'
import app from '../src/index'

function generateFlightCode(): string {
    const number = Math.floor(Math.random() * 900) + 100
    return `TST-${number.toString()}`
}

describe('Passengers API Integration Tests', () => {
    it('should create a passenger', async () => {
        const passenger = {
            name: 'John Smith',
            email: `john.${Date.now()}@email.com`,
            gender: 'Male',
        }

        const response = await request(app)
            .post('/api/v1/passengers')
            .send(passenger)
            .expect(200)

        assert.strictEqual(response.body.status, 200)
        assert.ok(response.body.data.id)
        assert.strictEqual(response.body.data.name, passenger.name)
        assert.strictEqual(response.body.data.email, passenger.email)
        assert.strictEqual(response.body.data.gender, passenger.gender)
    })

    it('should add an existing passenger to a flight', async () => {
        const flight = {
            code: generateFlightCode(),
            origin: 'SEA',
            destination: 'PDX',
            status: 'ACTIVE',
        }

        const passenger = {
            name: 'John Smith',
            email: `john.${Date.now()}@email.com`,
            gender: 'Male',
        }

        await request(app).post('/api/v1/flights').send(flight).expect(200)

        const passengerResponse = await request(app)
            .post('/api/v1/passengers')
            .send(passenger)
            .expect(200)

        const response = await request(app)
            .post(`/api/v1/flights/${flight.code}/passengers`)
            .send({ passengerId: passengerResponse.body.data.id })
            .expect(200)

        assert.strictEqual(response.body.status, 200)
        assert.ok(response.body.data.id)
        assert.strictEqual(response.body.data.passengerId, passengerResponse.body.data.id)
        assert.strictEqual(response.body.data.flightCode, flight.code)

        const flightResponse = await request(app)
            .get(`/api/v1/flights/${flight.code}`)
            .expect(200)

        assert.ok(
            flightResponse.body.data.passengers.some(
                (item: { email: string }) => item.email === passenger.email
            )
        )
    })

    it('should not add a passenger to a cancelled flight', async () => {
        const flight = {
            code: generateFlightCode(),
            origin: 'GRU',
            destination: 'LAX',
            status: 'cancelled',
        }

        const passenger = {
            name: 'Ana Roberts',
            email: `ana.${Date.now()}@email.com`,
            gender: 'Female',
        }

        await request(app).post('/api/v1/flights').send(flight).expect(200)

        const passengerResponse = await request(app)
            .post('/api/v1/passengers')
            .send({
                name: passenger.name,
                email: passenger.email,
                gender: passenger.gender,
            })
            .expect(200)

        await request(app)
            .post(`/api/v1/flights/${flight.code}/passengers`)
            .send({ passengerId: passengerResponse.body.data.id })
            .expect(400)

        const flightResponse = await request(app)
            .get(`/api/v1/flights/${flight.code}`)
            .expect(200)

        assert.ok(
            !flightResponse.body.data.passengers.some(
                (item: { email: string }) => item.email === passenger.email
            )
        )
    })

    it('should validate required fields when creating a passenger', async () => {
        await request(app)
            .post('/api/v1/passengers')
            .send({
                name: 'Missing Email',
                gender: 'Male',
            })
            .expect(400)
    })

    it('should validate required fields when adding a passenger to a flight', async () => {
        await request(app)
            .post('/api/v1/flights/GOL-123/passengers')
            .send({})
            .expect(400)
    })
})
