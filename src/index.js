const express = require('express');
const cors = require('cors');
const router = require('./routes/productoRoute');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', router);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {console.log("Servicio arriba en puerto", PORT)});
