const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ exposedHeaders: ['X-Video-Duration'] }));
app.post('/get-duration', (req, res) => {
    res.setHeader('X-Video-Duration', req.body.duration);
    res.json({ code: 200 });
});

app.listen(3000, () => console.log('Server running on port 3000'));
