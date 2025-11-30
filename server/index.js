const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const airtableRoutes = require('./routes/airtable');
const formRoutes = require('./routes/forms');
const webhookRoutes = require('./routes/webhooks');

app.use('/auth', authRoutes);
app.use('/api/airtable', airtableRoutes);
app.use('/api/forms', formRoutes);
app.use('/webhooks', webhookRoutes);

app.get('/', (req, res) => {
  res.send('Airtable-Connected Form Builder API');
});

// MongoDB Connection (Placeholder)
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
