import mongoose, { Schema } from 'mongoose';

interface Passenger {
    id: string;
    name: string;
    email: string;
    gender: string;
}

const schema = new Schema<Passenger>(
    {
        id: { required: true, type: String, unique: true },
        name: { required: true, type: String },
        email: { required: true, type: String, unique: true },
        gender: { required: true, type: String },
    },
    { timestamps: true },
);

export const PassengersModel = mongoose.model('Passengers', schema);
