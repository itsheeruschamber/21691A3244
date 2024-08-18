nconst express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/ayush');
const db = mongoose.connection;
db.on('connected', () => {
    console.log('Connected to MongoDB');
});
const registrationSchema = new mongoose.Schema({
    companyName: String,
    clientID: String,
    clientSecret: String,
    ownerName: String,
    ownerEmail: String,
    rollNo: String,
});
const Registration = mongoose.model('Registration', registrationSchema);
app.post('/test/auth', async (req, res) => {
    const { companyName, clientID, clientSecret, ownerName, ownerEmail, rollNo } = req.body;
    try {
        const registration = await Registration.findOne({ companyName, clientID, clientSecret });
        if (registration) {
            const token = jwt.sign(
                {
                    companyName: registration.companyName,
                    ownerName: registration.ownerName,
                    ownerEmail: registration.ownerEmail,
                    rollNo: registration.rollNo,
                },
                'your_secret_key', 
                { expiresIn: '7d' } 
            );
            res.status(200).json({
                token_type: 'Bearer',
                access_token: token,
                expires_in: Math.floor(Date.now() / 1000) + 604800,
            });
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Error generating authorization token:', error);
        res.status(500).json({ error: 'Failed to generate authorization token' });
    }
});
app.post('/test/register', async (req, res) => {
    const { companyName, ownerName, rollNo, ownerEmail, accessCode } = req.body;
    const clientID = uuidv4();
    const clientSecret = generateRandomString();
    try {
        const registration = new Registration({
            companyName,
            clientID,
            clientSecret,
            ownerName,
            ownerEmail,
            rollNo,
        });
        await registration.save();
        res.json({
            companyName,
            clientID,
            clientSecret,
            ownerName,
            ownerEmail,
            rollNo,
        });
    } catch (error) {
        console.error('Error saving registration:', error);
        res.status(500).json({ error: 'Failed to register company' });
    }
});
app.get('/test/register', async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
});
function generateRandomString() {
    return crypto.randomBytes(16).toString('hex');
}
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});