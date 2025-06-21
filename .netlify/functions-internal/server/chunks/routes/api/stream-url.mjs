globalThis.__timing__.logStart('Load chunks/routes/api/stream-url');import { d as defineEventHandler, a as getQuery, c as createError, b as getClientId } from '../../_/nitro.mjs';
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
    console.log("Initialized SoundCloud client for stream URL");
  } catch (error) {
    console.error("Failed to initialize SoundCloud client:", error);
    throw error;
  }
}
async function getStreamUrlWithTimeout(trackId, retryCount = 0) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Stream URL fetch timeout")), 8e3);
  });
  const methods = [
    // Method 1: Try to get stream URL directly from track ID
    async () => {
      try {
        return await soundcloud.util.streamLink(trackId);
      } catch {
        return null;
      }
    },
    // Method 2: Get track details and extract stream URL
    async () => {
      var _a;
      const trackDetails = await soundcloud.tracks.get(trackId);
      if ((_a = trackDetails.media) == null ? void 0 : _a.transcodings) {
        const progressive = trackDetails.media.transcodings.find((t) => t.format.protocol === "progressive");
        if (progressive == null ? void 0 : progressive.url) {
          return progressive.url;
        }
      }
      return null;
    }
  ];
  for (let i = 0; i < methods.length; i++) {
    try {
      const streamUrlPromise = methods[i]();
      const streamUrl = await Promise.race([streamUrlPromise, timeoutPromise]);
      if (streamUrl) {
        console.log(`Got stream URL for track ${trackId} using method ${i + 1}`);
        return streamUrl;
      }
    } catch (error) {
      console.log(`Method ${i + 1} failed for track ${trackId}:`, error.message);
      if (error.message === "Stream URL fetch timeout") {
        console.log("Stream URL fetch timed out");
        break;
      }
      if (error.message.includes("client_id") || error.message.includes("Client ID") || error.status === 401) {
        if (retryCount < 1) {
          console.log("Client ID error, reinitializing SoundCloud client...");
          await initializeSoundcloud();
          return getStreamUrlWithTimeout(trackId, retryCount + 1);
        }
      }
    }
  }
  return null;
}
const streamUrl = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const trackId = query.trackId;
  if (!trackId) {
    throw createError({
      statusCode: 400,
      message: "Track ID is required"
    });
  }
  try {
    await initializeSoundcloud();
    const streamUrl = await getStreamUrlWithTimeout(trackId);
    if (!streamUrl) {
      throw createError({
        statusCode: 404,
        message: "Stream URL not found for this track"
      });
    }
    return {
      trackId,
      streamUrl
    };
  } catch (error) {
    console.error("Error fetching stream URL:", error);
    let errorMessage = "Failed to fetch stream URL. ";
    if (error.status === 404) {
      errorMessage = "Track not found.";
    } else if (error.status === 403) {
      errorMessage = "Access to this track is restricted.";
    } else if (error.status === 401) {
      errorMessage = "Authentication failed.";
    } else if (error.message.includes("Could not obtain a valid client ID")) {
      errorMessage = "SoundCloud API is temporarily unavailable.";
    }
    throw createError({
      statusCode: error.status || 500,
      message: errorMessage,
      data: {
        originalError: error.message,
        trackId
      }
    });
  }
});

export { streamUrl as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/stream-url');
//# sourceMappingURL=stream-url.mjs.map
