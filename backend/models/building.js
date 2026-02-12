import mongoose from 'mongoose';

const BuildingSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    depth: {
        type: Number,
        required: true,
    },
    terrain: {
        type: String,
        required: true,
    },
    frequency: {
        type: Number,
        required: true,
    },
    url: {
        type: String,
        required: true,
    }
})

const BuildingModel = mongoose.model('Building', BuildingSchema);
export default BuildingModel;