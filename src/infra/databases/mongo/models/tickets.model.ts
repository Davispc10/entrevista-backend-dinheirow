import mongoose, { Schema } from 'mongoose'
import { CreateTicketData } from '../../../../domain/entities/Ticket'

const schema = new Schema<CreateTicketData>(
    {
        _id: { required: true, type: String },
        passengerId: { required: true, type: String },
        flightCode: { required: true, type: String },
    },
    { timestamps: true }
)

schema.index({ passengerId: 1, flightCode: 1 }, { unique: true })

export const TicketsModel = mongoose.model('Tickets', schema)
