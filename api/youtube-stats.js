const fetch = require('node-fetch'); // Node.js requires 'fetch' for server-side calls

export default async function handler(req, res) {
    const { accessToken } = req.query;

    if (!accessToken) {
        return res.status(400).json({ error: 'Missing access token' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const youtubeApiUrl = 'https://www.googleapis.com/youtube/v3';
    
    try {
        // Fetch user channel statistics
        const channelRes = await fetch(`${youtubeApiUrl}/channels?part=statistics&mine=true&access_token=${accessToken}`);
        const channelData = await channelRes.json();

        // Fetch most popular video and its comments
        const videoRes = await fetch(`${youtubeApiUrl}/videos?part=snippet,statistics&chart=mostPopular&maxResults=1&access_token=${accessToken}`);
        const videoData = await videoRes.json();

        // Extract data
        const stats = {
            likes: channelData.items[0].statistics.likeCount,
            subscribers: channelData.items[0].statistics.subscriberCount,
            topVideo: videoData.items[0].snippet.title,
            topVideoViews: videoData.items[0].statistics.viewCount,
            videoId: videoData.items[0].id
        };

        // Fetch top 5 comments on the top video
        const commentRes = await fetch(`${youtubeApiUrl}/commentThreads?part=snippet&videoId=${stats.videoId}&maxResults=5&access_token=${accessToken}`);
        const commentData = await commentRes.json();
        
        stats.comments = commentData.items.map(item => item.snippet.topLevelComment.snippet.textOriginal);

        return res.status(200).json(stats);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch YouTube data', details: error });
    }
}
