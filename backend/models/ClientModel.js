const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        trim: true
    },
    Timestamp: {
        type: Date,
        required: false
    },
    Name: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true
    },
    PhoneNumber: {
        type: String,
        required: false,
        trim: true
    },
    MailingAddress: {
        type: String,
        required: false,
        trim: true
    },
    TownStateZip: {
        type: String,
        required: false,
        trim: true
    },
    Email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true
    },
    BarnAddress: {
        type: String,
        required: false,
        trim: true
    },
    BarnContact: {
        type: String,
        required: false,
        trim: true
    },
    HorseName: {
        type: String,
        required: false,
        trim: true
    },
    BreedType: {
        type: String,
        required: false,
        trim: true
    },
    Age_DOB: {
        type: String,
        required: false,
        trim: true
    },
    Gender: {
        type: String,
        required: false,
        trim: true
    },
    Color: {
        type: String,
        required: false,
        trim: true
    },
    Discipline: {
        type: String,
        required: false,
        trim: true
    },
    OftenTrainedRidden: {
        type: String,
        required: false,
        trim: true
    },
    Medications: {
        type: String,
        required: false,
        trim: true
    },
    PriorInjuries: {
        type: String,
        required: false,
        trim: true
    },
    ConcernsProblems: {
        type: String,
        required: false,
        trim: true
    },
    HorseTie: {
        type: String,
        required: false,
        trim: true
    },
    PreviousMassage: {
        type: String,
        required: false,
        trim: true
    },
    AdditionalInformation: {
        type: String,
        required: false,
        trim: true
    },
    VetClinicName: {
        type: String,
        required: false,
        trim: true
    },
    PhotoVideo: {
        type: String,
        required: false,
        trim: true
    },
    WaiverPermission: {
        type: String,
        required: false,
        trim: true
    },
    MedicalConditionUpdate: {
        type: String,
        required: false,
        trim: true
    },
    ReferralSource: {
        type: String,
        required: false,
        trim: true
    },
    PeppermintSugarCubes: {
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
