import mongoose, { Schema } from 'mongoose'
import { CreatePassengerData } from '../../../../domain/entities/Passenger'

const schema = new Schema<CreatePassengerData>(
    {
        name: { required: true, type: String },
        email: { required: true, type: String, unique: true },
        gender: String,
    },
    { timestamps: true }
)

export const PassengersModel = mongoose.model('Passengers', schema)
