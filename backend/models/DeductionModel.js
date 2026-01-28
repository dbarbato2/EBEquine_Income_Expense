const mongoose = require('mongoose');

const DeductionSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        trim: true
    },
    Month: {
        type: String,
        required: true,
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        default: false
    },
    Year: {
        type: Number,
        required: true,
        min: 2000,
        max: 2100
    },
    'Deduction Type': {
        type: String,
        required: true,
        enum: ['Mileage', 'Tolls', 'Car Payment', 'Auto Insurance', 'Gym Membership', 'Mortgage', 'Real Estate Taxes', 'Internet', 'Utilities - Electric', 'Utilities - Gas', 'Lawn Maintenance', 'Recycling/Rubbish', 'Utilities - Water'],
        default: false
    },
    'Deduction Description': {
        type: String,
        required: false,
        maxLength:100,
        trim: true
    },
    'Deduction Amount': {
        type: String,
        required: false,
        trim: true
    },
    'Deduction Record Number': {
        type: Number,
        required: false,
        trim: true,
        min: 0
    }
}, {timestamps: true})

module.exports = mongoose.model('Deduction', DeductionSchema)