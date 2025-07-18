import "server-only";

interface YouTubeChannelStatus {
  isLive: boolean;
  videoUrl: string;
}

/**
 * Checks if the current time is within the church's service hours.
 * Service times are defined in UTC-5 (Ecuador time).
 * @returns {boolean} True if it's currently a service time.
 */
function isServiceTime(): boolean {
  const now = new Date();
  // Adjust current time to UTC-5
  const nowEcuador = new Date(now.toLocaleString("en-US", { timeZone: "America/Guayaquil" }));

  const day = nowEcuador.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const hour = nowEcuador.getHours();

  // Sunday services: 8:00 AM - 2:00 PM (14:00)
  if (day === 0 && hour >= 8 && hour < 14) {
    return true;
  }

  // Wednesday services: 6:00 PM (18:00) - 9:00 PM (21:00)
  if (day === 3 && hour >= 18 && hour < 21) {
    return true;
  }

  return false;
}

export async function getYouTubeChannelStatus(): Promise<YouTubeChannelStatus> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const baseApiUrl = "https://www.googleapis.com/youtube/v3";
  const fallbackUrl = `https://www.youtube.com/channel/${channelId || ""}`;

  if (!apiKey || !channelId) {
    console.error("YouTube API Key or Channel ID is not configured.");
    return { isLive: false, videoUrl: fallbackUrl };
  }

  try {
    // 1. Check for a live stream ONLY during service times
    if (isServiceTime()) {
      const liveSearchUrl = `${baseApiUrl}/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
      const liveResponse = await fetch(liveSearchUrl, {
        next: { revalidate: 300 }, // Revalidate every 5 minutes during service times
      });
      const liveData = await liveResponse.json();

      if (liveData.items && liveData.items.length > 0) {
        const videoId = liveData.items[0].id.videoId;
        return {
          isLive: true,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        };
      }
    }

    // 2. If not live or not service time, get the latest video
    const latestVideoUrl = `${baseApiUrl}/search?part=snippet&channelId=${channelId}&order=date&maxResults=1&type=video&key=${apiKey}`;
    const latestVideoResponse = await fetch(latestVideoUrl, {
      next: { revalidate: 3600 }, // Revalidate every hour for the latest video
    });
    const latestVideoData = await latestVideoResponse.json();

    if (latestVideoData.items && latestVideoData.items.length > 0) {
      const videoId = latestVideoData.items[0].id.videoId;
      return {
        isLive: false,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }

    // 3. Fallback to channel page if no videos are found
    return { isLive: false, videoUrl: fallbackUrl };
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return { isLive: false, videoUrl: fallbackUrl };
  }
}
