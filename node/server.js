import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import cors from 'cors';

import loginRouter from './login.js';
import menuRouter from './menu.js';
import stsRouter from './sts.js';
import counts from './counts.js';
import initial from './socket-io.js';
import excelUpload from "./excelUpload.js";
import { generatePDF, generateStockPDF } from './pdfGenerator.js';

const app = express();
const port = 3002;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-access-token'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

app.use('/api/login', loginRouter);
app.use('/api/menu', menuRouter);
app.use('/api/sts', stsRouter);
app.use('/api/counts', counts);
app.use('/api/excel', excelUpload);

app.get('/generate-pdf/:pw_id', async (req, res) => {
  try {
    const { pw_id } = req.params;
    const pdfBuffer = await generatePDF(pw_id);

    res.setHeader('Content-Disposition', `attachment; filename="document.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

app.post('/generate-stock-pdf', async (req, res) => {
  try {
    const { stockData, type } = req.body;

    if (!type) {
      console.error('Type is missing in the request body');
      return res.status(400).send('Type is required');
    }

    const pdfBuffer = await generateStockPDF(stockData, type);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Stock${type}_Report_${Date.now()}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

const server = http.createServer(app);
initial?.initializeSocketIO?.(server);

server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});