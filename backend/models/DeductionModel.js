const mongoose = require('mongoose');

const DeductionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    amount: {
        type: Number,
        required: true,
        maxLength:20,
        trim: true
    },
    type: {
        type: String,
        default: "deduction"
    },
    date: {
        type: Date,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxLength:20,
        trim: true
    },
    userid: {
        type: String,
        required: true,
        maxLength: 40
    }
}, {timestamps: true})

module.exports = mongoose.model('Deduction', DeductionSchema)