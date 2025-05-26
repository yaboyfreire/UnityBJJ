const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files (CSS, JS, images, etc.) from the VScode folder
app.use(express.static(path.join(__dirname, 'VScode')));

// Serve the HTML file on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'VScode', 'GenericHomePage.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
