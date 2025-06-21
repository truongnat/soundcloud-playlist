globalThis.__timing__.logStart('Load chunks/routes/api/stream-mp3');import { d as defineEventHandler, a as getQuery, c as createError, b as getClientId } from '../../_/nitro.mjs';
import { Soundcloud } from 'soundcloud.ts';
import { g as getTranscoding, a as getStreamUrl } from '../../_/soundcloud.mjs';
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
const streamMp3 = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  try {
    const query = getQuery(event);
    const url = query.url;
    if (!url) {
      throw createError({
        statusCode: 400,
        message: "Track URL is required"
      });
    }
    let clientId = await getClientId();
    soundcloud = new Soundcloud(clientId);
    let trackDetails = null;
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries && !trackDetails) {
      try {
        const response = await soundcloud.tracks.get(url);
        if (!response || !("media" in response)) {
          throw new Error("Invalid track response");
        }
        trackDetails = response;
      } catch (error) {
        attempt++;
        console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
        if (error.status === 401 || ((_a = error.message) == null ? void 0 : _a.includes("client_id"))) {
          const newClientId = await getClientId();
          soundcloud = new Soundcloud(newClientId);
          await new Promise((resolve) => setTimeout(resolve, 1e3));
        } else if (attempt === maxRetries) {
          throw createError({
            statusCode: 404,
            message: "Could not get track details: " + (error.message || "Unknown error")
          });
        } else {
          const delay = 1e3 * Math.pow(2, attempt) + Math.random() * 1e3;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    if (!trackDetails) {
      throw createError({
        statusCode: 404,
        message: "Could not get track details after multiple attempts"
      });
    }
    const transcoding = getTranscoding(trackDetails);
    let streamUrl = null;
    attempt = 0;
    while (attempt < maxRetries && !streamUrl) {
      try {
        streamUrl = await getStreamUrl(transcoding.url, clientId);
      } catch (error) {
        attempt++;
        console.error(`Stream URL attempt ${attempt}/${maxRetries} failed:`, error.message);
        if (((_b = error.message) == null ? void 0 : _b.includes("401")) || ((_c = error.message) == null ? void 0 : _c.includes("client_id"))) {
          const newClientId = await getClientId();
          soundcloud = new Soundcloud(newClientId);
          clientId = newClientId;
          await new Promise((resolve) => setTimeout(resolve, 1e3));
        } else if (attempt === maxRetries) {
          throw createError({
            statusCode: 500,
            message: "Failed to get stream URL after multiple attempts"
          });
        } else {
          const delay = 1e3 * Math.pow(2, attempt) + Math.random() * 1e3;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    if (!streamUrl) {
      throw createError({
        statusCode: 404,
        message: "Could not get stream URL"
      });
    }
    const track = {
      id: trackDetails.id,
      title: trackDetails.title,
      artist: trackDetails.user.username,
      duration: trackDetails.duration,
      artwork: ((_d = trackDetails.artwork_url) == null ? void 0 : _d.replace("-large", "-t500x500")) || ((_e = trackDetails.user.avatar_url) == null ? void 0 : _e.replace("-large", "-t500x500")) || "https://secure.gravatar.com/avatar/?size=500&default=mm",
      artwork_url: trackDetails.artwork_url,
      url: trackDetails.permalink_url,
      streamUrl
    };
    return {
      streamUrl,
      isHLS: transcoding.isHLS,
      track,
      duration: transcoding.duration,
      format: transcoding.format
    };
  } catch (error) {
    console.error("Error in stream-mp3:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to process track"
    });
  }
});

export { streamMp3 as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/stream-mp3');
//# sourceMappingURL=stream-mp3.mjs.map
