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
  const nowEcuador = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Guayaquil" })
  );

  const day = nowEcuador.getDay();
  const hour = nowEcuador.getHours();

  if (day === 0 && hour >= 9 && hour < 12) return true; // Sunday
  if (day === 3 && hour >= 18 && hour < 21) return true; // Wednesday

  return false;
}

export async function getYouTubeChannelStatus(): Promise<YouTubeChannelStatus> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const baseApiUrl = "https://www.googleapis.com/youtube/v3";
  const fallbackUrl = channelId
    ? `https://www.youtube.com/channel/${channelId}`
    : "https://www.youtube.com/c/IglesiaAlianzaPuembo";

  if (!apiKey || !channelId) {
    console.error("YouTube API Key or Channel ID is not configured.");
    return { isLive: false, videoUrl: fallbackUrl };
  }

  try {
    // 1. Check for a live stream ONLY during service times
    if (isServiceTime()) {
      const liveSearchUrl = `${baseApiUrl}/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
      const liveResponse = await fetch(liveSearchUrl, {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
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

    // 2. If not live, find the latest relevant video by comparing the latest upload and latest completed stream.
    const latestVideoUrl = `${baseApiUrl}/search?part=snippet&channelId=${channelId}&order=date&maxResults=1&type=video&key=${apiKey}`;
    const latestStreamUrl = `${baseApiUrl}/search?part=snippet&channelId=${channelId}&order=date&maxResults=1&type=video&eventType=completed&key=${apiKey}`;

    const [latestVideoResponse, latestStreamResponse] = await Promise.all([
      fetch(latestVideoUrl, { next: { revalidate: 3600 } }),
      fetch(latestStreamUrl, { next: { revalidate: 3600 } }),
    ]);

    if (!latestVideoResponse.ok) {
      console.error(
        "Failed to fetch latest video:",
        await latestVideoResponse.text()
      );
    }
    if (!latestStreamResponse.ok) {
      console.error(
        "Failed to fetch latest stream:",
        await latestStreamResponse.text()
      );
    }

    const latestVideoData = latestVideoResponse.ok
      ? await latestVideoResponse.json()
      : { items: [] };
    const latestStreamData = latestStreamResponse.ok
      ? await latestStreamResponse.json()
      : { items: [] };

    const latestVideo = latestVideoData.items?.[0];
    const latestStream = latestStreamData.items?.[0];

    const extractLeadingNumber = (title: string): number | null => {
      if (!title) return null;
      const match = title.trim().match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    const videoNumber = latestVideo
      ? extractLeadingNumber(latestVideo.snippet.title)
      : null;
    const streamNumber = latestStream
      ? extractLeadingNumber(latestStream.snippet.title)
      : null;

    let selectedVideo = null;

    if (videoNumber !== null && streamNumber !== null) {
      selectedVideo = videoNumber > streamNumber ? latestVideo : latestStream;
    } else if (videoNumber !== null) {
      selectedVideo = latestVideo;
    } else if (streamNumber !== null) {
      selectedVideo = latestStream;
    } else {
      // Fallback if no numbers are found: use the most recent of the two.
      if (latestVideo && latestStream) {
        selectedVideo =
          new Date(latestVideo.snippet.publishedAt) >
          new Date(latestStream.snippet.publishedAt)
            ? latestVideo
            : latestStream;
      } else {
        selectedVideo = latestVideo || latestStream;
      }
    }

    if (selectedVideo) {
      const videoId = selectedVideo.id.videoId;
      return {
        isLive: false,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }

    // Final fallback
    return { isLive: false, videoUrl: fallbackUrl };
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return { isLive: false, videoUrl: fallbackUrl };
  }
}
