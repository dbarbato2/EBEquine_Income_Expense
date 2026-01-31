const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        trim: true
    },
    Date: {
        type: Date,
        required: true,
        trim: true
    },
    'Vendor/Payee': {
        type: String,
        required: true,
        maxLength:100,
        trim: true
    },
    Location: {
        type: String,
        required: true,
        maxLength:100,
        trim: true
    },
    'Expense Type': {
        type: String,
        required: true,
        enum: ['Airfare', 'Hotel', 'Rental Car', 'Food', 'Parking', 'Professional', 'Supplies', 'Home Office Expenses', 'Gas', 'Gym', 'Car Payment', 'Car Maintenance'],
        default: false
    },
    'Expense Description': {
        type: String,
        required: false,
        maxLength:100,
        trim: true
    },
    Amount: {
        type: String,
        required: false,
        trim: true
    },
    'Payment Type': {
        type: String,
        required: false,
        enum: ['Cash', 'Check', 'Chase Credit Card', 'Venmo', 'AutoPay Needham Bank'],
        default: false
    },
    'Associated with a Business Trip': {
        type: String,
        required: false,
        default: null
    },
    'Expense Record Number': {
        type: Number,
        required: false,
        trim: true,
        min: 0
    }
}, {timestamps: true})

module.exports = mongoose.model('Expense', ExpenseSchema)