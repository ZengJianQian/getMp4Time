const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', async (req, res) => {
    const videoUrl = req.body.url;
    try {
        // Download the video file
        const response = await axios({
            method: 'get',
            url: videoUrl,
            responseType: 'stream'
        });
        const videoPath = path.join(__dirname, 'video.mp4');
        const writer = fs.createWriteStream(videoPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Get video info using ffmpeg
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to get video info' });
            }
            const duration = metadata.format.duration;
            res.json({ url: videoUrl, duration: duration });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to download video' });
    } finally {
        // Clean up the downloaded file
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
