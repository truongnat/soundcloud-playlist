globalThis.__timing__.logStart('Load chunks/routes/api/playlist');import { d as defineEventHandler, a as getQuery, c as createError, b as getClientId } from '../../_/nitro.mjs';
import { Soundcloud } from 'soundcloud.ts';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:module';
import 'node:fs';
import 'node:path';

let soundcloud;
async function initializeSoundcloud() {
  try {
    const clientId = await getClientId();
    soundcloud = new Soundcloud(clientId);
    console.log("Initialized SoundCloud client with client ID:", clientId);
  } catch (error) {
    console.error("Failed to initialize SoundCloud client:", error);
    throw error;
  }
}
function cleanUrl(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "soundcloud.app.goo.gl") {
      return url;
    }
    ["si", "utm_source", "utm_medium", "utm_campaign"].forEach((param) => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString().split("?")[0];
  } catch (e) {
    console.error("Error cleaning URL:", e);
    return url;
  }
}
async function resolveMobileUrl(url) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
      }
    });
    return response.url;
  } catch (error) {
    console.error("Error resolving mobile URL:", error);
    throw error;
  }
}
const playlist = defineEventHandler(async (event) => {
  const query = getQuery(event);
  let url = query.url;
  if (!url) {
    throw createError({
      statusCode: 400,
      message: "Playlist URL is required"
    });
  }
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), 25e3);
  });
  try {
    const result = await Promise.race([
      processPlaylist(url),
      timeoutPromise
    ]);
    return result;
  } catch (error) {
    console.error("Error in playlist handler:", error);
    if (error.message === "Request timeout") {
      throw createError({
        statusCode: 504,
        message: "Request timed out. The playlist might be too large or SoundCloud is slow to respond. Please try again or use a smaller playlist."
      });
    }
    let errorMessage = "Failed to fetch playlist. ";
    if (error.status === 404) {
      errorMessage = "The playlist could not be found. Please make sure the URL is correct.";
    } else if (error.status === 403) {
      errorMessage = "Access to this playlist is restricted.";
    } else if (error.status === 401) {
      errorMessage = "Authentication failed. Please try again.";
    } else if (error.message.includes("not found")) {
      errorMessage = "Playlist not found. Please make sure the URL is correct.";
    } else if (error.message.includes("rate limit") || error.status === 429) {
      errorMessage = "Too many requests. Please try again in a few minutes.";
    } else if (error.message.includes("Could not obtain a valid client ID")) {
      errorMessage = "SoundCloud API is temporarily unavailable. Please try again later.";
    } else {
      errorMessage += "Please make sure the URL is correct and the playlist is public.";
    }
    throw createError({
      statusCode: error.status || 500,
      message: errorMessage,
      data: {
        originalError: error.message,
        url
      }
    });
  }
});
async function processPlaylist(url) {
  var _a;
  await initializeSoundcloud();
  if (url.includes("soundcloud.app.goo.gl")) {
    url = await resolveMobileUrl(url);
  }
  url = cleanUrl(url);
  console.log("Processing playlist URL:", url);
  let playlist = null;
  let retryCount = 0;
  const maxRetries = 2;
  while (retryCount < maxRetries && !playlist) {
    try {
      playlist = await soundcloud.playlists.get(url);
    } catch (error) {
      retryCount++;
      console.error(`Attempt ${retryCount}/${maxRetries} failed:`, error.message);
      if (error.status === 401 || error.message.includes("client_id")) {
        await initializeSoundcloud();
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else if (retryCount === maxRetries) {
        throw error;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  if (!playlist) {
    throw new Error("Failed to fetch playlist after multiple attempts");
  }
  console.log(`Found playlist: ${playlist.title} with ${playlist.track_count} tracks`);
  const maxTracks = 50;
  const limitedTrackCount = Math.min(playlist.track_count, maxTracks);
  const allTracks = await getAllPlaylistTracksLimited(playlist, url, limitedTrackCount);
  console.log(`Successfully fetched ${allTracks.length} of ${playlist.track_count} tracks`);
  if (allTracks.length === 0) {
    throw new Error("No tracks could be fetched from the playlist");
  }
  const batchSize = 3;
  const tracks = [];
  for (let i = 0; i < allTracks.length; i += batchSize) {
    const batch = allTracks.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (track) => {
        var _a2, _b;
        const trackInfo = {
          id: track.id.toString(),
          title: track.title,
          artist: track.user.username,
          duration: track.duration,
          artwork: ((_a2 = track.artwork_url) == null ? void 0 : _a2.replace("-large", "-t500x500")) || ((_b = track.user.avatar_url) == null ? void 0 : _b.replace("-large", "-t500x500")) || "https://secure.gravatar.com/avatar/?size=500&default=mm",
          url: track.permalink_url,
          streamUrl: null
        };
        return trackInfo;
      })
    );
    tracks.push(...batchResults);
    if (i + batchSize < allTracks.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  const response = {
    playlistInfo: {
      id: playlist.id,
      title: playlist.title,
      description: playlist.description || "",
      artwork: ((_a = playlist.artwork_url) == null ? void 0 : _a.replace("-large", "-t500x500")) || "https://secure.gravatar.com/avatar/?size=500&default=mm",
      tracksCount: playlist.track_count
    },
    tracks
  };
  return response;
}
async function getAllPlaylistTracksLimited(playlist, playlistUrl, maxTracks) {
  const allTracks = [];
  const limit = 20;
  let offset = 0;
  let retryCount = 0;
  const maxRetries = 2;
  while (offset < Math.min(playlist.track_count, maxTracks)) {
    try {
      console.log(`Fetching tracks ${offset} to ${offset + limit} of ${Math.min(playlist.track_count, maxTracks)}`);
      let playlistData = null;
      let fetchRetries = 0;
      while (fetchRetries < 2 && !playlistData) {
        try {
          playlistData = await soundcloud.playlists.get(playlistUrl + `?limit=${limit}&offset=${offset}`);
        } catch (error) {
          fetchRetries++;
          if (error.status === 401 || error.message.includes("client_id")) {
            console.log("Client ID error, reinitializing SoundCloud client...");
            await initializeSoundcloud();
            await new Promise((resolve) => setTimeout(resolve, 300));
          } else {
            throw error;
          }
        }
      }
      if (!playlistData || !playlistData.tracks || playlistData.tracks.length === 0) {
        throw new Error("No tracks received in response");
      }
      allTracks.push(...playlistData.tracks);
      offset += playlistData.tracks.length;
      retryCount = 0;
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (allTracks.length >= maxTracks) {
        break;
      }
    } catch (error) {
      console.error(`Error fetching tracks at offset ${offset}:`, error);
      retryCount++;
      if (retryCount >= maxRetries) {
        console.error(`Max retries (${maxRetries}) reached for offset ${offset}`);
        break;
      }
      const delay = Math.min(500 * Math.pow(2, retryCount), 2e3);
      console.log(`Retrying in ${delay}ms... (Attempt ${retryCount}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return allTracks.slice(0, maxTracks);
}

export { playlist as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/playlist');
//# sourceMappingURL=playlist.mjs.map
