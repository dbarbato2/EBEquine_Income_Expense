const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true
    },
    ownerName: {
        type: String,
        required: false,
        maxLength: 50,
        trim: true
    },
    barn: {
        type: String,
        required: false,
        maxLength: 50,
        trim: true
    },
    address: {
        type: String,
        required: false,
        maxLength: 200,
        trim: true
    },
    emailAddress: {
        type: String,
        required: false,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
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
