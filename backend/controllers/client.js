const ClientSchema = require("../models/ClientModel")
const mongoose = require("mongoose")

exports.addClient = async (req, res) => {
    const { userid, Name, Timestamp, PhoneNumber, MailingAddress, TownStateZip, Email, BarnAddress, BarnContact, HorseName, BreedType, Age_DOB, Gender, Color, Discipline, OftenTrainedRidden, Medications, PriorInjuries, ConcernsProblems, HorseTie, PreviousMassage, AdditionalInformation, VetClinicName, PhotoVideo, WaiverPermission, MedicalConditionUpdate, ReferralSource, PeppermintSugarCubes } = req.body

    const client = ClientSchema({
        userid,
        Timestamp,
        Name,
        PhoneNumber,
        MailingAddress,
        TownStateZip,
        Email,
        BarnAddress,
        BarnContact,
        HorseName,
        BreedType,
        Age_DOB,
        Gender,
        Color,
        Discipline,
        OftenTrainedRidden,
        Medications,
        PriorInjuries,
        ConcernsProblems,
        HorseTie,
        PreviousMassage,
        AdditionalInformation,
        VetClinicName,
        PhotoVideo,
        WaiverPermission,
        MedicalConditionUpdate,
        ReferralSource,
        PeppermintSugarCubes
    })

    try {
        if (!userid || !Name) {
            return res.status(400).json({ message: 'User ID and Client Name are required' })
        }

        await client.save()
        res.status(200).json({ message: 'Client Added' })
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({ message: 'Server Error' })
    }

    // console.log(client)
}

exports.getClients = async (req, res) => {
    try {
        let { userid } = req.query

        console.log("=== DEBUG: getClients called ===")
        console.log("User ID received (raw):", userid)
        console.log("User ID type:", typeof userid)
        console.log("User ID length:", userid ? userid.length : 'null')

        if (!userid) {
            return res.status(400).json({ message: 'User ID is required' })
        }

        // Trim whitespace
        userid = userid.trim();
        console.log("User ID after trim:", userid)
        console.log("User ID after trim length:", userid.length)

        // Log all client records in DB to debug
        const allClients = await ClientSchema.find({}).limit(5)
        console.log("Sample records in DB:", allClients.map(c => ({ userid: c.userid, name: c.name })))

        // Try to find with exact string match first
        let clients = await ClientSchema.find({ userid: userid }).sort({ createdAt: -1 })
        console.log("Clients found (string match) count:", clients.length)

        // If no results and userid looks like an ObjectId, try ObjectId comparison
        if (clients.length === 0 && mongoose.Types.ObjectId.isValid(userid)) {
            console.log("No string match found, trying ObjectId comparison...")
            try {
                const objectId = new mongoose.Types.ObjectId(userid)
                clients = await ClientSchema.find({ userid: objectId }).sort({ createdAt: -1 })
                console.log("Clients found (ObjectId match) count:", clients.length)
            } catch (err) {
                console.log("ObjectId conversion failed:", err.message)
            }
        }

        // If still no results, try case-insensitive regex search
        if (clients.length === 0) {
            console.log("No match found yet, trying case-insensitive regex search...")
            clients = await ClientSchema.find({ userid: { $regex: userid, $options: 'i' } }).sort({ createdAt: -1 })
            console.log("Clients found (case-insensitive) count:", clients.length)
        }

        console.log("Final clients data count:", clients.length)
        console.log("=== END DEBUG ===")
        res.status(200).json(clients)
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({ message: 'Server Error' })
    }
}

exports.deleteClient = async (req, res) => {
    const { id } = req.params

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid client ID' })
        }

        await ClientSchema.findByIdAndDelete(id)
        res.status(200).json({ message: 'Client Deleted' })
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({ message: 'Server Error' })
    }
}

exports.editClient = async (req, res) => {
    const { id } = req.params
    const { 
        name, phoneNumber, email, mailingAddress, townStateZip, barnAddress, 
        barnContact, horseName, breedType, age_DOB, gender, color, discipline, 
        oftenTrainedRidden, medications, priorInjuries, concernsProblems, horseTie, 
        previousMassage, additionalInformation, vetClinicName, photoVideo, 
        waiverPermission, medicalConditionUpdate, referralSource, peppermintSugarCubes 
    } = req.body

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid client ID' })
        }

        if (!name) {
            return res.status(400).json({ message: 'Client Name is required' })
        }

        const updateData = {
            Name: name,
            PhoneNumber: phoneNumber,
            Email: email,
            MailingAddress: mailingAddress,
            TownStateZip: townStateZip,
            BarnAddress: barnAddress,
            BarnContact: barnContact,
            HorseName: horseName,
            BreedType: breedType,
            Age_DOB: age_DOB,
            Gender: gender,
            Color: color,
            Discipline: discipline,
            OftenTrainedRidden: oftenTrainedRidden,
            Medications: medications,
            PriorInjuries: priorInjuries,
            ConcernsProblems: concernsProblems,
            HorseTie: horseTie,
            PreviousMassage: previousMassage,
            AdditionalInformation: additionalInformation,
            VetClinicName: vetClinicName,
            PhotoVideo: photoVideo,
            WaiverPermission: waiverPermission,
            MedicalConditionUpdate: medicalConditionUpdate,
            ReferralSource: referralSource,
            PeppermintSugarCubes: peppermintSugarCubes
        }

        const updatedClient = await ClientSchema.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' })
        }

        res.status(200).json({ message: 'Client Updated', client: updatedClient })
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message })
    }
}

