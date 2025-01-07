const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
app.use(fileUpload());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let mp4File = req.files.mp4File;
    let uploadPath = __dirname + '/' + mp4File.name;

    // Save the file to the server
    mp4File.mv(uploadPath, function(err) {
        if (err) return res.status(500).send(err);

        // Use ffmpeg to get video info
        ffmpeg.ffprobe(uploadPath, function(err, metadata) {
            if (err) return res.status(500).send(err);
            
            let duration = metadata.format.duration;
            res.json({ duration: duration });

            // Clean up the file after processing
            fs.unlinkSync(uploadPath);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
