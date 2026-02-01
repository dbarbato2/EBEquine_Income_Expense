const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        trim: true
    },
    Name: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true
    },
    'Owner Name': {
        type: String,
        required: false,
        maxLength: 50,
        trim: true
    },
    Barn: {
        type: String,
        required: false,
        maxLength: 50,
        trim: true
    },
    Address: {
        type: String,
        required: false,
        maxLength: 200,
        trim: true
    },
    'Email Address': {
        type: String,
        required: false,
        trim: true,
        lowercase: true
    },
    'Phone Number': {
        type: String,
        required: false,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'clients' });

module.exports = mongoose.model('Client', ClientSchema);
