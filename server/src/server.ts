import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import routes from './routes/index.js';
import { sequelize } from './models/index.js';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the client's dist folder
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.use(express.json());
app.use(routes); // Register routes under the /api prefix

// Fallback route to serve the index.html file for any other requests
app.get('*', (_req, res) => {
	res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

const forceDatabaseRefresh = false;

sequelize.sync({ force: forceDatabaseRefresh }).then(() => {
	app.listen(PORT, () => {
		console.log(`Server is listening on port ${PORT}`);
	});
});
