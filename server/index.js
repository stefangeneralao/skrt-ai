const express = require('express');
const path = require('path');

const port = process.env.PORT || 3004;
const app = express();
const buildPath = path.resolve(__dirname, '../src');

app.use(['/skrt-ai', '/'], express.static(buildPath));

app.listen(port, () => {
  console.log(`Listening to port ${ port }.`);
});