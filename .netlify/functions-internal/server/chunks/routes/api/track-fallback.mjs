globalThis.__timing__.logStart('Load chunks/routes/api/track-fallback');import { d as defineEventHandler, a as getQuery, c as createError, b as getClientId } from '../../_/nitro.mjs';
import { Soundcloud } from 'soundcloud.ts';
import { a as getStreamUrl } from '../../_/soundcloud.mjs';
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
const trackFallback = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const query = getQuery(event);
  const url = query.url;
  if (!url) {
    throw createError({
      statusCode: 400,
      message: "Track URL is required"
    });
  }
  console.log("Fallback: Getting stream URL for track:", url);
  try {
    const clientId = await getClientId();
    soundcloud = new Soundcloud(clientId);
    let trackId = url;
    const urlMatch = url.match(/soundcloud\.com\/[^\/]+\/([^\/\?]+)/);
    if (urlMatch) {
      trackId = urlMatch[1];
    }
    const methods = [
      // Method 1: Get track details first, then stream
      async () => {
        var _a2;
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        const trackDetails = await soundcloud.tracks.get(url);
        if (!((_a2 = trackDetails == null ? void 0 : trackDetails.media) == null ? void 0 : _a2.transcodings)) {
          throw new Error("No transcoding data available");
        }
        const mp3Transcoding = trackDetails.media.transcodings.find(
          (t) => {
            var _a3, _b2;
            return ((_a3 = t.format) == null ? void 0 : _a3.protocol) === "progressive" && ((_b2 = t.format) == null ? void 0 : _b2.mime_type) === "audio/mpeg";
          }
        );
        if (mp3Transcoding == null ? void 0 : mp3Transcoding.url) {
          return await getStreamUrl(mp3Transcoding.url, clientId);
        }
        throw new Error("No MP3 progressive stream available");
      },
      // Method 2: Try HLS stream if available
      async () => {
        var _a2;
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        const trackDetails = await soundcloud.tracks.get(url);
        if (!((_a2 = trackDetails == null ? void 0 : trackDetails.media) == null ? void 0 : _a2.transcodings)) {
          throw new Error("No transcoding data available");
        }
        const hlsTranscoding = trackDetails.media.transcodings.find(
          (t) => {
            var _a3, _b2;
            return ((_a3 = t.format) == null ? void 0 : _a3.protocol) === "hls" && ((_b2 = t.format) == null ? void 0 : _b2.mime_type) === "audio/mpeg";
          }
        );
        if (hlsTranscoding == null ? void 0 : hlsTranscoding.url) {
          return await getStreamUrl(hlsTranscoding.url, clientId);
        }
        throw new Error("No HLS stream available");
      },
      // Method 3: Try with track ID if extracted
      async () => {
        var _a2;
        if (trackId === url) {
          throw new Error("No track ID available");
        }
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const newClientId = await getClientId();
        soundcloud = new Soundcloud(newClientId);
        const trackDetails = await soundcloud.tracks.get(trackId);
        if (!((_a2 = trackDetails == null ? void 0 : trackDetails.media) == null ? void 0 : _a2.transcodings)) {
          throw new Error("No transcoding data available");
        }
        const transcoding = trackDetails.media.transcodings.find(
          (t) => {
            var _a3, _b2, _c2;
            return (((_a3 = t.format) == null ? void 0 : _a3.protocol) === "progressive" || ((_b2 = t.format) == null ? void 0 : _b2.protocol) === "hls") && ((_c2 = t.format) == null ? void 0 : _c2.mime_type) === "audio/mpeg";
          }
        );
        if (transcoding == null ? void 0 : transcoding.url) {
          return await getStreamUrl(transcoding.url, newClientId);
        }
        throw new Error("No suitable stream found");
      }
    ];
    let lastError = null;
    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`Fallback: Trying method ${i + 1}...`);
        const streamUrl = await methods[i]();
        if (streamUrl) {
          console.log(`Fallback: Got stream URL using method ${i + 1}`);
          return { streamUrl, method: i + 1 };
        }
      } catch (methodError) {
        lastError = methodError;
        console.log(
          `Fallback method ${i + 1} failed:`,
          methodError instanceof Error ? methodError.message : "Unknown error"
        );
        if (((_a = methodError.message) == null ? void 0 : _a.includes("401")) || ((_b = methodError.message) == null ? void 0 : _b.includes("client_id"))) {
          const newClientId = await getClientId();
          soundcloud = new Soundcloud(newClientId);
          await new Promise((resolve) => setTimeout(resolve, 2e3));
        } else if ((_c = methodError.message) == null ? void 0 : _c.includes("429")) {
          console.log("Fallback: Rate limited, waiting 10 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 1e4));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3e3));
        }
      }
    }
    throw createError({
      statusCode: 404,
      message: `All fallback methods failed to get stream URL. Last error: ${(lastError == null ? void 0 : lastError.message) || "Unknown error"}`
    });
  } catch (error) {
    console.error("Fallback error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Fallback failed to get stream URL"
    });
  }
});

export { trackFallback as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/track-fallback');
//# sourceMappingURL=track-fallback.mjs.map
