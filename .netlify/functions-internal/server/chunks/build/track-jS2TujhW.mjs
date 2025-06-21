globalThis.__timing__.logStart('Load chunks/build/track-jS2TujhW');import { defineComponent, inject, ref, computed, unref, withCtx, createVNode, toDisplayString, createBlock, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { TransitionRoot } from '@headlessui/vue';
import { u as useLogger } from './useLogger-CQxSitFg.mjs';
import { _ as _export_sfc } from './server.mjs';
import 'pinia';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:fs';
import 'node:path';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

const useTrack = () => {
  const error = ref("");
  const fetchTrack = async (url) => {
    try {
      const apiUrl = `/api/track-download?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const data2 = await response.json();
        throw new Error(data2.message || "Failed to load track");
      }
      const data = await response.json();
      if (!data.track) {
        throw new Error("Invalid track data received");
      }
      return data.track;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load track";
      error.value = message;
      throw err;
    }
  };
  return {
    fetchTrack,
    error
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "track",
  __ssrInlineRender: true,
  setup(__props) {
    const handleDownloadTrack = inject("handleDownloadTrack");
    const downloadingTracks = inject("downloadingTracks");
    inject("errorTracks");
    useTrack();
    const logger = useLogger();
    const trackUrl = ref("");
    const track2 = ref(null);
    const error = ref("");
    const isLoading = ref(false);
    const isValidUrl = computed(() => {
      if (!trackUrl.value) return false;
      try {
        const url = new URL(trackUrl.value);
        return url.hostname === "soundcloud.com" && !url.pathname.includes("/sets/");
      } catch {
        return false;
      }
    });
    const isDownloading = computed(() => {
      return track2.value ? downloadingTracks.value.includes(track2.value.id.toString()) : false;
    });
    function formatDuration(ms) {
      const minutes = Math.floor(ms / 6e4);
      const seconds = Math.floor(ms % 6e4 / 1e3);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    function downloadTrack() {
      if (!track2.value) return;
      logger.logUserAction(`Initiated download: ${track2.value.title}`);
      logger.logDownloadStart(track2.value.title, track2.value.id.toString());
      handleDownloadTrack(track2.value);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-5e28ed17><div class="mb-8 text-center" data-v-5e28ed17><h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4" data-v-5e28ed17> Download Single Track </h1><p class="text-gray-400" data-v-5e28ed17>Enter a SoundCloud track URL to download it directly</p></div><div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700/50 mb-8" data-v-5e28ed17><div class="flex flex-col md:flex-row gap-4" data-v-5e28ed17><div class="flex-1" data-v-5e28ed17><input${ssrRenderAttr("value", trackUrl.value)} type="text" placeholder="https://soundcloud.com/artist/track" class="w-full px-4 py-3 bg-gray-900/50 text-gray-100 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 transition-all duration-200"${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""} data-v-5e28ed17></div><button class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-blue-500/20 flex items-center gap-2 min-w-[140px] justify-center"${ssrIncludeBooleanAttr(isLoading.value || !isValidUrl.value) ? " disabled" : ""} data-v-5e28ed17>`);
      if (isLoading.value) {
        _push(`<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" data-v-5e28ed17><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-5e28ed17></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-5e28ed17></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span data-v-5e28ed17>${ssrInterpolate(isLoading.value ? "Loading..." : "Get Track")}</span></button></div></div>`);
      if (error.value) {
        _push(`<div class="bg-red-900/20 border border-red-800/50 text-red-200 p-4 rounded-xl mb-8 backdrop-blur-sm" data-v-5e28ed17><div class="flex items-center gap-3" data-v-5e28ed17><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-5e28ed17><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" data-v-5e28ed17></path></svg><span data-v-5e28ed17>${ssrInterpolate(error.value)}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(unref(TransitionRoot), {
        show: !!track2.value,
        enter: "transition-opacity duration-300",
        "enter-from": "opacity-0",
        "enter-to": "opacity-100",
        leave: "transition-opacity duration-200",
        "leave-from": "opacity-100",
        "leave-to": "opacity-0"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden" data-v-5e28ed17${_scopeId}><div class="relative h-48 md:h-64" data-v-5e28ed17${_scopeId}><img${ssrRenderAttr("src", track2.value.artwork)}${ssrRenderAttr("alt", track2.value.title)} class="w-full h-full object-cover" data-v-5e28ed17${_scopeId}><div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" data-v-5e28ed17${_scopeId}></div><div class="absolute bottom-0 left-0 right-0 p-6" data-v-5e28ed17${_scopeId}><h2 class="text-2xl font-bold text-white mb-2 line-clamp-1" data-v-5e28ed17${_scopeId}>${ssrInterpolate(track2.value.title)}</h2><p class="text-gray-300 line-clamp-1" data-v-5e28ed17${_scopeId}>${ssrInterpolate(track2.value.artist)}</p></div></div><div class="p-6" data-v-5e28ed17${_scopeId}><div class="flex items-center justify-between gap-4" data-v-5e28ed17${_scopeId}><div class="flex items-center gap-3" data-v-5e28ed17${_scopeId}><span class="text-gray-400 text-sm" data-v-5e28ed17${_scopeId}>Duration: ${ssrInterpolate(formatDuration(track2.value.duration))}</span><a${ssrRenderAttr("href", track2.value.url)} target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1" data-v-5e28ed17${_scopeId}><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" data-v-5e28ed17${_scopeId}><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" data-v-5e28ed17${_scopeId}></path></svg><span data-v-5e28ed17${_scopeId}>View on SoundCloud</span></a></div><button class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-green-500/20 flex items-center gap-2"${ssrIncludeBooleanAttr(isDownloading.value) ? " disabled" : ""} data-v-5e28ed17${_scopeId}>`);
            if (isDownloading.value) {
              _push2(`<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" data-v-5e28ed17${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-5e28ed17${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-5e28ed17${_scopeId}></path></svg>`);
            } else {
              _push2(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-5e28ed17${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" data-v-5e28ed17${_scopeId}></path></svg>`);
            }
            _push2(`<span data-v-5e28ed17${_scopeId}>${ssrInterpolate(isDownloading.value ? "Downloading..." : "Download Now")}</span></button></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden" }, [
                createVNode("div", { class: "relative h-48 md:h-64" }, [
                  createVNode("img", {
                    src: track2.value.artwork,
                    alt: track2.value.title,
                    class: "w-full h-full object-cover"
                  }, null, 8, ["src", "alt"]),
                  createVNode("div", { class: "absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" }),
                  createVNode("div", { class: "absolute bottom-0 left-0 right-0 p-6" }, [
                    createVNode("h2", { class: "text-2xl font-bold text-white mb-2 line-clamp-1" }, toDisplayString(track2.value.title), 1),
                    createVNode("p", { class: "text-gray-300 line-clamp-1" }, toDisplayString(track2.value.artist), 1)
                  ])
                ]),
                createVNode("div", { class: "p-6" }, [
                  createVNode("div", { class: "flex items-center justify-between gap-4" }, [
                    createVNode("div", { class: "flex items-center gap-3" }, [
                      createVNode("span", { class: "text-gray-400 text-sm" }, "Duration: " + toDisplayString(formatDuration(track2.value.duration)), 1),
                      createVNode("a", {
                        href: track2.value.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        class: "text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1"
                      }, [
                        (openBlock(), createBlock("svg", {
                          class: "w-4 h-4",
                          fill: "currentColor",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("path", { d: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" })
                        ])),
                        createVNode("span", null, "View on SoundCloud")
                      ], 8, ["href"])
                    ]),
                    createVNode("button", {
                      onClick: downloadTrack,
                      class: "px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-green-500/20 flex items-center gap-2",
                      disabled: isDownloading.value
                    }, [
                      isDownloading.value ? (openBlock(), createBlock("svg", {
                        key: 0,
                        class: "animate-spin h-5 w-5",
                        fill: "none",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("circle", {
                          class: "opacity-25",
                          cx: "12",
                          cy: "12",
                          r: "10",
                          stroke: "currentColor",
                          "stroke-width": "4"
                        }),
                        createVNode("path", {
                          class: "opacity-75",
                          fill: "currentColor",
                          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        })
                      ])) : (openBlock(), createBlock("svg", {
                        key: 1,
                        class: "w-5 h-5",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        })
                      ])),
                      createVNode("span", null, toDisplayString(isDownloading.value ? "Downloading..." : "Download Now"), 1)
                    ], 8, ["disabled"])
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/track.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const track = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5e28ed17"]]);

export { track as default };;globalThis.__timing__.logEnd('Load chunks/build/track-jS2TujhW');
//# sourceMappingURL=track-jS2TujhW.mjs.map
