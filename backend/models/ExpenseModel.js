const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        trim: true
    },
    vendor: {
        type: String,
        required: true,
        maxLength:100,
        trim: true
    },
    location: {
        type: String,
        required: true,
        maxLength:100,
        trim: true
    },
    expenseType: {
        type: String,
        required: true,
        enum: ['Airfare', 'Hotel', 'Rental Car', 'Food', 'Parking', 'Professional', 'Supplies', 'Home Office Expenses', 'Gas', 'Gym', 'Car Payment', 'Car Maintenance'],
        default: false
    },
    expenseDescription: {
        type: String,
        required: false,
        maxLength:100,
        trim: true
    },
    amount: {
        type: mongoose.Decimal128,
        required: false,
        min: 0
    },
    paymentType: {
        type: String,
        required: false,
        enum: ['Cash', 'Check', 'Chase Credit Card', 'Venmo', 'AutoPay Needham Bank'],
        default: false
    },
    businessTrip: {
        type: Boolean,
        required: false,
        default: false
    },
    expenseRecordNumber: {
        type: Number,
        required: false,
        trim: true,
        min: 0
    }
}, {timestamps: true})

module.exports = mongoose.model('Expense', ExpenseSchema)