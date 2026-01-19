const mongoose = require('mongoose');

const RevenueSchema = new mongoose.Schema({
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
    client: {
        type: String,
        required: true,
        maxLength:50,
        trim: true
    },
    service: {
        type: String,
        enum: ['Introductory Massager', '1 Hour Massage', 'Kinesiology Tape', '8 Hours Teaching', 'Gift Certificate'],
        required: false,
        default: "1 Hour Massage"
    },
    quantity: {
        type: Number,
        required: false,
        trim: true,
        min: 0
    },
    addOnService: {
        type: String,
        required: false,
        maxLength:50,
        trim: true
    },
    serviceLocation: {
        type: String,
        enum: ['MA', 'NH', 'NJ', 'FL'],
        required: false
    },
    serviceFee: {
        type: mongoose.Decimal128,
        required: false,
        min: 0
    },
    travelFee: {
        type: mongoose.Decimal128,
        required: false,
        min: 0
    },
    discount: {
        type: mongoose.Decimal128,
        required: false,
        min: 0
    },
    discountReason: {
        type: String,
        required: false,
        maxLength:50,
        trim: true
    },
    paymentType: {
        type: String,
        enum: ['Venmo', 'Cash', 'Check', 'Gift Certificate'],
        required: false,
        default: false
    },
    transactionFee: {
        type: mongoose.Decimal128,
        required: false,
        min: 0
    },
    actualRevenue: {
        type: mongoose.Decimal128,
        required: false,
        min: 0
    },
    invoiceNumber: {
        type: Number,
        required: false,
        trim: true,
        min: 0
    }
}, {timestamps: true, collection: 'revenue'})

module.exports = mongoose.model('Revenue', RevenueSchema)