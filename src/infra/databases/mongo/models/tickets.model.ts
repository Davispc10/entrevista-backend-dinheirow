import mongoose, { Schema } from 'mongoose';

interface Ticket {
    passenger_id: string;
    flight_code: string;
}

const schema = new Schema<Ticket>(
    {
        passenger_id: { required: true, type: String },
        flight_code: { required: true, type: String },
    },
    { timestamps: true },
);

schema.index({ passenger_id: 1, flight_code: 1 }, { unique: true });

export const TicketsModel = mongoose.model('Tickets', schema);
