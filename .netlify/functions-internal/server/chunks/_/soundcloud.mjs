globalThis.__timing__.logStart('Load chunks/_/soundcloud');function getTranscoding(trackDetails) {
  if (!trackDetails.media || !Array.isArray(trackDetails.media.transcodings) || trackDetails.media.transcodings.length === 0) {
    throw new Error("No transcoding data available for this track. The track may be unavailable or restricted.");
  }
  const mp3Transcoding = trackDetails.media.transcodings.find(
    (t) => {
      var _a, _b;
      return ((_a = t.format) == null ? void 0 : _a.protocol) === "progressive" && ((_b = t.format) == null ? void 0 : _b.mime_type) === "audio/mpeg" && t.url;
    }
  );
  if (mp3Transcoding) {
    return {
      url: mp3Transcoding.url,
      isHLS: false,
      duration: mp3Transcoding.duration || trackDetails.duration,
      format: {
        protocol: "progressive",
        mimeType: mp3Transcoding.format.mime_type
      }
    };
  }
  const hlsTranscoding = trackDetails.media.transcodings.find(
    (t) => {
      var _a, _b;
      return ((_a = t.format) == null ? void 0 : _a.protocol) === "hls" && ((_b = t.format) == null ? void 0 : _b.mime_type) === "audio/mpeg" && t.url;
    }
  );
  if (!hlsTranscoding) {
    const availableFormats = trackDetails.media.transcodings.map((t) => {
      var _a, _b;
      return `${((_a = t.format) == null ? void 0 : _a.protocol) || "unknown"} (${((_b = t.format) == null ? void 0 : _b.mime_type) || "unknown"})`;
    }).join(", ");
    throw new Error(`No suitable audio stream found for this track. Available formats: ${availableFormats}`);
  }
  return {
    url: hlsTranscoding.url,
    isHLS: true,
    duration: hlsTranscoding.duration || trackDetails.duration,
    format: {
      protocol: "hls",
      mimeType: hlsTranscoding.format.mime_type
    }
  };
}
async function getStreamUrl(transcodingUrl, clientId) {
  const response = await fetch(`${transcodingUrl}?client_id=${clientId}`);
  if (!response.ok) {
    throw new Error(`Failed to get stream URL: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.url;
}

export { getStreamUrl as a, getTranscoding as g };;globalThis.__timing__.logEnd('Load chunks/_/soundcloud');
//# sourceMappingURL=soundcloud.mjs.map
