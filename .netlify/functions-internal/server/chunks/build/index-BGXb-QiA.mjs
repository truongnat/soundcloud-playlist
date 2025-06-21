globalThis.__timing__.logStart('Load chunks/build/index-BGXb-QiA');import { defineComponent, inject, ref, watchEffect, unref, computed, mergeProps, useSlots, withCtx, renderSlot, createVNode, createBlock, createCommentVNode, openBlock, createTextVNode, toDisplayString, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderSlot } from 'vue/server-renderer';
import { Primitive } from 'reka-ui';
import { _ as _sfc_main$4$1, u as useLocale, t as tv, a as _sfc_main$3$1, b as _sfc_main$6, c as useUIStore } from './ui-DoL6jn0v.mjs';
import { _ as _export_sfc, a as useAppConfig } from './server.mjs';
import { u as useLogger } from './useLogger-CQxSitFg.mjs';
import '@vueuse/core';
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
import 'tailwind-variants';
import './index-CT3kmJVN.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './nuxt-link-DVAOoN_s.mjs';
import 'pinia';
import 'vue-router';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

const usePlaylist = () => {
  const error = ref("");
  const fetchPlaylist = async (url) => {
    try {
      const apiUrl = `/api/playlist?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const data2 = await response.json();
        throw new Error(data2.message || "Failed to load playlist");
      }
      const data = await response.json();
      if (!data.tracks || !Array.isArray(data.tracks)) {
        throw new Error("Invalid playlist data received");
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load playlist";
      error.value = message;
      throw err;
    }
  };
  return {
    fetchPlaylist,
    error
  };
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "PlaylistInput",
  __ssrInlineRender: true,
  props: {
    loading: { type: Boolean }
  },
  emits: ["playlist-loaded", "error"],
  setup(__props, { emit: __emit }) {
    const playlistUrl = ref("");
    const error = ref("");
    const loading = ref(false);
    usePlaylist();
    const isValidUrl = computed(() => {
      if (!playlistUrl.value) return false;
      try {
        const url = new URL(playlistUrl.value);
        const isValidDomain = url.hostname === "soundcloud.com";
        const isPlaylist = url.pathname.includes("/sets/");
        return isValidDomain && isPlaylist;
      } catch {
        return false;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto px-4" }, _attrs))}><div class="bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700/30 hover:border-orange-500/30 transition-colors"><div class="mb-8"><label for="playlist-url" class="block text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-4"> Enter your SoundCloud playlist </label><div class="relative group"><div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><svg class="h-5 w-5 text-gray-500 group-hover:text-orange-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg></div><input id="playlist-url"${ssrRenderAttr("value", unref(playlistUrl))} type="text" placeholder="https://soundcloud.com/user/sets/playlist-name" class="${ssrRenderClass([{ "border-red-500 focus:border-red-500 focus:ring-red-500": unref(error) }, "block w-full pl-11 pr-14 py-4 text-gray-100 placeholder-gray-500 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:border-gray-600/50"])}"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}><div class="absolute inset-y-0 right-0 flex py-2 pr-3"><kbd class="inline-flex items-center border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 tracking-wide bg-gray-800/30 backdrop-blur-sm group-hover:border-orange-500/30 transition-colors"> Enter \u21B5 </kbd></div></div><div class="mt-3 flex items-start space-x-2">`);
      if (!unref(error)) {
        _push(`<p class="text-sm text-gray-400 flex items-center"><svg class="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Paste any public SoundCloud playlist URL </p>`);
      } else {
        _push(`<p class="text-sm text-red-400 flex items-center"><svg class="w-4 h-4 mr-1.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${ssrInterpolate(unref(error))}</p>`);
      }
      _push(`</div></div><div class="flex items-center justify-between"><button${ssrIncludeBooleanAttr(unref(loading) || !unref(isValidUrl)) ? " disabled" : ""} class="flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/25">`);
      if (unref(loading)) {
        _push(`<!--[--><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Loading playlist... <!--]-->`);
      } else {
        _push(`<!--[--><svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"></path></svg> Get Playlist <!--]-->`);
      }
      _push(`</button></div></div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PlaylistInput.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const theme = {
  "slots": {
    "root": "relative overflow-hidden w-full rounded-lg p-4 flex gap-2.5",
    "wrapper": "min-w-0 flex-1 flex flex-col",
    "title": "text-sm font-medium",
    "description": "text-sm opacity-90",
    "icon": "shrink-0 size-5",
    "avatar": "shrink-0",
    "avatarSize": "2xl",
    "actions": "flex flex-wrap gap-1.5 shrink-0",
    "close": "p-0"
  },
  "variants": {
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "variant": {
      "solid": "",
      "outline": "",
      "soft": "",
      "subtle": ""
    },
    "orientation": {
      "horizontal": {
        "root": "items-center",
        "actions": "items-center"
      },
      "vertical": {
        "root": "items-start",
        "actions": "items-start mt-2.5"
      }
    },
    "title": {
      "true": {
        "description": "mt-1"
      }
    }
  },
  "compoundVariants": [
    {
      "color": "primary",
      "variant": "solid",
      "class": {
        "root": "bg-primary text-inverted"
      }
    },
    {
      "color": "secondary",
      "variant": "solid",
      "class": {
        "root": "bg-secondary text-inverted"
      }
    },
    {
      "color": "success",
      "variant": "solid",
      "class": {
        "root": "bg-success text-inverted"
      }
    },
    {
      "color": "info",
      "variant": "solid",
      "class": {
        "root": "bg-info text-inverted"
      }
    },
    {
      "color": "warning",
      "variant": "solid",
      "class": {
        "root": "bg-warning text-inverted"
      }
    },
    {
      "color": "error",
      "variant": "solid",
      "class": {
        "root": "bg-error text-inverted"
      }
    },
    {
      "color": "primary",
      "variant": "outline",
      "class": {
        "root": "text-primary ring ring-inset ring-primary/25"
      }
    },
    {
      "color": "secondary",
      "variant": "outline",
      "class": {
        "root": "text-secondary ring ring-inset ring-secondary/25"
      }
    },
    {
      "color": "success",
      "variant": "outline",
      "class": {
        "root": "text-success ring ring-inset ring-success/25"
      }
    },
    {
      "color": "info",
      "variant": "outline",
      "class": {
        "root": "text-info ring ring-inset ring-info/25"
      }
    },
    {
      "color": "warning",
      "variant": "outline",
      "class": {
        "root": "text-warning ring ring-inset ring-warning/25"
      }
    },
    {
      "color": "error",
      "variant": "outline",
      "class": {
        "root": "text-error ring ring-inset ring-error/25"
      }
    },
    {
      "color": "primary",
      "variant": "soft",
      "class": {
        "root": "bg-primary/10 text-primary"
      }
    },
    {
      "color": "secondary",
      "variant": "soft",
      "class": {
        "root": "bg-secondary/10 text-secondary"
      }
    },
    {
      "color": "success",
      "variant": "soft",
      "class": {
        "root": "bg-success/10 text-success"
      }
    },
    {
      "color": "info",
      "variant": "soft",
      "class": {
        "root": "bg-info/10 text-info"
      }
    },
    {
      "color": "warning",
      "variant": "soft",
      "class": {
        "root": "bg-warning/10 text-warning"
      }
    },
    {
      "color": "error",
      "variant": "soft",
      "class": {
        "root": "bg-error/10 text-error"
      }
    },
    {
      "color": "primary",
      "variant": "subtle",
      "class": {
        "root": "bg-primary/10 text-primary ring ring-inset ring-primary/25"
      }
    },
    {
      "color": "secondary",
      "variant": "subtle",
      "class": {
        "root": "bg-secondary/10 text-secondary ring ring-inset ring-secondary/25"
      }
    },
    {
      "color": "success",
      "variant": "subtle",
      "class": {
        "root": "bg-success/10 text-success ring ring-inset ring-success/25"
      }
    },
    {
      "color": "info",
      "variant": "subtle",
      "class": {
        "root": "bg-info/10 text-info ring ring-inset ring-info/25"
      }
    },
    {
      "color": "warning",
      "variant": "subtle",
      "class": {
        "root": "bg-warning/10 text-warning ring ring-inset ring-warning/25"
      }
    },
    {
      "color": "error",
      "variant": "subtle",
      "class": {
        "root": "bg-error/10 text-error ring ring-inset ring-error/25"
      }
    },
    {
      "color": "neutral",
      "variant": "solid",
      "class": {
        "root": "text-inverted bg-inverted"
      }
    },
    {
      "color": "neutral",
      "variant": "outline",
      "class": {
        "root": "text-highlighted bg-default ring ring-inset ring-default"
      }
    },
    {
      "color": "neutral",
      "variant": "soft",
      "class": {
        "root": "text-highlighted bg-elevated/50"
      }
    },
    {
      "color": "neutral",
      "variant": "subtle",
      "class": {
        "root": "text-highlighted bg-elevated/50 ring ring-inset ring-accented"
      }
    }
  ],
  "defaultVariants": {
    "color": "primary",
    "variant": "solid"
  }
};
const _sfc_main$4 = {
  __name: "Alert",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    icon: { type: String, required: false },
    avatar: { type: Object, required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    orientation: { type: null, required: false, default: "vertical" },
    actions: { type: Array, required: false },
    close: { type: [Boolean, Object], required: false },
    closeIcon: { type: String, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const { t } = useLocale();
    const appConfig = useAppConfig();
    const ui = computed(() => {
      var _a;
      return tv({ extend: tv(theme), ...((_a = appConfig.ui) == null ? void 0 : _a.alert) || {} })({
        color: props.color,
        variant: props.variant,
        orientation: props.orientation,
        title: !!props.title || !!slots.title
      });
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-orientation": __props.orientation,
        class: ui.value.root({ class: [(_a = props.ui) == null ? void 0 : _a.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "leading", {}, () => {
              var _a3, _b2, _c2;
              if (__props.avatar) {
                _push2(ssrRenderComponent(_sfc_main$3$1, mergeProps({
                  size: ((_a3 = props.ui) == null ? void 0 : _a3.avatarSize) || ui.value.avatarSize()
                }, __props.avatar, {
                  class: ui.value.avatar({ class: (_b2 = props.ui) == null ? void 0 : _b2.avatar })
                }), null, _parent2, _scopeId));
              } else if (__props.icon) {
                _push2(ssrRenderComponent(_sfc_main$4$1, {
                  name: __props.icon,
                  class: ui.value.icon({ class: (_c2 = props.ui) == null ? void 0 : _c2.icon })
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
            _push2(`<div class="${ssrRenderClass(ui.value.wrapper({ class: (_a2 = props.ui) == null ? void 0 : _a2.wrapper }))}"${_scopeId}>`);
            if (__props.title || !!slots.title) {
              _push2(`<div class="${ssrRenderClass(ui.value.title({ class: (_b = props.ui) == null ? void 0 : _b.title }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "title", {}, () => {
                _push2(`${ssrInterpolate(__props.title)}`);
              }, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.description || !!slots.description) {
              _push2(`<div class="${ssrRenderClass(ui.value.description({ class: (_c = props.ui) == null ? void 0 : _c.description }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                _push2(`${ssrInterpolate(__props.description)}`);
              }, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.orientation === "vertical" && (((_d = __props.actions) == null ? void 0 : _d.length) || !!slots.actions)) {
              _push2(`<div class="${ssrRenderClass(ui.value.actions({ class: (_e = props.ui) == null ? void 0 : _e.actions }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "actions", {}, () => {
                _push2(`<!--[-->`);
                ssrRenderList(__props.actions, (action, index2) => {
                  _push2(ssrRenderComponent(_sfc_main$6, mergeProps({
                    key: index2,
                    size: "xs"
                  }, { ref_for: true }, action), null, _parent2, _scopeId));
                });
                _push2(`<!--]-->`);
              }, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (__props.orientation === "horizontal" && (((_f = __props.actions) == null ? void 0 : _f.length) || !!slots.actions) || __props.close) {
              _push2(`<div class="${ssrRenderClass(ui.value.actions({ class: (_g = props.ui) == null ? void 0 : _g.actions, orientation: "horizontal" }))}"${_scopeId}>`);
              if (__props.orientation === "horizontal" && (((_h = __props.actions) == null ? void 0 : _h.length) || !!slots.actions)) {
                ssrRenderSlot(_ctx.$slots, "actions", {}, () => {
                  _push2(`<!--[-->`);
                  ssrRenderList(__props.actions, (action, index2) => {
                    _push2(ssrRenderComponent(_sfc_main$6, mergeProps({
                      key: index2,
                      size: "xs"
                    }, { ref_for: true }, action), null, _parent2, _scopeId));
                  });
                  _push2(`<!--]-->`);
                }, _push2, _parent2, _scopeId);
              } else {
                _push2(`<!---->`);
              }
              ssrRenderSlot(_ctx.$slots, "close", { ui: ui.value }, () => {
                var _a3;
                if (__props.close) {
                  _push2(ssrRenderComponent(_sfc_main$6, mergeProps({
                    icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                    size: "md",
                    color: "neutral",
                    variant: "link",
                    "aria-label": unref(t)("alert.close")
                  }, typeof __props.close === "object" ? __props.close : {}, {
                    class: ui.value.close({ class: (_a3 = props.ui) == null ? void 0 : _a3.close }),
                    onClick: ($event) => emits("update:open", false)
                  }), null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              renderSlot(_ctx.$slots, "leading", {}, () => {
                var _a3, _b2, _c2;
                return [
                  __props.avatar ? (openBlock(), createBlock(_sfc_main$3$1, mergeProps({
                    key: 0,
                    size: ((_a3 = props.ui) == null ? void 0 : _a3.avatarSize) || ui.value.avatarSize()
                  }, __props.avatar, {
                    class: ui.value.avatar({ class: (_b2 = props.ui) == null ? void 0 : _b2.avatar })
                  }), null, 16, ["size", "class"])) : __props.icon ? (openBlock(), createBlock(_sfc_main$4$1, {
                    key: 1,
                    name: __props.icon,
                    class: ui.value.icon({ class: (_c2 = props.ui) == null ? void 0 : _c2.icon })
                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                ];
              }),
              createVNode("div", {
                class: ui.value.wrapper({ class: (_i = props.ui) == null ? void 0 : _i.wrapper })
              }, [
                __props.title || !!slots.title ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: ui.value.title({ class: (_j = props.ui) == null ? void 0 : _j.title })
                }, [
                  renderSlot(_ctx.$slots, "title", {}, () => [
                    createTextVNode(toDisplayString(__props.title), 1)
                  ])
                ], 2)) : createCommentVNode("", true),
                __props.description || !!slots.description ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: ui.value.description({ class: (_k = props.ui) == null ? void 0 : _k.description })
                }, [
                  renderSlot(_ctx.$slots, "description", {}, () => [
                    createTextVNode(toDisplayString(__props.description), 1)
                  ])
                ], 2)) : createCommentVNode("", true),
                __props.orientation === "vertical" && (((_l = __props.actions) == null ? void 0 : _l.length) || !!slots.actions) ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: ui.value.actions({ class: (_m = props.ui) == null ? void 0 : _m.actions })
                }, [
                  renderSlot(_ctx.$slots, "actions", {}, () => [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.actions, (action, index2) => {
                      return openBlock(), createBlock(_sfc_main$6, mergeProps({
                        key: index2,
                        size: "xs"
                      }, { ref_for: true }, action), null, 16);
                    }), 128))
                  ])
                ], 2)) : createCommentVNode("", true)
              ], 2),
              __props.orientation === "horizontal" && (((_n = __props.actions) == null ? void 0 : _n.length) || !!slots.actions) || __props.close ? (openBlock(), createBlock("div", {
                key: 0,
                class: ui.value.actions({ class: (_o = props.ui) == null ? void 0 : _o.actions, orientation: "horizontal" })
              }, [
                __props.orientation === "horizontal" && (((_p = __props.actions) == null ? void 0 : _p.length) || !!slots.actions) ? renderSlot(_ctx.$slots, "actions", { key: 0 }, () => [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.actions, (action, index2) => {
                    return openBlock(), createBlock(_sfc_main$6, mergeProps({
                      key: index2,
                      size: "xs"
                    }, { ref_for: true }, action), null, 16);
                  }), 128))
                ]) : createCommentVNode("", true),
                renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => {
                  var _a3;
                  return [
                    __props.close ? (openBlock(), createBlock(_sfc_main$6, mergeProps({
                      key: 0,
                      icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                      size: "md",
                      color: "neutral",
                      variant: "link",
                      "aria-label": unref(t)("alert.close")
                    }, typeof __props.close === "object" ? __props.close : {}, {
                      class: ui.value.close({ class: (_a3 = props.ui) == null ? void 0 : _a3.close }),
                      onClick: ($event) => emits("update:open", false)
                    }), null, 16, ["icon", "aria-label", "class", "onClick"])) : createCommentVNode("", true)
                  ];
                })
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/Alert.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "TrackCard",
  __ssrInlineRender: true,
  props: {
    track: {},
    activeDownloads: {},
    errorTracks: {}
  },
  emits: ["download"],
  setup(__props) {
    const props = __props;
    const uiStore = useUIStore();
    const getTrackId = (id) => String(id);
    const isDownloadQueueOpen = computed(() => uiStore.showDownloadQueue);
    const isDownloading = computed(
      () => {
        var _a, _b;
        return (_b = (_a = props.activeDownloads) == null ? void 0 : _a.includes(getTrackId(props.track.id))) != null ? _b : false;
      }
    );
    const hasError = computed(
      () => {
        var _a;
        return ((_a = props.errorTracks) == null ? void 0 : _a[getTrackId(props.track.id)]) !== void 0;
      }
    );
    computed(
      () => {
        var _a;
        return ((_a = props.errorTracks) == null ? void 0 : _a[getTrackId(props.track.id)]) || "Error";
      }
    );
    const formatDuration = (ms) => {
      const minutes = Math.floor(ms / 6e4);
      const seconds = Math.floor(ms % 6e4 / 1e3);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };
    const completedDownloads = computed(() => {
      return [];
    });
    const isCompleted = computed(
      () => completedDownloads.value.includes(getTrackId(props.track.id))
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-3 lg:p-4 xl:p-5 hover:bg-gray-800/40 hover:border-orange-500/30 transition-all duration-300 group hover:shadow-lg hover:shadow-orange-500/10 hover:translate-y-[-2px]" }, _attrs))} data-v-3ab6bc91><div class="block sm:hidden" data-v-3ab6bc91><div class="relative w-full h-32 rounded-lg overflow-hidden mb-3" data-v-3ab6bc91>`);
      if (_ctx.track.artwork) {
        _push(`<img${ssrRenderAttr("src", _ctx.track.artwork)}${ssrRenderAttr("alt", _ctx.track.title)} class="w-full h-full object-cover shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:brightness-110" loading="lazy" data-v-3ab6bc91>`);
      } else {
        _push(`<div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg flex items-center justify-center ring-1 ring-white/5" data-v-3ab6bc91><svg class="w-10 h-10 text-gray-600 group-hover:text-orange-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-3ab6bc91><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" data-v-3ab6bc91></path></svg></div>`);
      }
      if (_ctx.activeDownloads.includes(getTrackId(_ctx.track.id))) {
        _push(`<div class="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white p-1.5 rounded-full shadow-lg animate-bounce" data-v-3ab6bc91><svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" data-v-3ab6bc91><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-3ab6bc91></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-3ab6bc91></path></svg></div>`);
      } else if (completedDownloads.value.includes(getTrackId(_ctx.track.id))) {
        _push(`<div class="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-1.5 rounded-full shadow-lg" data-v-3ab6bc91><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-3ab6bc91><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-v-3ab6bc91></path></svg></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mb-3" data-v-3ab6bc91><h3 class="font-semibold text-gray-100 truncate group-hover:text-orange-400 transition-colors text-sm" data-v-3ab6bc91>${ssrInterpolate(_ctx.track.title)}</h3><p class="text-xs text-gray-400 truncate mt-1 group-hover:text-gray-300 transition-colors" data-v-3ab6bc91>${ssrInterpolate(_ctx.track.artist)}</p><p class="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors" data-v-3ab6bc91>${ssrInterpolate(formatDuration(_ctx.track.duration))}</p></div><div class="flex items-center gap-2" data-v-3ab6bc91><a${ssrRenderAttr("href", _ctx.track.url)} target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-orange-500 transition-colors hover:scale-110 transform duration-200 flex-shrink-0 p-2"${ssrRenderAttr("title", "Open in SoundCloud")} data-v-3ab6bc91><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" data-v-3ab6bc91><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" data-v-3ab6bc91></path></svg></a><button${ssrIncludeBooleanAttr(isDownloading.value || isCompleted.value || hasError.value) ? " disabled" : ""} class="flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500 hover:to-orange-600 text-orange-500 hover:text-white border border-orange-500/30 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 group-hover:shadow-lg group-hover:shadow-orange-500/10 text-xs" data-v-3ab6bc91>`);
      if (isDownloading.value) {
        _push(`<span data-v-3ab6bc91>Downloading...</span>`);
      } else if (isCompleted.value) {
        _push(`<span data-v-3ab6bc91>Downloaded</span>`);
      } else if (hasError.value) {
        _push(`<span data-v-3ab6bc91>Error</span>`);
      } else {
        _push(`<span data-v-3ab6bc91>Download</span>`);
      }
      _push(`</button></div></div><div class="hidden sm:block" data-v-3ab6bc91><div class="${ssrRenderClass([isDownloadQueueOpen.value ? "flex-col" : "flex-row", "flex gap-3 lg:gap-4 transition-all duration-300"])}" data-v-3ab6bc91><div class="${ssrRenderClass([isDownloadQueueOpen.value ? "w-full h-40" : "w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24", "relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300"])}" data-v-3ab6bc91>`);
      if (_ctx.track.artwork) {
        _push(`<img${ssrRenderAttr("src", _ctx.track.artwork)}${ssrRenderAttr("alt", _ctx.track.title)} class="w-full h-full object-cover shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:brightness-110" loading="lazy" data-v-3ab6bc91>`);
      } else {
        _push(`<div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg flex items-center justify-center ring-1 ring-white/5" data-v-3ab6bc91><svg class="${ssrRenderClass([isDownloadQueueOpen.value ? "w-16 h-16" : "w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10", "text-gray-600 group-hover:text-orange-500 transition-colors duration-300"])}" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-3ab6bc91><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" data-v-3ab6bc91></path></svg></div>`);
      }
      if (_ctx.activeDownloads.includes(getTrackId(_ctx.track.id))) {
        _push(`<div class="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white p-1 lg:p-1.5 rounded-full shadow-lg animate-bounce" data-v-3ab6bc91><svg class="w-2.5 h-2.5 lg:w-3 lg:h-3 animate-spin" fill="none" viewBox="0 0 24 24" data-v-3ab6bc91><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-3ab6bc91></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-3ab6bc91></path></svg></div>`);
      } else if (completedDownloads.value.includes(getTrackId(_ctx.track.id))) {
        _push(`<div class="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-1 lg:p-1.5 rounded-full shadow-lg" data-v-3ab6bc91><svg class="w-2.5 h-2.5 lg:w-3 lg:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-3ab6bc91><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-v-3ab6bc91></path></svg></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex-1 min-w-0 flex flex-col justify-between py-0.5" data-v-3ab6bc91><div class="${ssrRenderClass([isDownloadQueueOpen.value ? "mb-3" : "", "min-w-0"])}" data-v-3ab6bc91><h3 class="font-semibold text-gray-100 truncate group-hover:text-orange-400 transition-colors text-xs lg:text-sm xl:text-base" data-v-3ab6bc91>${ssrInterpolate(_ctx.track.title)}</h3><p class="text-xs lg:text-sm text-gray-400 truncate mt-0.5 lg:mt-1 group-hover:text-gray-300 transition-colors" data-v-3ab6bc91>${ssrInterpolate(_ctx.track.artist)}</p><p class="text-xs text-gray-500 mt-0.5 lg:mt-1 group-hover:text-gray-400 transition-colors" data-v-3ab6bc91>${ssrInterpolate(formatDuration(_ctx.track.duration))}</p></div><div class="flex items-center gap-2 mt-2 lg:mt-3" data-v-3ab6bc91><a${ssrRenderAttr("href", _ctx.track.url)} target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-orange-500 transition-colors hover:scale-110 transform duration-200 flex-shrink-0 p-1"${ssrRenderAttr("title", "Open in SoundCloud")} data-v-3ab6bc91><svg class="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 24 24" data-v-3ab6bc91><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" data-v-3ab6bc91></path></svg></a><button${ssrIncludeBooleanAttr(isDownloading.value || isCompleted.value || hasError.value) ? " disabled" : ""} class="flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500 hover:to-orange-600 text-orange-500 hover:text-white border border-orange-500/30 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 group-hover:shadow-lg group-hover:shadow-orange-500/10 text-sm" data-v-3ab6bc91>`);
      if (isDownloading.value) {
        _push(`<span class="truncate" data-v-3ab6bc91>Downloading...</span>`);
      } else if (isCompleted.value) {
        _push(`<span class="truncate" data-v-3ab6bc91>Downloaded</span>`);
      } else if (hasError.value) {
        _push(`<span class="truncate" data-v-3ab6bc91>Error</span>`);
      } else {
        _push(`<span class="truncate" data-v-3ab6bc91>Download</span>`);
      }
      _push(`</button></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/playlist/TrackCard.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const TrackCard = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-3ab6bc91"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "TrackGrid",
  __ssrInlineRender: true,
  props: {
    tracks: {},
    downloadingTracks: {},
    errorTracks: {}
  },
  emits: ["download"],
  setup(__props) {
    const getTrackId = (track) => String(track.id);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4 xl:gap-6" }, _attrs))}><!--[-->`);
      ssrRenderList(_ctx.tracks, (track) => {
        _push(ssrRenderComponent(TrackCard, {
          key: getTrackId(track),
          track,
          "active-downloads": _ctx.downloadingTracks || [],
          "download-errors": _ctx.errorTracks || {},
          onDownload: ($event) => _ctx.$emit("download", track)
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/playlist/TrackGrid.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TrackList",
  __ssrInlineRender: true,
  props: {
    tracks: {},
    isLoading: { type: Boolean },
    error: {},
    playlistTitle: {},
    playlistArtwork: {},
    isDownloadingAll: { type: Boolean },
    downloadingTracks: {},
    errorTracks: {}
  },
  emits: ["download", "downloadAll"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UAlert = _sfc_main$4;
      const _component_UIcon = _sfc_main$4$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 lg:space-y-8" }, _attrs))}>`);
      if (_ctx.playlistTitle || _ctx.playlistArtwork) {
        _push(`<div class="relative"><div class="relative h-48 md:h-60 lg:h-72 xl:h-80 overflow-hidden rounded-2xl shadow-2xl">`);
        if (_ctx.playlistArtwork) {
          _push(`<img${ssrRenderAttr("src", _ctx.playlistArtwork)}${ssrRenderAttr("alt", _ctx.playlistTitle)} class="w-full h-full object-cover">`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div><div class="absolute bottom-0 left-0 right-0 p-4 lg:p-6 xl:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"><div class="text-white"><h1 class="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 lg:mb-3 text-shadow-lg bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent">${ssrInterpolate(_ctx.playlistTitle || "Untitled Playlist")}</h1><p class="text-sm md:text-base lg:text-lg text-orange-200/90 text-shadow">${ssrInterpolate(((_a = _ctx.tracks) == null ? void 0 : _a.length) || 0)} tracks </p></div>`);
        if (_ctx.tracks && _ctx.tracks.length > 0) {
          _push(`<button${ssrIncludeBooleanAttr(_ctx.isDownloadingAll) ? " disabled" : ""} class="px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-orange-500/20 hover:shadow-xl text-sm lg:text-base"><svg class="${ssrRenderClass([{ "animate-spin": _ctx.isDownloadingAll }, "w-4 h-4 lg:w-5 lg:h-5"])}" fill="none" viewBox="0 0 24 24" stroke="currentColor">`);
          if (_ctx.isDownloadingAll) {
            _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>`);
          } else {
            _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>`);
          }
          _push(`</svg><span>${ssrInterpolate(_ctx.isDownloadingAll ? "Processing..." : "Download All")}</span></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (_ctx.isLoading) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4 xl:gap-6"><!--[-->`);
        ssrRenderList(6, (i) => {
          _push(`<div class="bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-3 lg:p-4 xl:p-5 animate-pulse"><div class="flex gap-3 lg:gap-4 xl:gap-6"><div class="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gray-700/50 rounded-lg flex-shrink-0"></div><div class="flex-1 min-w-0"><div class="h-4 lg:h-5 xl:h-6 bg-gray-700/50 rounded w-3/4 mb-2"></div><div class="h-3 lg:h-4 bg-gray-700/50 rounded w-1/2 mb-2 lg:mb-3"></div><div class="h-6 lg:h-8 bg-gray-700/50 rounded w-1/3"></div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (_ctx.error) {
        _push(ssrRenderComponent(_component_UAlert, {
          title: _ctx.error,
          color: "red",
          variant: "soft",
          icon: "i-heroicons-exclamation-triangle",
          class: "bg-red-900/20 text-red-100 border-red-900"
        }, null, _parent));
      } else if (_ctx.tracks && _ctx.tracks.length > 0) {
        _push(ssrRenderComponent(_sfc_main$2, {
          tracks: _ctx.tracks,
          "downloading-tracks": _ctx.downloadingTracks,
          "error-tracks": _ctx.errorTracks,
          onDownload: ($event) => _ctx.$emit("download", $event)
        }, null, _parent));
      } else {
        _push(`<div class="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 lg:p-12 text-center"><div class="flex justify-center mb-4"><div class="p-3 lg:p-4 rounded-full bg-gray-700/50">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-heroicons-musical-note",
          class: "w-10 h-10 lg:w-12 lg:h-12 text-orange-500/70"
        }, null, _parent));
        _push(`</div></div><h3 class="text-lg lg:text-xl font-semibold text-gray-200 mb-2">No tracks found</h3><p class="text-sm lg:text-base text-gray-400">Enter a SoundCloud playlist URL to start downloading tracks</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TrackList.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { error: playlistError } = usePlaylist();
    const logger = useLogger();
    const handleDownloadTrack = inject("handleDownloadTrack");
    const downloadingTracks = inject("downloadingTracks");
    const errorTracks = inject("errorTracks");
    const tracks = ref([]);
    const playlistInfo = ref(null);
    const loading = ref(false);
    const error = ref("");
    const isDownloadingAll = ref(false);
    async function handlePlaylistLoaded(data) {
      tracks.value = data.tracks;
      playlistInfo.value = data.playlistInfo;
      error.value = "";
      logger.logPlaylistLoad(data.playlistInfo.url || "Unknown URL", data.tracks.length);
      logger.logUserAction(`Loaded playlist: ${data.playlistInfo.title}`);
    }
    function handleError(errorMessage) {
      error.value = errorMessage;
      tracks.value = [];
      playlistInfo.value = null;
      logger.logPlaylistError("Unknown URL", errorMessage);
      logger.logError("Playlist Load Failed", errorMessage);
    }
    async function handleDownloadAll() {
      if (!tracks.value || tracks.value.length === 0) return;
      isDownloadingAll.value = true;
      try {
        const tracksToDownload = tracks.value.filter((track) => {
          const trackId = track.id.toString();
          return !downloadingTracks.value.includes(trackId) && !errorTracks.value[trackId];
        });
        logger.logDownloadQueueStart(tracksToDownload.length);
        logger.logUserAction(`Started batch download of ${tracksToDownload.length} tracks`);
        let successCount = 0;
        let errorCount = 0;
        for (const track of tracksToDownload) {
          try {
            await handleDownloadTrack(track);
            successCount++;
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error2) {
            errorCount++;
            logger.logDownloadError(track.title, error2 instanceof Error ? error2.message : "Unknown error");
          }
        }
        logger.logDownloadQueueComplete(successCount, tracksToDownload.length);
      } catch (error2) {
        logger.logError("Batch Download Failed", error2 instanceof Error ? error2.message : "Unknown error");
      } finally {
        isDownloadingAll.value = false;
      }
    }
    watchEffect(() => {
      if (playlistError.value) {
        error.value = playlistError.value;
        logger.logPlaylistError("Unknown URL", playlistError.value);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_PlaylistInput = _sfc_main$5;
      const _component_TrackList = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-c0b12979><div class="mb-8 text-center" data-v-c0b12979><h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-4" data-v-c0b12979> SoundCloud Playlist Downloader </h1><p class="text-gray-400" data-v-c0b12979>Enter a SoundCloud playlist URL to download all tracks</p></div><div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700/50 mb-8" data-v-c0b12979>`);
      _push(ssrRenderComponent(_component_PlaylistInput, {
        onPlaylistLoaded: handlePlaylistLoaded,
        onError: handleError,
        loading: loading.value
      }, null, _parent));
      _push(`</div>`);
      if (error.value) {
        _push(`<div class="bg-red-900/20 border border-red-800/50 text-red-200 p-4 rounded-xl mb-8 backdrop-blur-sm" data-v-c0b12979><div class="flex items-center gap-3" data-v-c0b12979><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-c0b12979><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" data-v-c0b12979></path></svg><span data-v-c0b12979>${ssrInterpolate(error.value)}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (playlistInfo.value && tracks.value && tracks.value.length > 0) {
        _push(ssrRenderComponent(_component_TrackList, {
          tracks: tracks.value,
          "is-loading": loading.value,
          error: error.value,
          "playlist-title": (_a = playlistInfo.value) == null ? void 0 : _a.title,
          "playlist-artwork": (_b = playlistInfo.value) == null ? void 0 : _b.artwork,
          "is-downloading-all": isDownloadingAll.value,
          "downloading-tracks": Array.from(unref(downloadingTracks)).map(String),
          "error-tracks": {},
          onDownload: unref(handleDownloadTrack),
          onDownloadAll: handleDownloadAll
        }, null, _parent));
      } else if (loading.value) {
        _push(`<div class="text-center py-12" data-v-c0b12979><div class="inline-flex items-center gap-3 text-gray-400" data-v-c0b12979><svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24" data-v-c0b12979><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-c0b12979></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-c0b12979></path></svg><span data-v-c0b12979>Loading playlist...</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c0b12979"]]);

export { index as default };;globalThis.__timing__.logEnd('Load chunks/build/index-BGXb-QiA');
//# sourceMappingURL=index-BGXb-QiA.mjs.map
