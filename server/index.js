const express = require('express');
const path = require('path');

const port = process.env.PORT || 3004;
const app = express();
const buildPath = path.resolve(__dirname, '../src');

app.use(['/skrt-ai', '/'], express.static(buildPath));

app.get('/models/elite.json', (_req, res) => {
  res.sendFile(path.join(__dirname, 'models/elite.json'));
});

app.get('/models/elite.weights.bin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'models/elite.weights.bin'));
});

app.listen(port, () => {
  console.log(`Listening to port ${ port }.`);
});