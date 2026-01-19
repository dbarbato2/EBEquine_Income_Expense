const mongoose = require('mongoose');

const DeductionSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        trim: true
    },
    month: {
        type: String,
        required: true,
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        default: false
    },
    deductionType: {
        type: String,
        required: true,
        enum: ['Mileage', 'Tolls', 'Car Payment', 'Auto Insurance', 'Gym Membership', 'Mortgage', 'Real Estate Taxes', 'Internet', 'Utilities - Electric', 'Utilities - Gas', 'Lawn Maintenance', 'Recycling/Rubbish', 'Utilities - Water'],
        default: false
    },
    deductionDescription: {
        type: String,
        required: false,
        maxLength:100,
        trim: true
    },
    deductionAmount: {
        type: mongoose.Decimal128,
        required: false,
        min: 0
    },
    deductionRecordNumber: {
        type: Number,
        required: false,
        trim: true,
        min: 0
    }
}, {timestamps: true})

module.exports = mongoose.model('Deduction', DeductionSchema)