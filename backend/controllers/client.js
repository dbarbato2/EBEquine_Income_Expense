const ClientSchema = require("../models/ClientModel")
const mongoose = require("mongoose")

exports.addClient = async (req, res) => {
    const { userid, name, ownerName, barn, address, emailAddress, phoneNumber } = req.body

    const client = ClientSchema({
        userid, name, ownerName, barn, address, emailAddress, phoneNumber
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

    console.log(client)
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
            { name, ownerName, barn, address, emailAddress, phoneNumber },
            { new: true }
        )

        res.status(200).json({ message: 'Client Updated', client: updatedClient })
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({ message: 'Server Error' })
    }
}
