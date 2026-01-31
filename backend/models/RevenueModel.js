const mongoose = require('mongoose');

const RevenueSchema = new mongoose.Schema({
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
    Client: {
        type: String,
        required: true,
        maxLength:50,
        trim: true
    },
    Service: {
        type: String,
        enum: ['Introductory Massager', '1 Hour Massage', 'Kinesiology Tape', '8 Hours Teaching', 'Gift Certificate'],
        required: false,
        default: "1 Hour Massage"
    },
    Quantity: {
        type: Number,
        required: false,
        trim: true,
        min: 0
    },
    'Add-On Service': {
        type: String,
        required: false,
        maxLength:50,
        trim: true
    },
    'Service Location': {
        type: String,
        enum: ['MA', 'NH', 'NJ', 'FL'],
        required: false
    },
    'Service Fee': {
        type: String,
        required: false,
        trim: true
    },
    'Travel Fee': {
        type: String,
        required: false,
        trim: true
    },
    Discount: {
        type: String,
        required: false,
        trim: true
    },
    'Discount Reason': {
        type: String,
        required: false,
        maxLength:50,
        trim: true
    },
    'Payment Type': {
        type: String,
        enum: ['Venmo', 'Cash', 'Check', 'Gift Certificate'],
        required: false,
        default: false
    },
    'Transaction Fees': {
        type: String,
        required: false,
        trim: true
    },
    'Actual Fees': {
        type: String,
        required: false,
        trim: true
    },
    'Invoice Number': {
        type: Number,
        required: false,
        trim: true,
        min: 0
    }
}, {timestamps: true, collection: 'revenue'})

module.exports = mongoose.model('Revenue', RevenueSchema)