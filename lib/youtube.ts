import "server-only";

interface YouTubeChannelStatus {
  isLive: boolean;
  videoUrl: string;
}

/**
 * Verifica si es horario de servicio en Ecuador (UTC-5).
 * Domingo: 09:00 - 12:00
 * Miércoles: 18:00 - 21:00
 */
function isServiceTime(): boolean {
  const now = new Date();
  // Método robusto para obtener la hora de Ecuador independientemente del servidor
  const ecuadorDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Guayaquil" }));

  const day = ecuadorDate.getDay(); // 0 = Domingo, 3 = Miércoles
  const hour = ecuadorDate.getHours();

  if (day === 0 && hour >= 9 && hour < 12) return true;
  if (day === 3 && hour >= 18 && hour < 21) return true;

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
    console.error("Configuración incompleta: YOUTUBE_API_KEY o YOUTUBE_CHANNEL_ID.");
    return { isLive: false, videoUrl: fallbackUrl };
  }

  try {
    // 1. Obtener el Playlist ID de "Uploads" (Costo: 1 | Cache: 24h)
    const channelsUrl = `${baseApiUrl}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const channelsResponse = await fetch(channelsUrl, { next: { revalidate: 86400 } });
    const channelsData = await channelsResponse.json();
    const uploadsPlaylistId = channelsData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) return { isLive: false, videoUrl: fallbackUrl };

    // 2. Obtener los últimos 5 items de la playlist (Costo: 1 | Cache: 60s)
    const playlistUrl = `${baseApiUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5&key=${apiKey}`;
    const playlistResponse = await fetch(playlistUrl, { next: { revalidate: 60 } });
    const playlistData = await playlistResponse.json();
    const items = playlistData.items || [];

    if (items.length === 0) return { isLive: false, videoUrl: fallbackUrl };

    // 3. Obtener detalles extendidos de estos videos para verificar el estado real (Costo: 1)
    // Esto nos permite saber si son "live", "upcoming" o videos terminados ("none").
    const videoIds = items.map((i: any) => i.snippet.resourceId.videoId).join(',');
    const videoDetailUrl = `${baseApiUrl}/videos?part=snippet&id=${videoIds}&key=${apiKey}`;
    const videoDetailResp = await fetch(videoDetailUrl, { next: { revalidate: 60 } });
    const videoDetailData = await videoDetailResp.json();
    const videoDetails = videoDetailData.items || [];

    // --- LÓGICA DE DECISIÓN ---

    const serviceTime = isServiceTime();

    // A. Si es hora de servicio, buscamos si hay alguno en vivo
    if (serviceTime) {
      const liveVideo = videoDetails.find((v: any) => v.snippet.liveBroadcastContent === "live");
      if (liveVideo) {
        return {
          isLive: true,
          videoUrl: `https://www.youtube.com/watch?v=${liveVideo.id}`,
        };
      }
    }

    // B. Si NO es hora de servicio (o no hay live), buscamos la última prédica grabada.
    // Filtramos para ignorar streams activos o programados (pruebas de streaming)
    const recordedVideos = videoDetails.filter(
      (v: any) => v.snippet.liveBroadcastContent === "none" || v.snippet.liveBroadcastContent === "completed"
    );

    if (recordedVideos.length === 0) {
        return { isLive: false, videoUrl: fallbackUrl };
    }

    // Lógica para encontrar el video con el número más alto en el título (ej: "125. Prédica...")
    const extractLeadingNumber = (title: string): number | null => {
      const match = title?.trim().match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    let selectedVideo = recordedVideos[0];
    let highestNumber = -1;

    recordedVideos.forEach((v: any) => {
      const num = extractLeadingNumber(v.snippet.title);
      if (num !== null && num > highestNumber) {
        highestNumber = num;
        selectedVideo = v;
      }
    });

    return {
      isLive: false,
      videoUrl: `https://www.youtube.com/watch?v=${selectedVideo.id}`,
    };

  } catch (error) {
    console.error("YouTube API Error:", error);
    return { isLive: false, videoUrl: fallbackUrl };
  }
}