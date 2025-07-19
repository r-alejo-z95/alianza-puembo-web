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
  const fallbackUrl = channelId ? `https://www.youtube.com/channel/${channelId}` : "https://www.youtube.com/c/IglesiaAlianzaPuembo";

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

    // 2. Get the latest playlist starting with "Serie"
    const playlistsUrl = `${baseApiUrl}/playlists?part=snippet&channelId=${channelId}&maxResults=50&key=${apiKey}`;
    const playlistsResponse = await fetch(playlistsUrl, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    const playlistsData = await playlistsResponse.json();

    const seriesPlaylist = playlistsData.items?.find((playlist: any) =>
      playlist.snippet.title.trim().toLowerCase().startsWith("serie")
    );

    if (seriesPlaylist) {
      const playlistId = seriesPlaylist.id;
      const playlistItemsUrl = `${baseApiUrl}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
      const itemsResponse = await fetch(playlistItemsUrl, {
        next: { revalidate: 3600 },
      });
      const itemsData = await itemsResponse.json();

      if (itemsData.items && itemsData.items.length > 0) {
        const latestItem = itemsData.items
          .sort(
            (a: any, b: any) =>
              new Date(b.snippet.publishedAt).getTime() -
              new Date(a.snippet.publishedAt).getTime()
          )[0];

        const videoId = latestItem.snippet.resourceId.videoId;

        return {
          isLive: false,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        };
      }
    }

    // 3. Fallback to latest video if no matching playlist
    const latestVideoUrl = `${baseApiUrl}/search?part=snippet&channelId=${channelId}&order=date&maxResults=1&type=video&key=${apiKey}`;
    const latestVideoResponse = await fetch(latestVideoUrl, {
      next: { revalidate: 3600 },
    });
    const latestVideoData = await latestVideoResponse.json();

    if (latestVideoData.items && latestVideoData.items.length > 0) {
      const videoId = latestVideoData.items[0].id.videoId;
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
