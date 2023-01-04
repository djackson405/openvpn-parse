const express = require('express');
const utils = require('./utils');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Set the view engine to EJS
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  try {
    const joinedArray = await utils.parseLog('status.log');
    res.render('index', { joinedArray });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error parsing log file');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});