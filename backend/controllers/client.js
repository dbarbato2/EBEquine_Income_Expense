const ClientSchema = require("../models/ClientModel")
const mongoose = require("mongoose")

exports.addClient = async (req, res) => {
    const { userid, name, ownerName, barn, address, emailAddress, phoneNumber } = req.body

    const client = ClientSchema({
        userid,
        Name: name,
        'Owner Name': ownerName,
        Barn: barn,
        Address: address,
        'Email Address': emailAddress,
        'Phone Number': phoneNumber
    })

    try {
        if (!userid || !name) {
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
    const { name, ownerName, barn, address, emailAddress, phoneNumber } = req.body

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid client ID' })
        }

        if (!name) {
            return res.status(400).json({ message: 'Client Name is required' })
        }

        const updatedClient = await ClientSchema.findByIdAndUpdate(
            id,
            { 
                Name: name,
                'Owner Name': ownerName,
                Barn: barn,
                Address: address,
                'Email Address': emailAddress,
                'Phone Number': phoneNumber
            },
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
        const { userid, name, ownerName } = req.query;
        
        if (!userid) {
            return res.status(400).json({message: 'User ID is required'})
        }
        
        // Build search criteria
        let searchCriteria = { userid: userid.trim() };
        
        // Get initial results without fuzzy matching on name/owner
        console.log('Initial search criteria:', JSON.stringify(searchCriteria, null, 2));
        let clients = await ClientSchema.find(searchCriteria).sort({ createdAt: -1 });
        
        // Apply fuzzy matching to name and ownerName if provided
        if (name || ownerName) {
            clients = applyFuzzyMatchClients(clients, name, ownerName);
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

// Apply fuzzy matching and sort by relevance for client names
const applyFuzzyMatchClients = (clients, name, ownerName) => {
    return clients
        .map(client => {
            let relevanceScore = 0;
            
            if (name) {
                relevanceScore += calculateRelevanceScoreClient(client.Name, name);
            }
            
            if (ownerName) {
                relevanceScore += calculateRelevanceScoreClient(client['Owner Name'], ownerName);
            }
            
            return { ...client.toObject(), _relevanceScore: relevanceScore };
        })
        .filter(client => client._relevanceScore > 0)
        .sort((a, b) => b._relevanceScore - a._relevanceScore);
}