exports.searchClients = async (req, res) => {
    try {
        const { userid, name, phoneNumber, email, barnContact, horseName } = req.query;
        
        if (!userid) {
            return res.status(400).json({message: 'User ID is required'})
        }
        
        // Build search criteria
        let searchCriteria = { userid: userid.trim() };
        
        // For exact match fields (phone and email), add to search criteria
        if (phoneNumber) {
            searchCriteria['Phone Number'] = phoneNumber.trim();
        }
        if (email) {
            searchCriteria['Email Address'] = email.trim();
        }
        
        // Get initial results
        console.log('Initial search criteria:', JSON.stringify(searchCriteria, null, 2));
        let clients = await ClientSchema.find(searchCriteria).sort({ createdAt: -1 });
        
        // Apply fuzzy matching to name, barnContact, and horseName if provided
        if (name || barnContact || horseName) {
            clients = applyFuzzyMatchClients(clients, name, barnContact, horseName);
        }
        
        console.log('Found client records:', clients.length);
        res.status(200).json(clients);
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

// Fuzzy matching helper function using Levenshtein distance
const levenshteinDistanceClient = (str1, str2) => {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }
    
    return track[str2.length][str1.length];
};

// Calculate relevance score for fuzzy matching
const calculateRelevanceScoreClient = (fieldValue, searchTerm) => {
    if (!fieldValue || !searchTerm) return 0;
    
    const normalizedField = String(fieldValue).toLowerCase();
    const normalizedSearch = searchTerm.toLowerCase();
    
    // Exact match (case-insensitive): highest score
    if (normalizedField === normalizedSearch) return 100;
    
    // Contains match: high score
    if (normalizedField.includes(normalizedSearch)) return 80;
    
    // Fuzzy match: score based on Levenshtein distance
    const maxLen = Math.max(normalizedField.length, normalizedSearch.length);
    const distance = levenshteinDistanceClient(normalizedField, normalizedSearch);
    const similarity = 1 - (distance / maxLen);
    
    // Return score between 0-70 based on similarity
    return similarity >= 0.6 ? similarity * 70 : 0;
};

// Apply fuzzy matching and sort by relevance for client names, barn contact, and horse name
const applyFuzzyMatchClients = (clients, name, barnContact, horseName) => {
    return clients
        .map(client => {
            let relevanceScore = 0;
            
            if (name) {
                relevanceScore += calculateRelevanceScoreClient(client.Name, name);
            }
            
            if (barnContact) {
                relevanceScore += calculateRelevanceScoreClient(client['Barn Contact'], barnContact);
            }
            
            if (horseName) {
                relevanceScore += calculateRelevanceScoreClient(client["Horse's Name"], horseName);
            }
            
            return { ...client.toObject(), _relevanceScore: relevanceScore };
        })
        .filter(client => client._relevanceScore > 0)
        .sort((a, b) => b._relevanceScore - a._relevanceScore);
}

// Webhook endpoint for Google Sheets integration
// This receives new client data from Google Forms submissions
exports.addClientFromGoogleSheets = async (req, res) => {
    console.log('=== Google Sheets Webhook Received ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { 
            apiKey,
            userid,
            Timestamp,
            Name,
            PhoneNumber,
            MailingAddress,
            TownStateZip,
            Email,
            BarnAddress,
            BarnContact,
            HorseName,
            BreedType,
            Age_DOB,
            Gender,
            Color,
            Discipline,
            OftenTrainedRidden,
            Medications,
            PriorInjuries,
            ConcernsProblems,
            HorseTie,
            PreviousMassage,
            AdditionalInformation,
            VetClinicName,
            PhotoVideo,
            WaiverPermission,
            MedicalConditionUpdate,
            ReferralSource,
            PeppermintSugarCubes
        } = req.body;

        // Verify API key for security
        const expectedApiKey = process.env.GOOGLE_SHEETS_API_KEY || 'your-secret-api-key';
        if (apiKey !== expectedApiKey) {
            console.log('Invalid API key provided');
            return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
        }

        if (!userid || !Name) {
            return res.status(400).json({ message: 'User ID and Client Name are required' });
        }

        // Check if client already exists (by Name and HorseName to avoid duplicates)
        const existingClient = await ClientSchema.findOne({ 
            userid: userid,
            Name: Name,
            HorseName: HorseName || ''
        });

        if (existingClient) {
            console.log('Client already exists, skipping:', Name);
            return res.status(200).json({ message: 'Client already exists', skipped: true });
        }

        const client = new ClientSchema({
            userid,
            Timestamp: Timestamp || new Date().toISOString(),
            Name,
            PhoneNumber,
            MailingAddress,
            TownStateZip,
            Email,
            BarnAddress,
            BarnContact,
            HorseName,
            BreedType,
            Age_DOB,
            Gender,
            Color,
            Discipline,
            OftenTrainedRidden,
            Medications,
            PriorInjuries,
            ConcernsProblems,
            HorseTie,
            PreviousMassage,
            AdditionalInformation,
            VetClinicName,
            PhotoVideo,
            WaiverPermission,
            MedicalConditionUpdate,
            ReferralSource,
            PeppermintSugarCubes
        });

        await client.save();
        console.log('Client added successfully from Google Sheets:', Name);
        res.status(200).json({ message: 'Client Added from Google Sheets', client: { Name, HorseName } });
    } catch (error) {
        console.error("Error adding client from Google Sheets:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}
