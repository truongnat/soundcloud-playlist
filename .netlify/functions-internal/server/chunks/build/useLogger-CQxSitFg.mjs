globalThis.__timing__.logStart('Load chunks/build/useLogger-CQxSitFg');import { defineStore } from 'pinia';

const useLogsStore = defineStore("logs", {
  state: () => ({
    logs: [],
    maxLogs: 100,
    // Giới hạn số lượng logs để tránh memory leak
    filters: {
      download: true,
      api: true,
      error: true,
      system: true
    }
  }),
  getters: {
    filteredLogs: (state) => {
      return state.logs.filter((log) => state.filters[log.type]).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    downloadLogs: (state) => {
      return state.logs.filter((log) => log.type === "download");
    },
    errorLogs: (state) => {
      return state.logs.filter((log) => log.type === "error");
    },
    recentLogs: (state) => {
      return state.logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);
    },
    logStats: (state) => {
      const stats = {
        total: state.logs.length,
        download: 0,
        api: 0,
        error: 0,
        system: 0
      };
      state.logs.forEach((log) => {
        stats[log.type]++;
      });
      return stats;
    }
  },
  actions: {
    addLog(log) {
      const newLog = {
        ...log,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: /* @__PURE__ */ new Date()
      };
      this.logs.unshift(newLog);
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs);
      }
    },
    // Download progress logs
    logDownloadStart(trackTitle, trackId) {
      this.addLog({
        type: "download",
        level: "info",
        title: "Download Started",
        message: `Starting download: ${trackTitle}`,
        details: { trackId, trackTitle }
      });
    },
    logDownloadProgress(trackTitle, progress) {
      const existingLogIndex = this.logs.findIndex(
        (log) => {
          var _a;
          return log.type === "download" && ((_a = log.details) == null ? void 0 : _a.trackTitle) === trackTitle && log.title === "Download Progress";
        }
      );
      if (existingLogIndex !== -1) {
        this.logs[existingLogIndex].progress = progress;
        this.logs[existingLogIndex].message = `Downloading: ${trackTitle} (${progress}%)`;
        this.logs[existingLogIndex].timestamp = /* @__PURE__ */ new Date();
      } else {
        this.addLog({
          type: "download",
          level: "info",
          title: "Download Progress",
          message: `Downloading: ${trackTitle} (${progress}%)`,
          progress,
          details: { trackTitle }
        });
      }
    },
    logDownloadComplete(trackTitle) {
      this.addLog({
        type: "download",
        level: "success",
        title: "Download Complete",
        message: `Successfully downloaded: ${trackTitle}`,
        details: { trackTitle }
      });
    },
    logDownloadError(trackTitle, error) {
      this.addLog({
        type: "download",
        level: "error",
        title: "Download Failed",
        message: `Failed to download: ${trackTitle}`,
        details: { trackTitle, error }
      });
    },
    // API request logs
    logApiRequest(method, url, status) {
      this.addLog({
        type: "api",
        level: status && status >= 400 ? "error" : "info",
        title: "API Request",
        message: `${method.toUpperCase()} ${url}${status ? ` - ${status}` : ""}`,
        details: { method, url, status }
      });
    },
    // Error logs
    logError(title, message, error) {
      this.addLog({
        type: "error",
        level: "error",
        title,
        message,
        details: error
      });
    },
    // System logs
    logSystem(title, message, level = "info") {
      this.addLog({
        type: "system",
        level,
        title,
        message
      });
    },
    // Utility actions
    clearLogs() {
      this.logs = [];
    },
    clearLogsByType(type) {
      this.logs = this.logs.filter((log) => log.type !== type);
    },
    toggleFilter(type) {
      this.filters[type] = !this.filters[type];
    },
    exportLogs() {
      const logsData = {
        exported_at: (/* @__PURE__ */ new Date()).toISOString(),
        logs: this.logs
      };
      const blob = new Blob([JSON.stringify(logsData, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `soundcloud-dl-logs-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      (void 0).body.appendChild(a);
      a.click();
      (void 0).body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
});
const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = () => {
  console.error(intervalError);
};
const useLogger = () => {
  const logsStore = useLogsStore();
  const logAppStart = () => {
    logsStore.logSystem("Application Started", "SoundCloud DL application initialized", "success");
  };
  const logPlaylistLoad = (playlistUrl, trackCount) => {
    logsStore.logSystem(
      "Playlist Loaded",
      `Loaded playlist with ${trackCount} tracks`,
      "success"
    );
    logsStore.logApiRequest("GET", playlistUrl, 200);
  };
  const logPlaylistError = (playlistUrl, error) => {
    logsStore.logError("Playlist Load Failed", `Failed to load playlist: ${error}`);
    logsStore.logApiRequest("GET", playlistUrl, 400);
  };
  const logDownloadStart = (trackTitle, trackId) => {
    logsStore.logDownloadStart(trackTitle, trackId);
  };
  const logDownloadProgress = (trackTitle, progress) => {
    logsStore.logDownloadProgress(trackTitle, progress);
  };
  const logDownloadComplete = (trackTitle) => {
    logsStore.logDownloadComplete(trackTitle);
  };
  const logDownloadError = (trackTitle, error) => {
    logsStore.logDownloadError(trackTitle, error);
  };
  const logDownloadQueueStart = (trackCount) => {
    logsStore.logSystem(
      "Batch Download Started",
      `Starting download of ${trackCount} tracks`,
      "info"
    );
  };
  const logDownloadQueueComplete = (successCount, totalCount) => {
    const level = successCount === totalCount ? "success" : "warning";
    logsStore.logSystem(
      "Batch Download Complete",
      `Downloaded ${successCount}/${totalCount} tracks successfully`,
      level
    );
  };
  const logApiRequest = (method, url, status, responseTime) => {
    `${method.toUpperCase()} ${url}${status ? ` - ${status}` : ""}${responseTime ? ` (${responseTime}ms)` : ""}`;
    logsStore.logApiRequest(method, url, status);
  };
  const logApiError = (method, url, error, status) => {
    logsStore.logError(
      "API Request Failed",
      `${method.toUpperCase()} ${url} failed: ${error}`,
      { method, url, error, status }
    );
  };
  const logError = (title, message, error) => {
    logsStore.logError(title, message, error);
  };
  const logValidationError = (field, value, reason) => {
    logsStore.logError(
      "Validation Error",
      `Invalid ${field}: ${reason}`,
      { field, value, reason }
    );
  };
  const logNetworkError = (url, error) => {
    logsStore.logError(
      "Network Error",
      `Failed to connect to ${url}: ${error}`,
      { url, error }
    );
  };
  const logSystemStatus = (component, status, message) => {
    const level = status === "online" ? "success" : status === "offline" ? "warning" : "warning";
    logsStore.logSystem(
      `${component} Status`,
      message || `${component} is ${status}`,
      level
    );
  };
  const logMemoryUsage = () => {
    if ("memory" in performance) {
      const memory = performance.memory;
      logsStore.logSystem(
        "Memory Usage",
        `Used: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / Total: ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        "info"
      );
    }
  };
  const logUserAction = (action, details) => {
    logsStore.logSystem(
      "User Action",
      action,
      "info"
    );
  };
  const logSystem = (title, message, level = "info") => {
    logsStore.logSystem(title, message, level);
  };
  const clearLogs = () => {
    logsStore.clearLogs();
    logsStore.logSystem("Logs Cleared", "All logs have been cleared", "info");
  };
  const exportLogs = () => {
    logsStore.exportLogs();
    logsStore.logSystem("Logs Exported", "Logs have been exported to file", "success");
  };
  const setupAutoLogging = () => {
    (void 0).addEventListener("error", (event) => {
      logError(
        "Unhandled Error",
        event.message,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        }
      );
    });
    (void 0).addEventListener("unhandledrejection", (event) => {
      var _a;
      logError(
        "Unhandled Promise Rejection",
        ((_a = event.reason) == null ? void 0 : _a.message) || "Promise rejected",
        event.reason
      );
    });
    (void 0).addEventListener("visibilitychange", () => {
      const status = (void 0).hidden ? "hidden" : "visible";
      logsStore.logSystem("Page Visibility", `Page is now ${status}`, "info");
    });
    setInterval();
  };
  return {
    // System
    logAppStart,
    logPlaylistLoad,
    logPlaylistError,
    logSystemStatus,
    logMemoryUsage,
    logUserAction,
    logSystem,
    // Downloads
    logDownloadStart,
    logDownloadProgress,
    logDownloadComplete,
    logDownloadError,
    logDownloadQueueStart,
    logDownloadQueueComplete,
    // API
    logApiRequest,
    logApiError,
    // Errors
    logError,
    logValidationError,
    logNetworkError,
    // Utilities
    clearLogs,
    exportLogs,
    setupAutoLogging
  };
};

export { useLogsStore as a, useLogger as u };;globalThis.__timing__.logEnd('Load chunks/build/useLogger-CQxSitFg');
//# sourceMappingURL=useLogger-CQxSitFg.mjs.map
