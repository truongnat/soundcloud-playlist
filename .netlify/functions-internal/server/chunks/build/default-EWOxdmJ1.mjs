globalThis.__timing__.logStart('Load chunks/build/default-EWOxdmJ1');import { defineComponent, ref, computed, provide, mergeProps, withCtx, unref, createBlock, createVNode, openBlock, toDisplayString, Transition, createCommentVNode, renderSlot, nextTick, toRef, useId, shallowRef, Fragment, renderList, resolveDynamicComponent, watch, inject, useSlots, createTextVNode, withModifiers, h, shallowReactive, reactive, markRaw, readonly, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderSlot, ssrRenderAttr, ssrRenderList, ssrRenderVNode, ssrRenderAttrs, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { useForwardProps, ConfigProvider, TooltipProvider, ToastProvider, ToastPortal, ToastViewport, useForwardPropsEmits, ToastRoot, ToastTitle, ToastDescription, ToastAction, ToastClose } from 'reka-ui';
import { reactivePick, createSharedComposable } from '@vueuse/core';
import { c as useUIStore, l as localeContextInjectionKey, t as tv, o as omit, u as useLocale, a as _sfc_main$3$1, _ as _sfc_main$4$1, b as _sfc_main$9 } from './ui-DoL6jn0v.mjs';
import { u as useHead, _ as _export_sfc, n as navigateTo, a as useAppConfig, b as useState } from './server.mjs';
import { a as useLogsStore, u as useLogger } from './useLogger-CQxSitFg.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-DVAOoN_s.mjs';
import { defineStore } from 'pinia';
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
import 'vue-router';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

const portalTargetInjectionKey = Symbol("nuxt-ui.portal-target");
function usePortal(portal) {
  const portalTarget = inject(portalTargetInjectionKey, void 0);
  const to = computed(() => {
    var _a;
    if (typeof portal.value === "boolean" || portal.value === void 0) {
      return (_a = portalTarget == null ? void 0 : portalTarget.value) != null ? _a : "body";
    }
    return portal.value;
  });
  const disabled = computed(() => typeof portal.value === "boolean" ? !portal.value : false);
  provide(portalTargetInjectionKey, computed(() => to.value));
  return computed(() => ({
    to: to.value,
    disabled: disabled.value
  }));
}
function useToast() {
  const toasts = useState("toasts", () => []);
  const running = ref(false);
  const queue = [];
  const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  async function processQueue() {
    if (running.value || queue.length === 0) {
      return;
    }
    running.value = true;
    while (queue.length > 0) {
      const toast = queue.shift();
      await nextTick();
      toasts.value = [...toasts.value, toast].slice(-5);
    }
    running.value = false;
  }
  function add(toast) {
    const body = {
      id: generateId(),
      open: true,
      ...toast
    };
    queue.push(body);
    processQueue();
    return body;
  }
  function update(id, toast) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value[index] = {
        ...toasts.value[index],
        ...toast
      };
    }
  }
  function remove(id) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value[index] = {
        ...toasts.value[index],
        open: false
      };
    }
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 200);
  }
  function clear() {
    toasts.value = [];
  }
  return {
    toasts,
    add,
    update,
    remove,
    clear
  };
}
const theme$1 = {
  "slots": {
    "root": "relative group overflow-hidden bg-default shadow-lg rounded-lg ring ring-default p-4 flex gap-2.5 focus:outline-none",
    "wrapper": "w-0 flex-1 flex flex-col",
    "title": "text-sm font-medium text-highlighted",
    "description": "text-sm text-muted",
    "icon": "shrink-0 size-5",
    "avatar": "shrink-0",
    "avatarSize": "2xl",
    "actions": "flex gap-1.5 shrink-0",
    "progress": "absolute inset-x-0 bottom-0 h-1 z-[-1]",
    "close": "p-0"
  },
  "variants": {
    "color": {
      "primary": {
        "root": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        "icon": "text-primary",
        "progress": "bg-primary"
      },
      "secondary": {
        "root": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary",
        "icon": "text-secondary",
        "progress": "bg-secondary"
      },
      "success": {
        "root": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success",
        "icon": "text-success",
        "progress": "bg-success"
      },
      "info": {
        "root": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info",
        "icon": "text-info",
        "progress": "bg-info"
      },
      "warning": {
        "root": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning",
        "icon": "text-warning",
        "progress": "bg-warning"
      },
      "error": {
        "root": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error",
        "icon": "text-error",
        "progress": "bg-error"
      },
      "neutral": {
        "root": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted",
        "icon": "text-highlighted",
        "progress": "bg-inverted"
      }
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
  "defaultVariants": {
    "color": "primary"
  }
};
const _sfc_main$8 = {
  __name: "Toast",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    title: { type: [String, Object, Function], required: false },
    description: { type: [String, Object, Function], required: false },
    icon: { type: String, required: false },
    avatar: { type: Object, required: false },
    color: { type: null, required: false },
    orientation: { type: null, required: false, default: "vertical" },
    progress: { type: Boolean, required: false, default: true },
    actions: { type: Array, required: false },
    close: { type: [Boolean, Object], required: false, default: true },
    closeIcon: { type: String, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    defaultOpen: { type: Boolean, required: false },
    open: { type: Boolean, required: false },
    type: { type: String, required: false },
    duration: { type: Number, required: false }
  },
  emits: ["escapeKeyDown", "pause", "resume", "swipeStart", "swipeMove", "swipeCancel", "swipeEnd", "update:open"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const { t } = useLocale();
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(reactivePick(props, "as", "defaultOpen", "open", "duration", "type"), emits);
    const ui = computed(() => {
      var _a;
      return tv({ extend: tv(theme$1), ...((_a = appConfig.ui) == null ? void 0 : _a.toast) || {} })({
        color: props.color,
        orientation: props.orientation,
        title: !!props.title || !!slots.title
      });
    });
    const el = ref();
    const height = ref(0);
    __expose({
      height
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(ssrRenderComponent(unref(ToastRoot), mergeProps({
        ref_key: "el",
        ref: el
      }, unref(rootProps), {
        "data-orientation": __props.orientation,
        class: ui.value.root({ class: [(_a = props.ui) == null ? void 0 : _a.root, props.class] }),
        style: { "--height": height.value }
      }, _attrs), {
        default: withCtx(({ remaining, duration }, _push2, _parent2, _scopeId) => {
          var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
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
              _push2(ssrRenderComponent(unref(ToastTitle), {
                class: ui.value.title({ class: (_b = props.ui) == null ? void 0 : _b.title })
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "title", {}, () => {
                      if (typeof __props.title === "function") {
                        ssrRenderVNode(_push3, createVNode(resolveDynamicComponent(__props.title()), null, null), _parent3, _scopeId2);
                      } else if (typeof __props.title === "object") {
                        ssrRenderVNode(_push3, createVNode(resolveDynamicComponent(__props.title), null, null), _parent3, _scopeId2);
                      } else {
                        _push3(`<!--[-->${ssrInterpolate(__props.title)}<!--]-->`);
                      }
                    }, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "title", {}, () => [
                        typeof __props.title === "function" ? (openBlock(), createBlock(resolveDynamicComponent(__props.title()), { key: 0 })) : typeof __props.title === "object" ? (openBlock(), createBlock(resolveDynamicComponent(__props.title), { key: 1 })) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                          createTextVNode(toDisplayString(__props.title), 1)
                        ], 64))
                      ])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (__props.description || !!slots.description) {
              _push2(ssrRenderComponent(unref(ToastDescription), {
                class: ui.value.description({ class: (_c = props.ui) == null ? void 0 : _c.description })
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                      if (typeof __props.description === "function") {
                        ssrRenderVNode(_push3, createVNode(resolveDynamicComponent(__props.description()), null, null), _parent3, _scopeId2);
                      } else if (typeof __props.description === "object") {
                        ssrRenderVNode(_push3, createVNode(resolveDynamicComponent(__props.description), null, null), _parent3, _scopeId2);
                      } else {
                        _push3(`<!--[-->${ssrInterpolate(__props.description)}<!--]-->`);
                      }
                    }, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "description", {}, () => [
                        typeof __props.description === "function" ? (openBlock(), createBlock(resolveDynamicComponent(__props.description()), { key: 0 })) : typeof __props.description === "object" ? (openBlock(), createBlock(resolveDynamicComponent(__props.description), { key: 1 })) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                          createTextVNode(toDisplayString(__props.description), 1)
                        ], 64))
                      ])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (__props.orientation === "vertical" && (((_d = __props.actions) == null ? void 0 : _d.length) || !!slots.actions)) {
              _push2(`<div class="${ssrRenderClass(ui.value.actions({ class: (_e = props.ui) == null ? void 0 : _e.actions }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "actions", {}, () => {
                _push2(`<!--[-->`);
                ssrRenderList(__props.actions, (action, index) => {
                  _push2(ssrRenderComponent(unref(ToastAction), {
                    key: index,
                    "alt-text": action.label || "Action",
                    "as-child": "",
                    onClick: () => {
                    }
                  }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_sfc_main$9, mergeProps({
                          size: "xs",
                          color: __props.color
                        }, { ref_for: true }, action), null, _parent3, _scopeId2));
                      } else {
                        return [
                          createVNode(_sfc_main$9, mergeProps({
                            size: "xs",
                            color: __props.color
                          }, { ref_for: true }, action), null, 16, ["color"])
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
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
                  ssrRenderList(__props.actions, (action, index) => {
                    _push2(ssrRenderComponent(unref(ToastAction), {
                      key: index,
                      "alt-text": action.label || "Action",
                      "as-child": "",
                      onClick: () => {
                      }
                    }, {
                      default: withCtx((_, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(ssrRenderComponent(_sfc_main$9, mergeProps({
                            size: "xs",
                            color: __props.color
                          }, { ref_for: true }, action), null, _parent3, _scopeId2));
                        } else {
                          return [
                            createVNode(_sfc_main$9, mergeProps({
                              size: "xs",
                              color: __props.color
                            }, { ref_for: true }, action), null, 16, ["color"])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  });
                  _push2(`<!--]-->`);
                }, _push2, _parent2, _scopeId);
              } else {
                _push2(`<!---->`);
              }
              if (__props.close || !!slots.close) {
                _push2(ssrRenderComponent(unref(ToastClose), { "as-child": "" }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      ssrRenderSlot(_ctx.$slots, "close", { ui: ui.value }, () => {
                        var _a3;
                        if (__props.close) {
                          _push3(ssrRenderComponent(_sfc_main$9, mergeProps({
                            icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                            size: "md",
                            color: "neutral",
                            variant: "link",
                            "aria-label": unref(t)("toast.close")
                          }, typeof __props.close === "object" ? __props.close : {}, {
                            class: ui.value.close({ class: (_a3 = props.ui) == null ? void 0 : _a3.close }),
                            onClick: () => {
                            }
                          }), null, _parent3, _scopeId2));
                        } else {
                          _push3(`<!---->`);
                        }
                      }, _push3, _parent3, _scopeId2);
                    } else {
                      return [
                        renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => {
                          var _a3;
                          return [
                            __props.close ? (openBlock(), createBlock(_sfc_main$9, mergeProps({
                              key: 0,
                              icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                              size: "md",
                              color: "neutral",
                              variant: "link",
                              "aria-label": unref(t)("toast.close")
                            }, typeof __props.close === "object" ? __props.close : {}, {
                              class: ui.value.close({ class: (_a3 = props.ui) == null ? void 0 : _a3.close }),
                              onClick: withModifiers(() => {
                              }, ["stop"])
                            }), null, 16, ["icon", "aria-label", "class", "onClick"])) : createCommentVNode("", true)
                          ];
                        })
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.progress && remaining > 0 && duration) {
              _push2(`<div class="${ssrRenderClass(ui.value.progress({ class: (_i = props.ui) == null ? void 0 : _i.progress }))}" style="${ssrRenderStyle({ width: `${remaining / duration * 100}%` })}"${_scopeId}></div>`);
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
                class: ui.value.wrapper({ class: (_j = props.ui) == null ? void 0 : _j.wrapper })
              }, [
                __props.title || !!slots.title ? (openBlock(), createBlock(unref(ToastTitle), {
                  key: 0,
                  class: ui.value.title({ class: (_k = props.ui) == null ? void 0 : _k.title })
                }, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, "title", {}, () => [
                      typeof __props.title === "function" ? (openBlock(), createBlock(resolveDynamicComponent(__props.title()), { key: 0 })) : typeof __props.title === "object" ? (openBlock(), createBlock(resolveDynamicComponent(__props.title), { key: 1 })) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                        createTextVNode(toDisplayString(__props.title), 1)
                      ], 64))
                    ])
                  ]),
                  _: 3
                }, 8, ["class"])) : createCommentVNode("", true),
                __props.description || !!slots.description ? (openBlock(), createBlock(unref(ToastDescription), {
                  key: 1,
                  class: ui.value.description({ class: (_l = props.ui) == null ? void 0 : _l.description })
                }, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, "description", {}, () => [
                      typeof __props.description === "function" ? (openBlock(), createBlock(resolveDynamicComponent(__props.description()), { key: 0 })) : typeof __props.description === "object" ? (openBlock(), createBlock(resolveDynamicComponent(__props.description), { key: 1 })) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                        createTextVNode(toDisplayString(__props.description), 1)
                      ], 64))
                    ])
                  ]),
                  _: 3
                }, 8, ["class"])) : createCommentVNode("", true),
                __props.orientation === "vertical" && (((_m = __props.actions) == null ? void 0 : _m.length) || !!slots.actions) ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: ui.value.actions({ class: (_n = props.ui) == null ? void 0 : _n.actions })
                }, [
                  renderSlot(_ctx.$slots, "actions", {}, () => [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.actions, (action, index) => {
                      return openBlock(), createBlock(unref(ToastAction), {
                        key: index,
                        "alt-text": action.label || "Action",
                        "as-child": "",
                        onClick: withModifiers(() => {
                        }, ["stop"])
                      }, {
                        default: withCtx(() => [
                          createVNode(_sfc_main$9, mergeProps({
                            size: "xs",
                            color: __props.color
                          }, { ref_for: true }, action), null, 16, ["color"])
                        ]),
                        _: 2
                      }, 1032, ["alt-text", "onClick"]);
                    }), 128))
                  ])
                ], 2)) : createCommentVNode("", true)
              ], 2),
              __props.orientation === "horizontal" && (((_o = __props.actions) == null ? void 0 : _o.length) || !!slots.actions) || __props.close ? (openBlock(), createBlock("div", {
                key: 0,
                class: ui.value.actions({ class: (_p = props.ui) == null ? void 0 : _p.actions, orientation: "horizontal" })
              }, [
                __props.orientation === "horizontal" && (((_q = __props.actions) == null ? void 0 : _q.length) || !!slots.actions) ? renderSlot(_ctx.$slots, "actions", { key: 0 }, () => [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.actions, (action, index) => {
                    return openBlock(), createBlock(unref(ToastAction), {
                      key: index,
                      "alt-text": action.label || "Action",
                      "as-child": "",
                      onClick: withModifiers(() => {
                      }, ["stop"])
                    }, {
                      default: withCtx(() => [
                        createVNode(_sfc_main$9, mergeProps({
                          size: "xs",
                          color: __props.color
                        }, { ref_for: true }, action), null, 16, ["color"])
                      ]),
                      _: 2
                    }, 1032, ["alt-text", "onClick"]);
                  }), 128))
                ]) : createCommentVNode("", true),
                __props.close || !!slots.close ? (openBlock(), createBlock(unref(ToastClose), {
                  key: 1,
                  "as-child": ""
                }, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => {
                      var _a3;
                      return [
                        __props.close ? (openBlock(), createBlock(_sfc_main$9, mergeProps({
                          key: 0,
                          icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                          size: "md",
                          color: "neutral",
                          variant: "link",
                          "aria-label": unref(t)("toast.close")
                        }, typeof __props.close === "object" ? __props.close : {}, {
                          class: ui.value.close({ class: (_a3 = props.ui) == null ? void 0 : _a3.close }),
                          onClick: withModifiers(() => {
                          }, ["stop"])
                        }), null, 16, ["icon", "aria-label", "class", "onClick"])) : createCommentVNode("", true)
                      ];
                    })
                  ]),
                  _: 3
                })) : createCommentVNode("", true)
              ], 2)) : createCommentVNode("", true),
              __props.progress && remaining > 0 && duration ? (openBlock(), createBlock("div", {
                key: 1,
                class: ui.value.progress({ class: (_r = props.ui) == null ? void 0 : _r.progress }),
                style: { width: `${remaining / duration * 100}%` }
              }, null, 6)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/Toast.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const theme = {
  "slots": {
    "viewport": "fixed flex flex-col w-[calc(100%-2rem)] sm:w-96 z-[100] data-[expanded=true]:h-(--height) focus:outline-none",
    "base": "pointer-events-auto absolute inset-x-0 z-(--index) transform-(--transform) data-[expanded=false]:data-[front=false]:h-(--front-height) data-[expanded=false]:data-[front=false]:*:invisible data-[state=closed]:animate-[toast-closed_200ms_ease-in-out] data-[state=closed]:data-[expanded=false]:data-[front=false]:animate-[toast-collapsed-closed_200ms_ease-in-out] data-[swipe=move]:transition-none transition-[transform,translate,height] duration-200 ease-out"
  },
  "variants": {
    "position": {
      "top-left": {
        "viewport": "left-4"
      },
      "top-center": {
        "viewport": "left-1/2 transform -translate-x-1/2"
      },
      "top-right": {
        "viewport": "right-4"
      },
      "bottom-left": {
        "viewport": "left-4"
      },
      "bottom-center": {
        "viewport": "left-1/2 transform -translate-x-1/2"
      },
      "bottom-right": {
        "viewport": "right-4"
      }
    },
    "swipeDirection": {
      "up": "data-[swipe=end]:animate-[toast-slide-up_200ms_ease-out]",
      "right": "data-[swipe=end]:animate-[toast-slide-right_200ms_ease-out]",
      "down": "data-[swipe=end]:animate-[toast-slide-down_200ms_ease-out]",
      "left": "data-[swipe=end]:animate-[toast-slide-left_200ms_ease-out]"
    }
  },
  "compoundVariants": [
    {
      "position": [
        "top-left",
        "top-center",
        "top-right"
      ],
      "class": {
        "viewport": "top-4",
        "base": "top-0 data-[state=open]:animate-[slide-in-from-top_200ms_ease-in-out]"
      }
    },
    {
      "position": [
        "bottom-left",
        "bottom-center",
        "bottom-right"
      ],
      "class": {
        "viewport": "bottom-4",
        "base": "bottom-0 data-[state=open]:animate-[slide-in-from-bottom_200ms_ease-in-out]"
      }
    },
    {
      "swipeDirection": [
        "left",
        "right"
      ],
      "class": "data-[swipe=move]:translate-x-(--reka-toast-swipe-move-x) data-[swipe=end]:translate-x-(--reka-toast-swipe-end-x) data-[swipe=cancel]:translate-x-0"
    },
    {
      "swipeDirection": [
        "up",
        "down"
      ],
      "class": "data-[swipe=move]:translate-y-(--reka-toast-swipe-move-y) data-[swipe=end]:translate-y-(--reka-toast-swipe-end-y) data-[swipe=cancel]:translate-y-0"
    }
  ],
  "defaultVariants": {
    "position": "bottom-right"
  }
};
const __default__$1 = {
  name: "Toaster"
};
const _sfc_main$7 = /* @__PURE__ */ Object.assign(__default__$1, {
  __ssrInlineRender: true,
  props: {
    position: { type: null, required: false },
    expand: { type: Boolean, required: false, default: true },
    progress: { type: Boolean, required: false, default: true },
    portal: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    label: { type: String, required: false },
    duration: { type: Number, required: false, default: 5e3 },
    swipeThreshold: { type: Number, required: false }
  },
  setup(__props) {
    const props = __props;
    const { toasts, remove } = useToast();
    const appConfig = useAppConfig();
    const providerProps = useForwardProps(reactivePick(props, "duration", "label", "swipeThreshold"));
    const portalProps = usePortal(toRef(() => props.portal));
    const swipeDirection = computed(() => {
      switch (props.position) {
        case "top-center":
          return "up";
        case "top-right":
        case "bottom-right":
          return "right";
        case "bottom-center":
          return "down";
        case "top-left":
        case "bottom-left":
          return "left";
      }
      return "right";
    });
    const ui = computed(() => {
      var _a;
      return tv({ extend: tv(theme), ...((_a = appConfig.ui) == null ? void 0 : _a.toaster) || {} })({
        position: props.position,
        swipeDirection: swipeDirection.value
      });
    });
    function onUpdateOpen(value, id) {
      if (value) {
        return;
      }
      remove(id);
    }
    const hovered = ref(false);
    const expanded = computed(() => props.expand || hovered.value);
    const refs = ref([]);
    const height = computed(() => refs.value.reduce((acc, { height: height2 }) => acc + height2 + 16, 0));
    const frontHeight = computed(() => {
      var _a;
      return ((_a = refs.value[refs.value.length - 1]) == null ? void 0 : _a.height) || 0;
    });
    function getOffset(index) {
      return refs.value.slice(index + 1).reduce((acc, { height: height2 }) => acc + height2 + 16, 0);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ToastProvider), mergeProps({ "swipe-direction": swipeDirection.value }, unref(providerProps), _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            _push2(`<!--[-->`);
            ssrRenderList(unref(toasts), (toast, index) => {
              var _a;
              _push2(ssrRenderComponent(_sfc_main$8, mergeProps({
                key: toast.id,
                ref_for: true,
                ref_key: "refs",
                ref: refs,
                progress: __props.progress
              }, { ref_for: true }, unref(omit)(toast, ["id", "close"]), {
                close: toast.close,
                "data-expanded": expanded.value,
                "data-front": !expanded.value && index === unref(toasts).length - 1,
                style: {
                  "--index": index - unref(toasts).length + unref(toasts).length,
                  "--before": unref(toasts).length - 1 - index,
                  "--offset": getOffset(index),
                  "--scale": expanded.value ? "1" : "calc(1 - var(--before) * var(--scale-factor))",
                  "--translate": expanded.value ? "calc(var(--offset) * var(--translate-factor))" : "calc(var(--before) * var(--gap))",
                  "--transform": "translateY(var(--translate)) scale(var(--scale))"
                },
                class: ui.value.base({ class: [(_a = props.ui) == null ? void 0 : _a.base, toast.onClick ? "cursor-pointer" : void 0] }),
                "onUpdate:open": ($event) => onUpdateOpen($event, toast.id),
                onClick: ($event) => toast.onClick && toast.onClick(toast)
              }), null, _parent2, _scopeId));
            });
            _push2(`<!--]-->`);
            _push2(ssrRenderComponent(unref(ToastPortal), unref(portalProps), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                var _a, _b, _c, _d, _e, _f;
                if (_push3) {
                  _push3(ssrRenderComponent(unref(ToastViewport), {
                    "data-expanded": expanded.value,
                    class: ui.value.viewport({ class: [(_a = props.ui) == null ? void 0 : _a.viewport, props.class] }),
                    style: {
                      "--scale-factor": "0.05",
                      "--translate-factor": ((_b = __props.position) == null ? void 0 : _b.startsWith("top")) ? "1px" : "-1px",
                      "--gap": ((_c = __props.position) == null ? void 0 : _c.startsWith("top")) ? "16px" : "-16px",
                      "--front-height": `${frontHeight.value}px`,
                      "--height": `${height.value}px`
                    },
                    onMouseenter: ($event) => hovered.value = true,
                    onMouseleave: ($event) => hovered.value = false
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(ToastViewport), {
                      "data-expanded": expanded.value,
                      class: ui.value.viewport({ class: [(_d = props.ui) == null ? void 0 : _d.viewport, props.class] }),
                      style: {
                        "--scale-factor": "0.05",
                        "--translate-factor": ((_e = __props.position) == null ? void 0 : _e.startsWith("top")) ? "1px" : "-1px",
                        "--gap": ((_f = __props.position) == null ? void 0 : _f.startsWith("top")) ? "16px" : "-16px",
                        "--front-height": `${frontHeight.value}px`,
                        "--height": `${height.value}px`
                      },
                      onMouseenter: ($event) => hovered.value = true,
                      onMouseleave: ($event) => hovered.value = false
                    }, null, 8, ["data-expanded", "class", "style", "onMouseenter", "onMouseleave"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              renderSlot(_ctx.$slots, "default"),
              (openBlock(true), createBlock(Fragment, null, renderList(unref(toasts), (toast, index) => {
                var _a;
                return openBlock(), createBlock(_sfc_main$8, mergeProps({
                  key: toast.id,
                  ref_for: true,
                  ref_key: "refs",
                  ref: refs,
                  progress: __props.progress
                }, { ref_for: true }, unref(omit)(toast, ["id", "close"]), {
                  close: toast.close,
                  "data-expanded": expanded.value,
                  "data-front": !expanded.value && index === unref(toasts).length - 1,
                  style: {
                    "--index": index - unref(toasts).length + unref(toasts).length,
                    "--before": unref(toasts).length - 1 - index,
                    "--offset": getOffset(index),
                    "--scale": expanded.value ? "1" : "calc(1 - var(--before) * var(--scale-factor))",
                    "--translate": expanded.value ? "calc(var(--offset) * var(--translate-factor))" : "calc(var(--before) * var(--gap))",
                    "--transform": "translateY(var(--translate)) scale(var(--scale))"
                  },
                  class: ui.value.base({ class: [(_a = props.ui) == null ? void 0 : _a.base, toast.onClick ? "cursor-pointer" : void 0] }),
                  "onUpdate:open": ($event) => onUpdateOpen($event, toast.id),
                  onClick: ($event) => toast.onClick && toast.onClick(toast)
                }), null, 16, ["progress", "close", "data-expanded", "data-front", "style", "class", "onUpdate:open", "onClick"]);
              }), 128)),
              createVNode(unref(ToastPortal), unref(portalProps), {
                default: withCtx(() => {
                  var _a, _b, _c;
                  return [
                    createVNode(unref(ToastViewport), {
                      "data-expanded": expanded.value,
                      class: ui.value.viewport({ class: [(_a = props.ui) == null ? void 0 : _a.viewport, props.class] }),
                      style: {
                        "--scale-factor": "0.05",
                        "--translate-factor": ((_b = __props.position) == null ? void 0 : _b.startsWith("top")) ? "1px" : "-1px",
                        "--gap": ((_c = __props.position) == null ? void 0 : _c.startsWith("top")) ? "16px" : "-16px",
                        "--front-height": `${frontHeight.value}px`,
                        "--height": `${height.value}px`
                      },
                      onMouseenter: ($event) => hovered.value = true,
                      onMouseleave: ($event) => hovered.value = false
                    }, null, 8, ["data-expanded", "class", "style", "onMouseenter", "onMouseleave"])
                  ];
                }),
                _: 1
              }, 16)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/Toaster.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
function _useOverlay() {
  const overlays = shallowReactive([]);
  const create = (component, _options) => {
    const { props, defaultOpen, destroyOnClose } = _options || {};
    const options = reactive({
      id: Symbol(""),
      isOpen: !!defaultOpen,
      component: markRaw(component),
      isMounted: !!defaultOpen,
      destroyOnClose: !!destroyOnClose,
      props: props || {}
    });
    overlays.push(options);
    return {
      ...options,
      open: (props2) => open(options.id, props2),
      close: (value) => close(options.id, value),
      patch: (props2) => patch(options.id, props2)
    };
  };
  const open = (id, props) => {
    const overlay = getOverlay(id);
    if (props) {
      patch(overlay.id, props);
    }
    overlay.isOpen = true;
    overlay.isMounted = true;
    return {
      id,
      isMounted: overlay.isMounted,
      isOpen: overlay.isOpen,
      result: new Promise((resolve) => overlay.resolvePromise = resolve)
    };
  };
  const close = (id, value) => {
    const overlay = getOverlay(id);
    overlay.isOpen = false;
    if (overlay.resolvePromise) {
      overlay.resolvePromise(value);
      overlay.resolvePromise = void 0;
    }
  };
  const closeAll = () => {
    overlays.forEach((overlay) => close(overlay.id));
  };
  const unMount = (id) => {
    const overlay = getOverlay(id);
    overlay.isMounted = false;
    if (overlay.destroyOnClose) {
      const index = overlays.findIndex((overlay2) => overlay2.id === id);
      overlays.splice(index, 1);
    }
  };
  const patch = (id, props) => {
    const overlay = getOverlay(id);
    Object.entries(props).forEach(([key, value]) => {
      overlay.props[key] = value;
    });
  };
  const getOverlay = (id) => {
    const overlay = overlays.find((overlay2) => overlay2.id === id);
    if (!overlay) {
      throw new Error("Overlay not found");
    }
    return overlay;
  };
  const isOpen = (id) => {
    const overlay = getOverlay(id);
    return overlay.isOpen;
  };
  return {
    overlays,
    open,
    close,
    closeAll,
    create,
    patch,
    unMount,
    isOpen
  };
}
const useOverlay = /* @__PURE__ */ createSharedComposable(_useOverlay);
const _sfc_main$6 = {
  __name: "OverlayProvider",
  __ssrInlineRender: true,
  setup(__props) {
    const { overlays, unMount, close } = useOverlay();
    const mountedOverlays = computed(() => overlays.filter((overlay) => overlay.isMounted));
    const onAfterLeave = (id) => {
      close(id);
      unMount(id);
    };
    const onClose = (id, value) => {
      close(id, value);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      ssrRenderList(mountedOverlays.value, (overlay) => {
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(overlay.component), mergeProps({
          key: overlay.id
        }, { ref_for: true }, overlay.props, {
          open: overlay.isOpen,
          "onUpdate:open": ($event) => overlay.isOpen = $event,
          onClose: (value) => onClose(overlay.id, value),
          "onAfter:leave": ($event) => onAfterLeave(overlay.id)
        }), null), _parent);
      });
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/OverlayProvider.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __default__ = {
  name: "App"
};
const _sfc_main$5 = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  props: {
    tooltip: { type: Object, required: false },
    toaster: { type: [Object, null], required: false },
    locale: { type: null, required: false },
    portal: { type: null, required: false, default: "body" },
    scrollBody: { type: [Boolean, Object], required: false },
    nonce: { type: String, required: false }
  },
  setup(__props) {
    const props = __props;
    const configProviderProps = useForwardProps(reactivePick(props, "scrollBody"));
    const tooltipProps = toRef(() => props.tooltip);
    const toasterProps = toRef(() => props.toaster);
    const locale = toRef(() => props.locale);
    provide(localeContextInjectionKey, locale);
    const portal = toRef(() => props.portal);
    provide(portalTargetInjectionKey, portal);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(ssrRenderComponent(unref(ConfigProvider), mergeProps({
        "use-id": () => useId(),
        dir: (_a = locale.value) == null ? void 0 : _a.dir,
        locale: (_b = locale.value) == null ? void 0 : _b.code
      }, unref(configProviderProps), _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(TooltipProvider), tooltipProps.value, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (__props.toaster !== null) {
                    _push3(ssrRenderComponent(_sfc_main$7, toasterProps.value, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          ssrRenderSlot(_ctx.$slots, "default", {}, null, _push4, _parent4, _scopeId3);
                        } else {
                          return [
                            renderSlot(_ctx.$slots, "default")
                          ];
                        }
                      }),
                      _: 3
                    }, _parent3, _scopeId2));
                  } else {
                    ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                  }
                  _push3(ssrRenderComponent(_sfc_main$6, null, null, _parent3, _scopeId2));
                } else {
                  return [
                    __props.toaster !== null ? (openBlock(), createBlock(_sfc_main$7, mergeProps({ key: 0 }, toasterProps.value), {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "default")
                      ]),
                      _: 3
                    }, 16)) : renderSlot(_ctx.$slots, "default", { key: 1 }),
                    createVNode(_sfc_main$6)
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(TooltipProvider), tooltipProps.value, {
                default: withCtx(() => [
                  __props.toaster !== null ? (openBlock(), createBlock(_sfc_main$7, mergeProps({ key: 0 }, toasterProps.value), {
                    default: withCtx(() => [
                      renderSlot(_ctx.$slots, "default")
                    ]),
                    _: 3
                  }, 16)) : renderSlot(_ctx.$slots, "default", { key: 1 }),
                  createVNode(_sfc_main$6)
                ]),
                _: 3
              }, 16)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/App.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "LogsPanel",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const logsStore = useLogsStore();
    useLogger();
    const expandedLogs = ref([]);
    const logsContainer = ref();
    const autoScroll = ref(true);
    ref(false);
    const filteredLogs = computed(() => logsStore.filteredLogs);
    const logStats = computed(() => logsStore.logStats);
    const scrollToBottom = async () => {
      if (!autoScroll.value || !logsContainer.value) return;
      await nextTick();
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
    };
    watch(filteredLogs, () => {
      if (autoScroll.value) {
        scrollToBottom();
      }
    }, { deep: true });
    const formatTime = (timestamp) => {
      return timestamp.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    };
    const formatRelativeTime = (timestamp) => {
      const now = /* @__PURE__ */ new Date();
      const diff = now.getTime() - timestamp.getTime();
      const seconds = Math.floor(diff / 1e3);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      if (seconds < 60) return "now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return timestamp.toLocaleDateString();
    };
    const getLogIcon = (log) => {
      const iconMap = {
        download: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
          h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" })
        ]),
        api: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
          h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" })
        ]),
        error: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
          h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
        ]),
        system: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
          h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" })
        ])
      };
      return iconMap[log.type] || iconMap.system;
    };
    const getFilterIcon = (type) => {
      const iconMap = {
        download: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
          h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" })
        ]),
        api: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
          h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" })
        ]),
        error: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
          h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
        ]),
        system: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
          h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" })
        ])
      };
      return iconMap[type] || iconMap.system;
    };
    const getLogIconClass = (log) => {
      const classes = {
        download: "text-blue-400",
        api: "text-green-400",
        error: "text-red-400",
        system: "text-purple-400"
      };
      return classes[log.type] || "text-gray-400";
    };
    const getLogTitleClass = (log) => {
      const classes = {
        info: "text-gray-200",
        success: "text-green-400",
        warning: "text-yellow-400",
        error: "text-red-400"
      };
      return classes[log.level] || "text-gray-200";
    };
    const getLogRowClass = (log) => {
      if (log.level === "error") return "border-l-2 border-red-500/50 bg-red-900/5";
      if (log.level === "warning") return "border-l-2 border-yellow-500/50 bg-yellow-900/5";
      if (log.level === "success") return "border-l-2 border-green-500/50 bg-green-900/5";
      return "";
    };
    const getLogStatusBadge = (log) => {
      if (log.type === "download" && log.progress !== void 0) {
        if (log.progress === 100) {
          return { text: "Complete", class: "bg-green-900/50 text-green-300" };
        } else if (log.level === "error") {
          return { text: "Failed", class: "bg-red-900/50 text-red-300" };
        } else {
          return { text: "Downloading", class: "bg-blue-900/50 text-blue-300" };
        }
      }
      return null;
    };
    const getProgressBarClass = (log) => {
      if (log.level === "error") return "bg-red-500";
      if (log.progress === 100) return "bg-green-500";
      return "bg-gradient-to-r from-blue-500 to-purple-500";
    };
    const getApiStatusClass = (status) => {
      if (status >= 200 && status < 300) return "bg-green-900/50 text-green-300";
      if (status >= 400 && status < 500) return "bg-yellow-900/50 text-yellow-300";
      if (status >= 500) return "bg-red-900/50 text-red-300";
      return "bg-gray-700/50 text-gray-300";
    };
    const getFilterActiveClass = (type) => {
      const classes = {
        download: "bg-blue-900/50 text-blue-300 border border-blue-500/30",
        api: "bg-green-900/50 text-green-300 border border-green-500/30",
        error: "bg-red-900/50 text-red-300 border border-red-500/30",
        system: "bg-purple-900/50 text-purple-300 border border-purple-500/30"
      };
      return classes[type] || "bg-gray-700 text-gray-300";
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full flex flex-col" }, _attrs))} data-v-64d9edc1><div class="p-4 border-b border-gray-700/50" data-v-64d9edc1><div class="flex items-center justify-between mb-3" data-v-64d9edc1><div class="flex items-center gap-2" data-v-64d9edc1><svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-64d9edc1><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-64d9edc1></path></svg><h2 class="text-lg font-semibold text-gray-200" data-v-64d9edc1>Activity Monitor</h2></div><div class="flex items-center gap-2" data-v-64d9edc1><button class="${ssrRenderClass([{ "text-green-400": autoScroll.value }, "p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded transition-colors"])}" title="Toggle auto-scroll" data-v-64d9edc1><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-64d9edc1><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" data-v-64d9edc1></path></svg></button><button class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded transition-colors" title="Export logs" data-v-64d9edc1><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-64d9edc1><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-64d9edc1></path></svg></button><button class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors" title="Clear all logs" data-v-64d9edc1><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-64d9edc1><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-64d9edc1></path></svg></button></div></div><div class="grid grid-cols-2 gap-2 mb-3" data-v-64d9edc1><div class="bg-gray-800/30 rounded-lg p-2" data-v-64d9edc1><div class="text-xs text-gray-400" data-v-64d9edc1>Total Logs</div><div class="text-sm font-medium text-gray-200" data-v-64d9edc1>${ssrInterpolate(logStats.value.total)}</div></div><div class="bg-red-900/20 rounded-lg p-2" data-v-64d9edc1><div class="text-xs text-red-400" data-v-64d9edc1>Errors</div><div class="text-sm font-medium text-red-300" data-v-64d9edc1>${ssrInterpolate(logStats.value.error)}</div></div><div class="bg-blue-900/20 rounded-lg p-2" data-v-64d9edc1><div class="text-xs text-blue-400" data-v-64d9edc1>Downloads</div><div class="text-sm font-medium text-blue-300" data-v-64d9edc1>${ssrInterpolate(logStats.value.download)}</div></div><div class="bg-green-900/20 rounded-lg p-2" data-v-64d9edc1><div class="text-xs text-green-400" data-v-64d9edc1>API Calls</div><div class="text-sm font-medium text-green-300" data-v-64d9edc1>${ssrInterpolate(logStats.value.api)}</div></div></div><div class="flex flex-wrap gap-1" data-v-64d9edc1><!--[-->`);
      ssrRenderList(unref(logsStore).filters, (enabled, type) => {
        _push(`<button class="${ssrRenderClass([enabled ? getFilterActiveClass(type) : "bg-gray-700/50 text-gray-400 hover:bg-gray-700", "px-2 py-1 text-xs rounded-full transition-all duration-200 capitalize flex items-center gap-1"])}" data-v-64d9edc1>`);
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(getFilterIcon(type)), { class: "w-3 h-3" }, null), _parent);
        _push(` ${ssrInterpolate(type)} (${ssrInterpolate(logStats.value[type])}) </button>`);
      });
      _push(`<!--]--></div></div><div class="flex-1 overflow-y-auto" data-v-64d9edc1>`);
      if (filteredLogs.value.length === 0) {
        _push(`<div class="flex flex-col items-center justify-center h-full text-gray-400 p-8" data-v-64d9edc1><div class="bg-gray-800/50 rounded-full p-4 mb-4" data-v-64d9edc1><svg class="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-64d9edc1><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-64d9edc1></path></svg></div><p class="text-sm font-medium" data-v-64d9edc1>No activity yet</p><p class="text-xs text-gray-500 mt-1 text-center" data-v-64d9edc1>Download progress, API requests, and system events will appear here</p></div>`);
      } else {
        _push(`<div class="divide-y divide-gray-700/30" data-v-64d9edc1><!--[-->`);
        ssrRenderList(filteredLogs.value, (log) => {
          var _a, _b, _c;
          _push(`<div class="${ssrRenderClass([getLogRowClass(log), "p-3 hover:bg-gray-800/30 transition-colors group"])}" data-v-64d9edc1><div class="flex items-start justify-between mb-1" data-v-64d9edc1><div class="flex items-center gap-2 min-w-0 flex-1" data-v-64d9edc1><div class="${ssrRenderClass([getLogIconClass(log), "flex-shrink-0 relative"])}" data-v-64d9edc1>`);
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(getLogIcon(log)), { class: "w-4 h-4" }, null), _parent);
          if (log.type === "download" && log.progress !== void 0 && log.progress < 100) {
            _push(`<div class="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" data-v-64d9edc1></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex items-center gap-2 min-w-0 flex-1" data-v-64d9edc1><h4 class="${ssrRenderClass([getLogTitleClass(log), "font-medium text-sm truncate"])}" data-v-64d9edc1>${ssrInterpolate(log.title)}</h4>`);
          if (getLogStatusBadge(log)) {
            _push(`<span class="${ssrRenderClass([(_a = getLogStatusBadge(log)) == null ? void 0 : _a.class, "px-1.5 py-0.5 text-xs rounded-full flex-shrink-0"])}" data-v-64d9edc1>${ssrInterpolate((_b = getLogStatusBadge(log)) == null ? void 0 : _b.text)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="flex flex-col items-end text-xs text-gray-500 flex-shrink-0 ml-2" data-v-64d9edc1><span data-v-64d9edc1>${ssrInterpolate(formatTime(log.timestamp))}</span><span class="text-gray-600" data-v-64d9edc1>${ssrInterpolate(formatRelativeTime(log.timestamp))}</span></div></div><p class="text-xs text-gray-400 mb-1 pl-6 break-words" data-v-64d9edc1>${ssrInterpolate(log.message)}</p>`);
          if (log.progress !== void 0) {
            _push(`<div class="pl-6 mb-2" data-v-64d9edc1><div class="flex items-center gap-2 mb-1" data-v-64d9edc1><div class="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden" data-v-64d9edc1><div class="${ssrRenderClass([getProgressBarClass(log), "h-full rounded-full transition-all duration-500 relative"])}" style="${ssrRenderStyle({ width: `${Math.max(log.progress, 2)}%` })}" data-v-64d9edc1>`);
            if (log.progress < 100 && log.level !== "error") {
              _push(`<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" data-v-64d9edc1></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div><span class="text-xs font-mono text-gray-400 min-w-[3rem] text-right" data-v-64d9edc1>${ssrInterpolate(log.progress)}% </span></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (log.type === "api" && ((_c = log.details) == null ? void 0 : _c.status)) {
            _push(`<div class="pl-6 mb-2" data-v-64d9edc1><div class="flex items-center gap-2" data-v-64d9edc1><span class="${ssrRenderClass([getApiStatusClass(log.details.status), "text-xs font-mono px-2 py-1 rounded"])}" data-v-64d9edc1>${ssrInterpolate(log.details.status)}</span>`);
            if (log.details.method) {
              _push(`<span class="text-xs text-gray-500 uppercase" data-v-64d9edc1>${ssrInterpolate(log.details.method)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (log.type === "system" && log.level === "success") {
            _push(`<div class="pl-6 mb-2" data-v-64d9edc1><div class="flex items-center gap-1" data-v-64d9edc1><div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" data-v-64d9edc1></div><span class="text-xs text-green-400" data-v-64d9edc1>Online</span></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (log.details && expandedLogs.value.includes(log.id)) {
            _push(`<div class="pl-6 mt-2" data-v-64d9edc1><div class="bg-gray-800/50 rounded-lg p-3 text-xs border border-gray-700/50" data-v-64d9edc1>`);
            if (typeof log.details === "object") {
              _push(`<div data-v-64d9edc1><!--[-->`);
              ssrRenderList(log.details, (value, key) => {
                _push(`<div class="mb-2 last:mb-0" data-v-64d9edc1><span class="text-gray-400 font-medium" data-v-64d9edc1>${ssrInterpolate(key)}:</span><span class="text-gray-300 ml-2" data-v-64d9edc1>${ssrInterpolate(typeof value === "object" ? JSON.stringify(value, null, 2) : value)}</span></div>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<pre class="text-gray-300 whitespace-pre-wrap" data-v-64d9edc1>${ssrInterpolate(log.details)}</pre>`);
            }
            _push(`</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-center gap-2 pl-6 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" data-v-64d9edc1>`);
          if (log.details) {
            _push(`<button class="text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1" data-v-64d9edc1><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-64d9edc1><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", expandedLogs.value.includes(log.id) ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7")} data-v-64d9edc1></path></svg> ${ssrInterpolate(expandedLogs.value.includes(log.id) ? "Hide details" : "Show details")}</button>`);
          } else {
            _push(`<!---->`);
          }
          if (log.type === "error") {
            _push(`<button class="text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1" data-v-64d9edc1><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-64d9edc1><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-64d9edc1></path></svg> Copy error </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LogsPanel.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-64d9edc1"]]);
const useDownloadPerformance = () => {
  const settings = ref({
    maxConcurrentDownloads: 3,
    enableMultiThreading: true,
    compressionPreset: "fast",
    audioQuality: "320k",
    chunkSize: 1024 * 1024
    // 1MB chunks
  });
  const detectOptimalSettings = () => {
    const cores = (void 0).hardwareConcurrency || 4;
    const memory = (void 0).deviceMemory || 4;
    const connection = (void 0).connection;
    let optimalSettings = { ...settings.value };
    if (cores >= 8 && memory >= 8) {
      optimalSettings.maxConcurrentDownloads = 5;
    } else if (cores >= 4 && memory >= 4) {
      optimalSettings.maxConcurrentDownloads = 3;
    } else {
      optimalSettings.maxConcurrentDownloads = 2;
    }
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === "slow-2g" || effectiveType === "2g") {
        optimalSettings.audioQuality = "128k";
        optimalSettings.compressionPreset = "ultrafast";
        optimalSettings.maxConcurrentDownloads = 1;
      } else if (effectiveType === "3g") {
        optimalSettings.audioQuality = "192k";
        optimalSettings.compressionPreset = "fast";
      }
    }
    if (memory >= 8) {
      optimalSettings.chunkSize = 2 * 1024 * 1024;
    } else if (memory <= 2) {
      optimalSettings.chunkSize = 512 * 1024;
    }
    return optimalSettings;
  };
  const applyOptimalSettings = () => {
    const optimal = detectOptimalSettings();
    settings.value = optimal;
    console.log("Applied optimal performance settings:", optimal);
  };
  const metrics = ref({
    averageDownloadSpeed: 0,
    averageConversionTime: 0,
    successRate: 0,
    totalDownloads: 0,
    failedDownloads: 0
  });
  const updateMetrics = (downloadSpeed, conversionTime, success) => {
    const validDownloadSpeed = isNaN(downloadSpeed) || downloadSpeed < 0 ? 0 : downloadSpeed;
    const validConversionTime = isNaN(conversionTime) || conversionTime < 0 ? 0 : conversionTime;
    metrics.value.totalDownloads++;
    if (!success) {
      metrics.value.failedDownloads++;
    }
    const total = metrics.value.totalDownloads;
    if (total > 0) {
      metrics.value.averageDownloadSpeed = (metrics.value.averageDownloadSpeed * (total - 1) + validDownloadSpeed) / total;
      metrics.value.averageConversionTime = (metrics.value.averageConversionTime * (total - 1) + validConversionTime) / total;
      metrics.value.successRate = (total - metrics.value.failedDownloads) / total * 100;
    }
    if (isNaN(metrics.value.averageDownloadSpeed)) {
      metrics.value.averageDownloadSpeed = 0;
    }
    if (isNaN(metrics.value.averageConversionTime)) {
      metrics.value.averageConversionTime = 0;
    }
    if (isNaN(metrics.value.successRate)) {
      metrics.value.successRate = 0;
    }
  };
  const getRecommendations = computed(() => {
    const recommendations = [];
    if (metrics.value.successRate < 80) {
      recommendations.push("Consider reducing concurrent downloads for better stability");
    }
    if (metrics.value.averageConversionTime > 3e4) {
      recommendations.push("Try using a faster compression preset");
    }
    if (metrics.value.averageDownloadSpeed < 1e5) {
      recommendations.push("Check your internet connection or reduce audio quality");
    }
    return recommendations;
  });
  return {
    settings: readonly(settings),
    metrics: readonly(metrics),
    recommendations: getRecommendations,
    detectOptimalSettings,
    applyOptimalSettings,
    updateMetrics,
    updateSettings: (newSettings) => {
      settings.value = { ...settings.value, ...newSettings };
    }
  };
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "PerformanceDashboard",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      settings,
      metrics,
      recommendations
    } = useDownloadPerformance();
    const expanded = ref(false);
    const localSettings = ref({
      maxConcurrentDownloads: 3,
      enableMultiThreading: true,
      compressionPreset: "fast",
      audioQuality: "320k",
      chunkSize: 1024 * 1024
    });
    const successRate = computed(() => {
      const rate = metrics.successRate;
      if (!rate || isNaN(rate)) {
        return 0;
      }
      return Math.round(rate);
    });
    const successRateColor = computed(() => {
      const rate = successRate.value;
      if (rate >= 90) return "text-green-400";
      if (rate >= 70) return "text-yellow-400";
      return "text-red-400";
    });
    const avgSpeed = computed(() => {
      const speed = metrics.averageDownloadSpeed;
      if (!speed || speed === 0 || isNaN(speed)) {
        return "0 B/s";
      }
      if (speed > 1024 * 1024) {
        return `${Math.round(speed / (1024 * 1024))}MB/s`;
      } else if (speed > 1024) {
        return `${Math.round(speed / 1024)}KB/s`;
      }
      return `${Math.round(speed)}B/s`;
    });
    const avgConversionTime = computed(() => {
      const time = metrics.averageConversionTime;
      if (!time || isNaN(time)) {
        return 0;
      }
      return Math.round(time / 1e3);
    });
    watch(settings, (newSettings) => {
      if (newSettings) {
        localSettings.value = { ...newSettings };
      }
    }, { deep: true, immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-gray-800/50 rounded-lg p-4 border border-gray-700/50" }, _attrs))} data-v-66a54301><div class="flex items-center justify-between mb-4" data-v-66a54301><h3 class="text-lg font-semibold text-gray-200 flex items-center gap-2" data-v-66a54301><svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-66a54301><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-v-66a54301></path></svg> Performance Dashboard </h3><button class="p-1 text-gray-400 hover:text-gray-200 transition-colors"${ssrRenderAttr("aria-label", expanded.value ? "Collapse dashboard" : "Expand dashboard")} data-v-66a54301><svg class="${ssrRenderClass([{ "rotate-180": expanded.value }, "w-4 h-4 transition-transform"])}" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-66a54301><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-66a54301></path></svg></button></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4" data-v-66a54301><div class="bg-gray-900/50 rounded-lg p-3 text-center" data-v-66a54301><div class="text-sm text-gray-400" data-v-66a54301>Concurrent</div><div class="text-lg font-bold text-blue-400" data-v-66a54301>${ssrInterpolate(((_a = unref(settings)) == null ? void 0 : _a.maxConcurrentDownloads) || 3)}</div></div><div class="bg-gray-900/50 rounded-lg p-3 text-center" data-v-66a54301><div class="text-sm text-gray-400" data-v-66a54301>Success Rate</div><div class="${ssrRenderClass([successRateColor.value, "text-lg font-bold"])}" data-v-66a54301>${ssrInterpolate(successRate.value)}%</div></div><div class="bg-gray-900/50 rounded-lg p-3 text-center" data-v-66a54301><div class="text-sm text-gray-400" data-v-66a54301>Avg Speed</div><div class="text-lg font-bold text-green-400" data-v-66a54301>${ssrInterpolate(avgSpeed.value)}</div></div><div class="bg-gray-900/50 rounded-lg p-3 text-center" data-v-66a54301><div class="text-sm text-gray-400" data-v-66a54301>Threading</div><div class="${ssrRenderClass([((_b = unref(settings)) == null ? void 0 : _b.enableMultiThreading) ? "text-green-400" : "text-gray-400", "text-lg font-bold"])}" data-v-66a54301>${ssrInterpolate(((_c = unref(settings)) == null ? void 0 : _c.enableMultiThreading) ? "ON" : "OFF")}</div></div></div>`);
      if (expanded.value) {
        _push(`<div class="space-y-4" data-v-66a54301><div class="bg-gray-900/30 rounded-lg p-4" data-v-66a54301><h4 class="text-md font-medium text-gray-200 mb-3" data-v-66a54301>Performance Settings</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-66a54301><div data-v-66a54301><label class="block text-sm text-gray-400 mb-2" data-v-66a54301>Concurrent Downloads</label><select class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200" data-v-66a54301><option value="1" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.maxConcurrentDownloads) ? ssrLooseContain(localSettings.value.maxConcurrentDownloads, "1") : ssrLooseEqual(localSettings.value.maxConcurrentDownloads, "1")) ? " selected" : ""}>1 (Conservative)</option><option value="2" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.maxConcurrentDownloads) ? ssrLooseContain(localSettings.value.maxConcurrentDownloads, "2") : ssrLooseEqual(localSettings.value.maxConcurrentDownloads, "2")) ? " selected" : ""}>2 (Balanced)</option><option value="3" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.maxConcurrentDownloads) ? ssrLooseContain(localSettings.value.maxConcurrentDownloads, "3") : ssrLooseEqual(localSettings.value.maxConcurrentDownloads, "3")) ? " selected" : ""}>3 (Recommended)</option><option value="4" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.maxConcurrentDownloads) ? ssrLooseContain(localSettings.value.maxConcurrentDownloads, "4") : ssrLooseEqual(localSettings.value.maxConcurrentDownloads, "4")) ? " selected" : ""}>4 (Aggressive)</option><option value="5" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.maxConcurrentDownloads) ? ssrLooseContain(localSettings.value.maxConcurrentDownloads, "5") : ssrLooseEqual(localSettings.value.maxConcurrentDownloads, "5")) ? " selected" : ""}>5 (Maximum)</option></select></div><div data-v-66a54301><label class="block text-sm text-gray-400 mb-2" data-v-66a54301>Audio Quality</label><select class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200" data-v-66a54301><option value="128k" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.audioQuality) ? ssrLooseContain(localSettings.value.audioQuality, "128k") : ssrLooseEqual(localSettings.value.audioQuality, "128k")) ? " selected" : ""}>128k (Fast)</option><option value="192k" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.audioQuality) ? ssrLooseContain(localSettings.value.audioQuality, "192k") : ssrLooseEqual(localSettings.value.audioQuality, "192k")) ? " selected" : ""}>192k (Good)</option><option value="256k" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.audioQuality) ? ssrLooseContain(localSettings.value.audioQuality, "256k") : ssrLooseEqual(localSettings.value.audioQuality, "256k")) ? " selected" : ""}>256k (High)</option><option value="320k" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.audioQuality) ? ssrLooseContain(localSettings.value.audioQuality, "320k") : ssrLooseEqual(localSettings.value.audioQuality, "320k")) ? " selected" : ""}>320k (Maximum)</option></select></div><div data-v-66a54301><label class="block text-sm text-gray-400 mb-2" data-v-66a54301>Compression Preset</label><select class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200" data-v-66a54301><option value="ultrafast" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.compressionPreset) ? ssrLooseContain(localSettings.value.compressionPreset, "ultrafast") : ssrLooseEqual(localSettings.value.compressionPreset, "ultrafast")) ? " selected" : ""}>Ultra Fast</option><option value="fast" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.compressionPreset) ? ssrLooseContain(localSettings.value.compressionPreset, "fast") : ssrLooseEqual(localSettings.value.compressionPreset, "fast")) ? " selected" : ""}>Fast (Recommended)</option><option value="medium" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.compressionPreset) ? ssrLooseContain(localSettings.value.compressionPreset, "medium") : ssrLooseEqual(localSettings.value.compressionPreset, "medium")) ? " selected" : ""}>Medium</option><option value="slow" data-v-66a54301${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.compressionPreset) ? ssrLooseContain(localSettings.value.compressionPreset, "slow") : ssrLooseEqual(localSettings.value.compressionPreset, "slow")) ? " selected" : ""}>Slow (Best Quality)</option></select></div><div class="flex items-center" data-v-66a54301><label class="flex items-center cursor-pointer" data-v-66a54301><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(localSettings.value.enableMultiThreading) ? ssrLooseContain(localSettings.value.enableMultiThreading, null) : localSettings.value.enableMultiThreading) ? " checked" : ""} class="sr-only" data-v-66a54301><div class="relative" data-v-66a54301><div class="${ssrRenderClass([{ "bg-blue-500": localSettings.value.enableMultiThreading }, "w-10 h-6 bg-gray-600 rounded-full shadow-inner transition-colors"])}" data-v-66a54301></div><div class="${ssrRenderClass([{ "translate-x-4": localSettings.value.enableMultiThreading }, "absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform"])}" data-v-66a54301></div></div><span class="ml-3 text-sm text-gray-300" data-v-66a54301>Multi-threading</span></label></div></div></div><div class="bg-gray-900/30 rounded-lg p-4" data-v-66a54301><h4 class="text-md font-medium text-gray-200 mb-3" data-v-66a54301>Performance Metrics</h4><div class="grid grid-cols-1 md:grid-cols-3 gap-4" data-v-66a54301><div data-v-66a54301><div class="text-sm text-gray-400" data-v-66a54301>Total Downloads</div><div class="text-xl font-bold text-gray-200" data-v-66a54301>${ssrInterpolate(unref(metrics).totalDownloads)}</div></div><div data-v-66a54301><div class="text-sm text-gray-400" data-v-66a54301>Average Conversion Time</div><div class="text-xl font-bold text-yellow-400" data-v-66a54301>${ssrInterpolate(avgConversionTime.value)}s</div></div><div data-v-66a54301><div class="text-sm text-gray-400" data-v-66a54301>Failed Downloads</div><div class="text-xl font-bold text-red-400" data-v-66a54301>${ssrInterpolate(unref(metrics).failedDownloads)}</div></div></div></div>`);
        if (unref(recommendations).length > 0) {
          _push(`<div class="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4" data-v-66a54301><h4 class="text-md font-medium text-yellow-400 mb-2 flex items-center gap-2" data-v-66a54301><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-66a54301><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" data-v-66a54301></path></svg> Performance Recommendations </h4><ul class="space-y-1" data-v-66a54301><!--[-->`);
          ssrRenderList(unref(recommendations), (recommendation) => {
            _push(`<li class="text-sm text-yellow-300 flex items-start gap-2" data-v-66a54301><span class="text-yellow-500 mt-1" data-v-66a54301>\u2022</span> ${ssrInterpolate(recommendation)}</li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-center" data-v-66a54301><button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2" data-v-66a54301><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-66a54301><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-v-66a54301></path></svg> Auto-Optimize Settings </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PerformanceDashboard.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-66a54301"]]);
function validateAudioFormat(data) {
  const isMP3 = data[0] === 255 && (data[1] & 224) === 224;
  const isM4A = data[4] === 102 && // f
  data[5] === 116 && // t
  data[6] === 121 && // y
  data[7] === 112;
  return { isMP3, isM4A };
}
function validateMP3Output(data) {
  if (data.length === 0) {
    return false;
  }
  const hasID3 = data[0] === 73 && data[1] === 68 && data[2] === 51;
  let offset = 0;
  if (hasID3) {
    const id3Size = (data[6] & 127) << 21 | (data[7] & 127) << 14 | (data[8] & 127) << 7 | data[9] & 127;
    offset = id3Size + 10;
  }
  return data[offset] === 255 && (data[offset + 1] & 224) === 224 || data[offset] === 255 && data[offset + 1] === 251;
}
const useAudioProcessor = () => {
  const ffmpeg = ref();
  const isLoadingFFmpeg = ref(false);
  const { settings: performanceSettings } = useDownloadPerformance();
  const initFFmpeg = async () => {
    {
      throw new Error("FFmpeg can only be initialized on the client side");
    }
  };
  const MAX_INPUT_SIZE = 100 * 1024 * 1024;
  const reinitializeFFmpeg = async () => {
    console.log("Reinitializing FFmpeg due to error...");
    if (ffmpeg.value) {
      try {
        await Promise.race([
          Promise.all([
            ffmpeg.value.deleteFile("input.audio").catch(() => {
            }),
            ffmpeg.value.deleteFile("output.mp3").catch(() => {
            })
          ]),
          new Promise((resolve) => setTimeout(resolve, 1e3))
        ]);
      } catch (cleanupError) {
        console.warn("Cleanup during reinitialization failed:", cleanupError);
      }
    }
    ffmpeg.value = void 0;
    isLoadingFFmpeg.value = false;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await initFFmpeg();
  };
  const convertToMp3 = async (inputData) => {
    console.log("Starting audio conversion, input size:", inputData.length);
    let retryCount = 0;
    const maxRetries = 2;
    while (retryCount <= maxRetries) {
      try {
        if (inputData.length > MAX_INPUT_SIZE) {
          throw new Error("Input file too large (max 100MB)");
        }
        console.log("Initializing FFmpeg...");
        await initFFmpeg();
        if (!ffmpeg.value) {
          throw new Error("FFmpeg not initialized");
        }
        if (typeof ffmpeg.value.exec !== "function") {
          throw new Error("FFmpeg not properly loaded - missing exec function");
        }
        console.log("FFmpeg initialized successfully, writing input file...");
        const { isMP3, isM4A } = validateAudioFormat(inputData);
        console.log("Input format:", isMP3 ? "MP3" : isM4A ? "M4A" : "Unknown");
        if (!isMP3 && !isM4A) {
          throw new Error("Unsupported input format - not MP3 or M4A");
        }
        try {
          await ffmpeg.value.deleteFile("input.audio");
          await ffmpeg.value.deleteFile("output.mp3");
        } catch (cleanupError) {
          console.log("Cleanup before conversion (expected):", cleanupError);
        }
        try {
          await ffmpeg.value.writeFile("input.audio", inputData);
          console.log("Input file written successfully");
        } catch (writeError) {
          console.error("Failed to write input file:", writeError);
          throw new Error("Failed to write input file to FFmpeg filesystem");
        }
        console.log("Starting MP3 conversion...");
        const ffmpegArgs = [
          "-i",
          "input.audio",
          "-acodec",
          "libmp3lame",
          // Explicitly set audio codec
          "-ar",
          "44100",
          // Set sample rate
          "-ac",
          "2",
          // Set to stereo
          "-b:a",
          performanceSettings.value.audioQuality,
          // Use dynamic bitrate
          "-f",
          "mp3",
          // Force MP3 format
          "-y",
          // Overwrite output
          "output.mp3"
        ];
        console.log("FFmpeg command:", ffmpegArgs.join(" "));
        const REDUCED_TIMEOUT = 60 * 1e3;
        const conversionPromise = ffmpeg.value.exec(ffmpegArgs);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Conversion timeout (1 minute)")), REDUCED_TIMEOUT);
        });
        try {
          console.log("Executing FFmpeg conversion command...");
          await Promise.race([conversionPromise, timeoutPromise]);
          console.log("FFmpeg conversion completed successfully");
        } catch (error) {
          console.error("Conversion error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          if (errorMessage.includes("FS error") || errorMessage.includes("ErrnoError")) {
            throw new Error("FFmpeg filesystem error - try refreshing the page and trying again");
          }
          throw new Error(`Conversion failed: ${errorMessage}`);
        }
        console.log("Reading output file from FFmpeg...");
        let data;
        try {
          const fileData = await ffmpeg.value.readFile("output.mp3");
          if (!(fileData instanceof Uint8Array)) {
            throw new Error("Output file is not Uint8Array");
          }
          data = fileData;
          console.log("Output file read, size:", data.length);
        } catch (readError) {
          console.error("Failed to read output file:", readError);
          throw new Error("Failed to read converted file from FFmpeg filesystem");
        }
        if (!(data instanceof Uint8Array)) {
          console.error("Output is not Uint8Array:", typeof data);
          throw new Error("Invalid output type");
        }
        if (data.length === 0) {
          console.error("Output file is empty");
          throw new Error("Empty output file");
        }
        console.log("Output file first bytes:", Array.from(data.slice(0, 4)).map((b) => b.toString(16).padStart(2, "0")).join(" "));
        if (!validateMP3Output(data)) {
          throw new Error("Invalid MP3 format: No valid MP3 frame found");
        }
        console.log("MP3 validation successful, creating blob...");
        const blob = new Blob([data], { type: "audio/mpeg" });
        console.log("Blob created successfully, size:", blob.size);
        return blob;
      } catch (error) {
        console.error(`Error converting to MP3 (attempt ${retryCount + 1}):`, error);
        let errorMessage = "Unknown error during conversion";
        let shouldRetry = false;
        if (error instanceof Error) {
          const errorStr = error.toString().toLowerCase();
          const messageStr = error.message.toLowerCase();
          if (errorStr.includes("fs error") || errorStr.includes("errnoerror") || messageStr.includes("fs error") || messageStr.includes("errnoerror") || errorStr.includes("filesystem") || messageStr.includes("filesystem")) {
            errorMessage = "FFmpeg filesystem error";
            shouldRetry = retryCount < maxRetries;
            console.log(`Filesystem error detected, shouldRetry: ${shouldRetry}, retryCount: ${retryCount}`);
          } else if (messageStr.includes("timeout")) {
            errorMessage = "Conversion took too long";
          } else if (messageStr.includes("ebml")) {
            errorMessage = "Invalid input format";
          } else if (messageStr.includes("too large")) {
            errorMessage = "File too large";
          } else {
            errorMessage = error.message;
            if (retryCount < maxRetries) {
              shouldRetry = true;
              console.log(`Unknown error, attempting retry: ${error.message}`);
            }
          }
        } else {
          errorMessage = String(error);
          if (retryCount < maxRetries) {
            shouldRetry = true;
            console.log(`Non-Error object, attempting retry: ${errorMessage}`);
          }
        }
        try {
          if (ffmpeg.value) {
            await Promise.race([
              Promise.all([
                ffmpeg.value.deleteFile("input.audio"),
                ffmpeg.value.deleteFile("output.mp3")
              ]),
              new Promise((r) => setTimeout(r, 2e3))
              // 2s timeout for cleanup
            ]);
          }
        } catch (cleanupError) {
          console.warn("Cleanup error:", cleanupError);
        }
        if (shouldRetry) {
          retryCount++;
          console.log(`Retrying conversion (${retryCount}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          try {
            await reinitializeFFmpeg();
            console.log("FFmpeg reinitialized successfully for retry");
          } catch (reinitError) {
            console.error("Failed to reinitialize FFmpeg:", reinitError);
            throw new Error("Failed to reinitialize FFmpeg for retry");
          }
          continue;
        } else {
          throw new Error("Failed to convert audio: " + errorMessage);
        }
      }
    }
    throw new Error("Failed to convert audio after all retries");
  };
  return {
    isLoadingFFmpeg,
    convertToMp3
  };
};
const useDownloadQueueStore = defineStore("downloadQueue", {
  state: () => ({
    queue: {}
  }),
  getters: {
    queueItems: (state) => Object.values(state.queue),
    hasActiveDownloads: (state) => Object.values(state.queue).some(
      (item) => ["downloading", "converting"].includes(item.status)
    ),
    activeCount: (state) => Object.values(state.queue).filter(
      (item) => ["downloading", "converting"].includes(item.status)
    ).length,
    hasCompletedDownloads: (state) => Object.values(state.queue).some((item) => item.status === "completed"),
    queuedItems: (state) => Object.values(state.queue).filter((item) => item.status === "queued")
  },
  actions: {
    addToQueue(track) {
      const trackId = track.id.toString();
      if (this.queue[trackId] && this.queue[trackId].status !== "error") {
        return;
      }
      this.queue[trackId] = {
        track,
        status: "queued",
        progress: 0,
        error: void 0
      };
    },
    removeFromQueue(trackId) {
      var _a;
      if (((_a = this.queue[trackId]) == null ? void 0 : _a.status) === "queued") {
        const { [trackId]: removed, ...rest } = this.queue;
        this.queue = rest;
      }
    },
    clearCompleted() {
      this.queue = Object.entries(this.queue).reduce((acc, [id, item]) => {
        if (item.status !== "completed") {
          acc[id] = item;
        }
        return acc;
      }, {});
    },
    updateTrackProgress(trackId, progress) {
      if (this.queue[trackId]) {
        this.queue[trackId] = {
          ...this.queue[trackId],
          progress
        };
      }
    },
    updateTrackStatus(trackId, status, error) {
      if (this.queue[trackId]) {
        this.queue[trackId] = {
          ...this.queue[trackId],
          status,
          error
        };
      }
    },
    // Cancel and clear all queued and active downloads
    discardAll() {
      this.queue = {};
    }
  }
});
useAudioProcessor();
useDownloadPerformance();
const activeDownloads = /* @__PURE__ */ new Map();
ref(0);
const useDownloadQueue = () => {
  const store = useDownloadQueueStore();
  const getTrackId = (id) => id.toString();
  const retryDownload = async (trackId) => {
    const queueItem = store.queue[trackId];
    if (!queueItem || !["error", "retry"].includes(queueItem.status)) return;
    store.updateTrackStatus(trackId, "queued");
    store.updateTrackProgress(trackId, 0);
    await startDownload();
  };
  const queueItems = computed(() => store.queueItems);
  const hasActiveDownloads = computed(() => store.hasActiveDownloads);
  const activeCount = computed(() => store.activeCount);
  const hasCompletedDownloads = computed(() => store.hasCompletedDownloads);
  const addToQueue = (track) => {
    store.addToQueue(track);
  };
  const removeFromQueue = (trackId) => {
    store.removeFromQueue(getTrackId(trackId));
  };
  const clearCompleted = () => {
    store.clearCompleted();
  };
  const discardAll = () => {
    activeDownloads.forEach((controller, trackId) => {
      controller.abort();
    });
    activeDownloads.clear();
    store.discardAll();
  };
  const startDownload = async (trackId) => {
    {
      console.warn("startDownload can only be called on the client side");
      return;
    }
  };
  const startAllDownloads = async () => {
    {
      console.warn("startAllDownloads can only be called on the client side");
      return;
    }
  };
  return {
    retryDownload,
    queueItems,
    hasActiveDownloads,
    activeCount,
    hasCompletedDownloads,
    addToQueue,
    removeFromQueue,
    clearCompleted,
    discardAll,
    startDownload,
    startAllDownloads
  };
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "DownloadQueue",
  __ssrInlineRender: true,
  emits: ["close", "download-complete", "discard-all"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const downloadQueueStore = useDownloadQueueStore();
    useUIStore();
    const {
      addToQueue
    } = useDownloadQueue();
    const storeQueueItems = computed(() => downloadQueueStore.queueItems);
    const downloadStats = computed(() => {
      const stats = storeQueueItems.value.reduce((acc, item) => {
        if (item.status === "queued") acc.queued++;
        else if (["downloading", "converting"].includes(item.status)) acc.active++;
        else if (item.status === "completed") acc.completed++;
        else if (item.status === "error") acc.failed++;
        return acc;
      }, { queued: 0, active: 0, completed: 0, failed: 0, total: 0 });
      stats.total = storeQueueItems.value.length;
      return stats;
    });
    const getStatusText = (item) => {
      switch (item.status) {
        case "queued":
          return "Queued";
        case "downloading":
          return "Downloading...";
        case "converting":
          return "Converting...";
        case "completed":
          return "Completed";
        case "error":
          return item.error || "Error";
        default:
          return item.status;
      }
    };
    __expose({
      addToQueue
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PerformanceDashboard = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full flex flex-col" }, _attrs))} data-v-23401061><div class="border-b border-gray-700/50" data-v-23401061>`);
      _push(ssrRenderComponent(_component_PerformanceDashboard, null, null, _parent));
      _push(`</div>`);
      if (downloadStats.value.queued > 0) {
        _push(`<div class="p-4 bg-gray-800/30 border-b border-gray-700/50" data-v-23401061><button${ssrIncludeBooleanAttr(downloadStats.value.active > 0) ? " disabled" : ""} class="${ssrRenderClass([downloadStats.value.active > 0 ? "bg-gray-700/50 text-gray-400 cursor-not-allowed" : "bg-orange-600 text-white hover:bg-orange-700", "w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors"])}" data-v-23401061><svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" data-v-23401061></path></svg> Start All Downloads (${ssrInterpolate(downloadStats.value.queued)}) </button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (downloadStats.value.total > 0) {
        _push(`<div class="p-4 border-b border-gray-700/50 flex items-center justify-between" data-v-23401061><div class="flex items-center space-x-2" data-v-23401061>`);
        if (downloadStats.value.completed > 0) {
          _push(`<button class="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded transition-colors" title="Clear completed downloads" data-v-23401061> Clear completed </button>`);
        } else {
          _push(`<!---->`);
        }
        if (downloadStats.value.failed > 0) {
          _push(`<button class="flex items-center space-x-1 px-3 py-1.5 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 rounded transition-colors font-medium" title="Retry all failed downloads" data-v-23401061><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" data-v-23401061></path></svg><span data-v-23401061>Retry Failed</span></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button class="flex items-center space-x-1 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors font-medium" title="Stop all downloads and clear queue" data-v-23401061><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-23401061></path></svg><span data-v-23401061>Discard All</span></button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex-1 overflow-y-auto min-h-0" data-v-23401061>`);
      if (storeQueueItems.value.length === 0) {
        _push(`<div class="flex flex-col items-center justify-center h-full text-gray-400 p-8" data-v-23401061><div class="bg-gray-800/50 rounded-full p-4 mb-4" data-v-23401061><svg class="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" data-v-23401061></path></svg></div><p class="text-base font-medium" data-v-23401061>Queue is empty</p><p class="text-sm text-gray-500 mt-1 text-center" data-v-23401061>Add tracks from the playlist to download them</p></div>`);
      } else {
        _push(`<div class="divide-y divide-gray-700/30" data-v-23401061><!--[-->`);
        ssrRenderList(storeQueueItems.value, (item) => {
          _push(`<div class="p-4 hover:bg-gray-800/30 transition-colors" data-v-23401061><div class="flex items-start space-x-3" data-v-23401061><div class="w-10 h-10 bg-gray-800/50 rounded-lg flex-shrink-0 flex items-center justify-center" data-v-23401061><svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" data-v-23401061></path></svg></div><div class="flex-1 min-w-0" data-v-23401061><div class="flex items-center justify-between" data-v-23401061><div class="min-w-0 flex-1 mr-4" data-v-23401061><h4 class="font-medium text-gray-200 text-sm max-w-[200px] truncate" data-v-23401061>${ssrInterpolate(item.track.title)}</h4><p class="text-xs text-gray-400 truncate" data-v-23401061>${ssrInterpolate(item.track.artist)}</p></div><div class="flex items-center space-x-2 flex-shrink-0" data-v-23401061>`);
          if (item.status === "queued") {
            _push(`<button${ssrIncludeBooleanAttr(downloadStats.value.active > 0) ? " disabled" : ""} class="${ssrRenderClass([downloadStats.value.active > 0 ? "bg-gray-700/50 text-gray-400 cursor-not-allowed" : "bg-orange-600 text-white hover:bg-orange-700", "flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"])}" title="Start download" data-v-23401061><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" data-v-23401061></path></svg><span data-v-23401061>Start</span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (item.status === "queued") {
            _push(`<button class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors" title="Remove from queue" data-v-23401061><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-23401061></path></svg></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="mt-2" data-v-23401061>`);
          if (["downloading", "converting"].includes(item.status)) {
            _push(`<div class="space-y-2" data-v-23401061><div class="flex items-center justify-between text-xs" data-v-23401061><div class="flex items-center space-x-2" data-v-23401061><span class="${ssrRenderClass([{
              "text-blue-400": item.status === "downloading",
              "text-green-400": item.status === "converting"
            }, "flex items-center"])}" data-v-23401061>`);
            if (item.status === "downloading") {
              _push(`<svg class="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" data-v-23401061><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-23401061></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-23401061></path></svg>`);
            } else if (item.status === "converting") {
              _push(`<svg class="w-4 h-4 mr-1 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" data-v-23401061></path></svg>`);
            } else {
              _push(`<!---->`);
            }
            _push(` ${ssrInterpolate(getStatusText(item))}</span><span class="${ssrRenderClass([{
              "bg-blue-900/50 text-blue-300": item.status === "downloading",
              "bg-green-900/50 text-green-300": item.status === "converting"
            }, "px-2 py-0.5 rounded-full text-xs"])}" data-v-23401061>${ssrInterpolate(item.progress)}% </span></div></div><div class="w-full bg-gray-700/50 rounded-full h-2" data-v-23401061><div class="${ssrRenderClass([{
              "bg-blue-500": item.status === "downloading",
              "bg-green-500": item.status === "converting"
            }, "h-2 rounded-full transition-all duration-300"])}" style="${ssrRenderStyle({ width: `${item.progress}%` })}" data-v-23401061></div></div></div>`);
          } else if (item.status === "completed") {
            _push(`<div class="flex items-center text-sm text-green-400 mt-1 bg-green-900/20 px-3 py-1.5 rounded-lg" data-v-23401061><svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-v-23401061></path></svg> Download Completed </div>`);
          } else if (item.status === "error") {
            _push(`<div class="flex items-center justify-between text-sm text-red-400 bg-red-900/20 px-3 py-1.5 rounded-lg mt-1" data-v-23401061><div class="flex items-center flex-1 min-w-0" data-v-23401061><svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-23401061></path></svg><span class="truncate" data-v-23401061>${ssrInterpolate(item.error)}</span></div><button class="ml-2 px-2 py-1 text-xs bg-red-800/50 hover:bg-red-800/70 text-red-300 rounded transition-colors flex-shrink-0" title="Retry download" data-v-23401061> Retry </button></div>`);
          } else {
            _push(`<div class="text-sm text-gray-400 mt-1 flex items-center" data-v-23401061><svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-23401061><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-v-23401061></path></svg> ${ssrInterpolate(getStatusText(item))}</div>`);
          }
          _push(`</div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DownloadQueue.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-23401061"]]);
const _sfc_main$1 = /* @__PURE__ */ Object.assign({
  name: "NuxtErrorBoundary",
  inheritAttrs: false
}, {
  __name: "nuxt-error-boundary",
  __ssrInlineRender: true,
  emits: ["error"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const error = shallowRef(null);
    function clearError() {
      error.value = null;
    }
    __expose({ error, clearError });
    return (_ctx, _push, _parent, _attrs) => {
      if (error.value) {
        ssrRenderSlot(_ctx.$slots, "error", { error: error.value, clearError }, null, _push, _parent);
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const handleError = (error) => {
      console.error("Layout error:", error);
    };
    const uiStore = useUIStore();
    const downloadQueueStore = useDownloadQueueStore();
    const logsStore = useLogsStore();
    const downloadQueueRef = ref();
    const downloadingTracks = ref([]);
    const errorTracks = ref({});
    const downloadStats = computed(() => {
      const items = downloadQueueStore.queueItems;
      const stats = {
        total: items.length,
        queued: 0,
        active: 0,
        completed: 0,
        activeProgress: 0
      };
      let totalProgress = 0;
      let activeCount = 0;
      for (const item of items) {
        switch (item.status) {
          case "queued":
            stats.queued++;
            break;
          case "downloading":
          case "converting":
            stats.active++;
            totalProgress += item.progress;
            activeCount++;
            break;
          case "completed":
            stats.completed++;
            break;
        }
      }
      if (activeCount > 0) {
        stats.activeProgress = Math.round(totalProgress / activeCount);
      }
      return stats;
    });
    const logStats = computed(() => logsStore.logStats);
    const toggleDownloadQueue = () => {
      uiStore.showDownloadQueue = !uiStore.showDownloadQueue;
    };
    const toggleLogsPanel = () => {
      uiStore.toggleLogsPanel();
    };
    const handleDownloadTrack = async (track) => {
      var _a;
      try {
        console.log("Adding track to queue:", track.title);
        const trackId = String(track.id);
        if (!downloadingTracks.value.includes(trackId)) {
          downloadingTracks.value.push(trackId);
        }
        downloadQueueStore.addToQueue(track);
        await nextTick();
        if ((_a = downloadQueueRef.value) == null ? void 0 : _a.addToQueue) {
          downloadQueueRef.value.addToQueue(track);
        } else {
          console.warn("downloadQueueRef is not available");
        }
        if (!uiStore.showDownloadQueue) {
          uiStore.showDownloadQueue = true;
        }
      } catch (error) {
        console.error("Error handling download track:", error);
        errorTracks.value[String(track.id)] = "Failed to add to download queue";
      }
    };
    const handleDownloadComplete = (trackId) => {
      const index = downloadingTracks.value.indexOf(trackId);
      if (index > -1) {
        downloadingTracks.value.splice(index, 1);
      }
      delete errorTracks.value[trackId];
    };
    const handleDiscardAll = () => {
      downloadingTracks.value.length = 0;
      Object.keys(errorTracks.value).forEach((key) => delete errorTracks.value[key]);
    };
    provide("handleDownloadTrack", handleDownloadTrack);
    provide("downloadingTracks", downloadingTracks);
    provide("errorTracks", errorTracks);
    useHead({
      titleTemplate: "%s - SoundCloud DL",
      meta: [
        { name: "description", content: "Download SoundCloud playlists and tracks easily" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#1f2937" }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UApp = _sfc_main$5;
      const _component_LogsPanel = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_DownloadQueue = __nuxt_component_3;
      const _component_NuxtErrorBoundary = _sfc_main$1;
      _push(ssrRenderComponent(_component_UApp, mergeProps({ class: "dark" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex overflow-hidden"${_scopeId}>`);
            if (unref(uiStore).showLogsPanel) {
              _push2(`<aside class="w-full sm:w-80 bg-gray-900/50 border-r border-gray-700/50 flex-shrink-0 flex flex-col fixed sm:relative inset-0 sm:inset-auto z-50 sm:z-auto h-full" role="complementary" aria-label="Activity logs"${_scopeId}><div class="sm:hidden p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0"${_scopeId}><div class="flex items-center gap-3"${_scopeId}><svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"${_scopeId}></path></svg><h2 class="text-lg font-semibold text-gray-200"${_scopeId}>Activity Logs</h2>`);
              if (logStats.value.total > 0) {
                _push2(`<span class="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full"${_scopeId}>${ssrInterpolate(logStats.value.total)}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><button class="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800/50" aria-label="Close logs panel"${_scopeId}><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"${_scopeId}></path></svg></button></div><div class="flex-1 overflow-hidden min-h-0"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_LogsPanel, { onClose: toggleLogsPanel }, null, _parent2, _scopeId));
              _push2(`</div></aside>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="flex-1 flex flex-col min-w-0 h-full"${_scopeId}><header class="backdrop-blur-md bg-gray-900/80 border-b border-gray-700/50 flex-shrink-0 z-40"${_scopeId}><div class="px-4 lg:px-6 h-16 flex items-center justify-between"${_scopeId}><div class="flex items-center gap-4 lg:gap-8"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/",
              class: "flex items-center gap-3 hover:scale-105 transition-transform"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-6 h-6 lg:w-7 lg:h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor"${_scopeId2}><path d="M11.5 0c-6.347 0-11.5 5.153-11.5 11.5 0 6.346 5.153 11.5 11.5 11.5 6.346 0 11.5-5.154 11.5-11.5 0-6.347-5.154-11.5-11.5-11.5zm0 21c-5.243 0-9.5-4.257-9.5-9.5s4.257-9.5 9.5-9.5 9.5 4.257 9.5 9.5-4.257 9.5-9.5 9.5z"${_scopeId2}></path></svg><h1 class="text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"${_scopeId2}> SoundCloud DL </h1>`);
                } else {
                  return [
                    (openBlock(), createBlock("svg", {
                      class: "w-6 h-6 lg:w-7 lg:h-7 text-orange-500",
                      viewBox: "0 0 24 24",
                      fill: "currentColor"
                    }, [
                      createVNode("path", { d: "M11.5 0c-6.347 0-11.5 5.153-11.5 11.5 0 6.346 5.153 11.5 11.5 11.5 6.346 0 11.5-5.154 11.5-11.5 0-6.347-5.154-11.5-11.5-11.5zm0 21c-5.243 0-9.5-4.257-9.5-9.5s4.257-9.5 9.5-9.5 9.5 4.257 9.5 9.5-4.257 9.5-9.5 9.5z" })
                    ])),
                    createVNode("h1", { class: "text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" }, " SoundCloud DL ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<nav class="hidden sm:flex items-center gap-4 lg:gap-6" role="navigation" aria-label="Main navigation"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/",
              class: "text-gray-400 hover:text-orange-500 transition-all text-sm font-medium relative group",
              "active-class": "text-orange-500",
              "aria-label": "Go to playlist page"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span${_scopeId2}>Playlist</span><span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"${_scopeId2}></span>`);
                } else {
                  return [
                    createVNode("span", null, "Playlist"),
                    createVNode("span", { class: "absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/track",
              class: "text-gray-400 hover:text-orange-500 transition-all text-sm font-medium relative group",
              "active-class": "text-orange-500",
              "aria-label": "Go to single track page"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span${_scopeId2}>Single Track</span><span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"${_scopeId2}></span>`);
                } else {
                  return [
                    createVNode("span", null, "Single Track"),
                    createVNode("span", { class: "absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</nav></div><div class="flex items-center gap-2 lg:gap-4"${_scopeId}><button class="${ssrRenderClass([{ "text-blue-500": unref(uiStore).showLogsPanel }, "relative p-2 text-gray-400 hover:text-blue-500 transition-all hover:scale-110 rounded-lg hover:bg-gray-800/50"])}" aria-label="Toggle activity logs"${_scopeId}><svg class="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"${_scopeId}></path></svg>`);
            if (logStats.value.total > 0) {
              _push2(`<span class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1" aria-hidden="true"${_scopeId}>${ssrInterpolate(logStats.value.total)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button><button class="${ssrRenderClass([{ "text-orange-500": unref(uiStore).showDownloadQueue }, "relative p-2 text-gray-400 hover:text-orange-500 transition-all hover:scale-110 rounded-lg hover:bg-gray-800/50"])}" aria-label="Toggle download queue"${_scopeId}><svg class="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"${_scopeId}></path></svg>`);
            if (downloadStats.value.total > 0) {
              _push2(`<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1" aria-hidden="true"${_scopeId}>${ssrInterpolate(downloadStats.value.total)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button><a href="https://github.com/truongnat/soundcloud-playlist.git" target="_blank" rel="noopener noreferrer" class="hidden sm:block text-gray-400 hover:text-orange-500 transition-all hover:scale-110 p-2 rounded-lg hover:bg-gray-800/50" aria-label="View source code on GitHub"${_scopeId}><svg class="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24"${_scopeId}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"${_scopeId}></path></svg></a></div></div></header><main class="flex-1 p-4 lg:p-6 overflow-y-auto min-w-0 min-h-0"${_scopeId}><div class="w-full"${_scopeId}>`);
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            _push2(`</div></main></div>`);
            if (unref(uiStore).showDownloadQueue) {
              _push2(`<aside class="w-full sm:w-[420px] bg-gray-900/50 border-l border-gray-700/50 flex-shrink-0 flex flex-col fixed sm:relative inset-0 sm:inset-auto z-50 sm:z-auto h-full" role="complementary" aria-label="Download queue"${_scopeId}><div class="sm:hidden p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0"${_scopeId}><div class="flex items-center gap-3"${_scopeId}><svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"${_scopeId}></path></svg><h2 class="text-lg font-semibold text-gray-200"${_scopeId}>Download Queue</h2>`);
              if (downloadStats.value.total > 0) {
                _push2(`<span class="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full"${_scopeId}>${ssrInterpolate(downloadStats.value.total)}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><button class="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800/50" aria-label="Close download queue"${_scopeId}><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"${_scopeId}></path></svg></button></div><div class="flex-1 overflow-hidden min-h-0"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_DownloadQueue, {
                ref_key: "downloadQueueRef",
                ref: downloadQueueRef,
                onClose: toggleDownloadQueue,
                onDownloadComplete: handleDownloadComplete,
                onDiscardAll: handleDiscardAll
              }, null, _parent2, _scopeId));
              _push2(`</div></aside>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(uiStore).showDownloadQueue) {
              _push2(`<div class="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" aria-hidden="true"${_scopeId}></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(uiStore).showLogsPanel) {
              _push2(`<div class="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" aria-hidden="true"${_scopeId}></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (downloadStats.value.total > 0 && !unref(uiStore).showDownloadQueue) {
              _push2(`<button class="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-3 lg:p-4 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 z-30"${ssrRenderAttr("aria-label", `${downloadStats.value.total} downloads in queue. Click to open download queue.`)}${_scopeId}><div class="relative"${_scopeId}><svg class="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"${_scopeId}></path></svg><span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5" aria-hidden="true"${_scopeId}>${ssrInterpolate(downloadStats.value.total)}</span>`);
              if (downloadStats.value.active > 0) {
                _push2(`<svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 32 32" aria-hidden="true"${_scopeId}><circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5" fill="none" class="opacity-30"${_scopeId}></circle><circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5" fill="none"${ssrRenderAttr("stroke-dasharray", 87.96)}${ssrRenderAttr("stroke-dashoffset", 87.96 - 87.96 * downloadStats.value.activeProgress / 100)} class="transition-all duration-300"${_scopeId}></circle></svg>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_NuxtErrorBoundary, { onError: handleError }, {
              error: withCtx(({ error, clearError }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="fixed inset-0 bg-gray-900 flex items-center justify-center z-50"${_scopeId2}><div class="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md mx-4"${_scopeId2}><h2 class="text-xl font-bold text-red-400 mb-4"${_scopeId2}>Something went wrong</h2><p class="text-gray-300 mb-4"${_scopeId2}>${ssrInterpolate(error.message || "An unexpected error occurred")}</p><div class="flex gap-3"${_scopeId2}><button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"${_scopeId2}> Try Again </button><button class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"${_scopeId2}> Go Home </button></div></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "fixed inset-0 bg-gray-900 flex items-center justify-center z-50" }, [
                      createVNode("div", { class: "bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md mx-4" }, [
                        createVNode("h2", { class: "text-xl font-bold text-red-400 mb-4" }, "Something went wrong"),
                        createVNode("p", { class: "text-gray-300 mb-4" }, toDisplayString(error.message || "An unexpected error occurred"), 1),
                        createVNode("div", { class: "flex gap-3" }, [
                          createVNode("button", {
                            onClick: clearError,
                            class: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          }, " Try Again ", 8, ["onClick"]),
                          createVNode("button", {
                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/"),
                            class: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                          }, " Go Home ", 8, ["onClick"])
                        ])
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex overflow-hidden" }, [
                createVNode(Transition, { name: "slide-left" }, {
                  default: withCtx(() => [
                    unref(uiStore).showLogsPanel ? (openBlock(), createBlock("aside", {
                      key: 0,
                      class: "w-full sm:w-80 bg-gray-900/50 border-r border-gray-700/50 flex-shrink-0 flex flex-col fixed sm:relative inset-0 sm:inset-auto z-50 sm:z-auto h-full",
                      role: "complementary",
                      "aria-label": "Activity logs"
                    }, [
                      createVNode("div", { class: "sm:hidden p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0" }, [
                        createVNode("div", { class: "flex items-center gap-3" }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5 text-blue-500",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            })
                          ])),
                          createVNode("h2", { class: "text-lg font-semibold text-gray-200" }, "Activity Logs"),
                          logStats.value.total > 0 ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full"
                          }, toDisplayString(logStats.value.total), 1)) : createCommentVNode("", true)
                        ]),
                        createVNode("button", {
                          onClick: toggleLogsPanel,
                          class: "p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800/50",
                          "aria-label": "Close logs panel"
                        }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M6 18L18 6M6 6l12 12"
                            })
                          ]))
                        ])
                      ]),
                      createVNode("div", { class: "flex-1 overflow-hidden min-h-0" }, [
                        createVNode(_component_LogsPanel, { onClose: toggleLogsPanel })
                      ])
                    ])) : createCommentVNode("", true)
                  ]),
                  _: 1
                }),
                createVNode("div", { class: "flex-1 flex flex-col min-w-0 h-full" }, [
                  createVNode("header", { class: "backdrop-blur-md bg-gray-900/80 border-b border-gray-700/50 flex-shrink-0 z-40" }, [
                    createVNode("div", { class: "px-4 lg:px-6 h-16 flex items-center justify-between" }, [
                      createVNode("div", { class: "flex items-center gap-4 lg:gap-8" }, [
                        createVNode(_component_NuxtLink, {
                          to: "/",
                          class: "flex items-center gap-3 hover:scale-105 transition-transform"
                        }, {
                          default: withCtx(() => [
                            (openBlock(), createBlock("svg", {
                              class: "w-6 h-6 lg:w-7 lg:h-7 text-orange-500",
                              viewBox: "0 0 24 24",
                              fill: "currentColor"
                            }, [
                              createVNode("path", { d: "M11.5 0c-6.347 0-11.5 5.153-11.5 11.5 0 6.346 5.153 11.5 11.5 11.5 6.346 0 11.5-5.154 11.5-11.5 0-6.347-5.154-11.5-11.5-11.5zm0 21c-5.243 0-9.5-4.257-9.5-9.5s4.257-9.5 9.5-9.5 9.5 4.257 9.5 9.5-4.257 9.5-9.5 9.5z" })
                            ])),
                            createVNode("h1", { class: "text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" }, " SoundCloud DL ")
                          ]),
                          _: 1
                        }),
                        createVNode("nav", {
                          class: "hidden sm:flex items-center gap-4 lg:gap-6",
                          role: "navigation",
                          "aria-label": "Main navigation"
                        }, [
                          createVNode(_component_NuxtLink, {
                            to: "/",
                            class: "text-gray-400 hover:text-orange-500 transition-all text-sm font-medium relative group",
                            "active-class": "text-orange-500",
                            "aria-label": "Go to playlist page"
                          }, {
                            default: withCtx(() => [
                              createVNode("span", null, "Playlist"),
                              createVNode("span", { class: "absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" })
                            ]),
                            _: 1
                          }),
                          createVNode(_component_NuxtLink, {
                            to: "/track",
                            class: "text-gray-400 hover:text-orange-500 transition-all text-sm font-medium relative group",
                            "active-class": "text-orange-500",
                            "aria-label": "Go to single track page"
                          }, {
                            default: withCtx(() => [
                              createVNode("span", null, "Single Track"),
                              createVNode("span", { class: "absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" })
                            ]),
                            _: 1
                          })
                        ])
                      ]),
                      createVNode("div", { class: "flex items-center gap-2 lg:gap-4" }, [
                        createVNode("button", {
                          onClick: toggleLogsPanel,
                          class: ["relative p-2 text-gray-400 hover:text-blue-500 transition-all hover:scale-110 rounded-lg hover:bg-gray-800/50", { "text-blue-500": unref(uiStore).showLogsPanel }],
                          "aria-label": "Toggle activity logs"
                        }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5 lg:w-6 lg:h-6",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            })
                          ])),
                          logStats.value.total > 0 ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
                            "aria-hidden": "true"
                          }, toDisplayString(logStats.value.total), 1)) : createCommentVNode("", true)
                        ], 2),
                        createVNode("button", {
                          onClick: toggleDownloadQueue,
                          class: ["relative p-2 text-gray-400 hover:text-orange-500 transition-all hover:scale-110 rounded-lg hover:bg-gray-800/50", { "text-orange-500": unref(uiStore).showDownloadQueue }],
                          "aria-label": "Toggle download queue"
                        }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5 lg:w-6 lg:h-6",
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
                          downloadStats.value.total > 0 ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
                            "aria-hidden": "true"
                          }, toDisplayString(downloadStats.value.total), 1)) : createCommentVNode("", true)
                        ], 2),
                        createVNode("a", {
                          href: "https://github.com/truongnat/soundcloud-playlist.git",
                          target: "_blank",
                          rel: "noopener noreferrer",
                          class: "hidden sm:block text-gray-400 hover:text-orange-500 transition-all hover:scale-110 p-2 rounded-lg hover:bg-gray-800/50",
                          "aria-label": "View source code on GitHub"
                        }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5 lg:w-6 lg:h-6",
                            fill: "currentColor",
                            viewBox: "0 0 24 24"
                          }, [
                            createVNode("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" })
                          ]))
                        ])
                      ])
                    ])
                  ]),
                  createVNode("main", { class: "flex-1 p-4 lg:p-6 overflow-y-auto min-w-0 min-h-0" }, [
                    createVNode("div", { class: "w-full" }, [
                      renderSlot(_ctx.$slots, "default")
                    ])
                  ])
                ]),
                createVNode(Transition, { name: "slide-right" }, {
                  default: withCtx(() => [
                    unref(uiStore).showDownloadQueue ? (openBlock(), createBlock("aside", {
                      key: 0,
                      class: "w-full sm:w-[420px] bg-gray-900/50 border-l border-gray-700/50 flex-shrink-0 flex flex-col fixed sm:relative inset-0 sm:inset-auto z-50 sm:z-auto h-full",
                      role: "complementary",
                      "aria-label": "Download queue"
                    }, [
                      createVNode("div", { class: "sm:hidden p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0" }, [
                        createVNode("div", { class: "flex items-center gap-3" }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5 text-orange-500",
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
                          createVNode("h2", { class: "text-lg font-semibold text-gray-200" }, "Download Queue"),
                          downloadStats.value.total > 0 ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full"
                          }, toDisplayString(downloadStats.value.total), 1)) : createCommentVNode("", true)
                        ]),
                        createVNode("button", {
                          onClick: toggleDownloadQueue,
                          class: "p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800/50",
                          "aria-label": "Close download queue"
                        }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M6 18L18 6M6 6l12 12"
                            })
                          ]))
                        ])
                      ]),
                      createVNode("div", { class: "flex-1 overflow-hidden min-h-0" }, [
                        createVNode(_component_DownloadQueue, {
                          ref_key: "downloadQueueRef",
                          ref: downloadQueueRef,
                          onClose: toggleDownloadQueue,
                          onDownloadComplete: handleDownloadComplete,
                          onDiscardAll: handleDiscardAll
                        }, null, 512)
                      ])
                    ])) : createCommentVNode("", true)
                  ]),
                  _: 1
                }),
                createVNode(Transition, { name: "fade" }, {
                  default: withCtx(() => [
                    unref(uiStore).showDownloadQueue ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40",
                      onClick: toggleDownloadQueue,
                      "aria-hidden": "true"
                    })) : createCommentVNode("", true)
                  ]),
                  _: 1
                }),
                createVNode(Transition, { name: "fade" }, {
                  default: withCtx(() => [
                    unref(uiStore).showLogsPanel ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40",
                      onClick: toggleLogsPanel,
                      "aria-hidden": "true"
                    })) : createCommentVNode("", true)
                  ]),
                  _: 1
                }),
                createVNode(Transition, { name: "bounce" }, {
                  default: withCtx(() => [
                    downloadStats.value.total > 0 && !unref(uiStore).showDownloadQueue ? (openBlock(), createBlock("button", {
                      key: 0,
                      onClick: toggleDownloadQueue,
                      class: "fixed bottom-4 right-4 lg:bottom-8 lg:right-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-3 lg:p-4 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 z-30",
                      "aria-label": `${downloadStats.value.total} downloads in queue. Click to open download queue.`
                    }, [
                      createVNode("div", { class: "relative" }, [
                        (openBlock(), createBlock("svg", {
                          class: "w-5 h-5 lg:w-6 lg:h-6",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor",
                          "aria-hidden": "true"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          })
                        ])),
                        createVNode("span", {
                          class: "absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5",
                          "aria-hidden": "true"
                        }, toDisplayString(downloadStats.value.total), 1),
                        downloadStats.value.active > 0 ? (openBlock(), createBlock("svg", {
                          key: 0,
                          class: "absolute inset-0 w-full h-full -rotate-90",
                          viewBox: "0 0 32 32",
                          "aria-hidden": "true"
                        }, [
                          createVNode("circle", {
                            cx: "16",
                            cy: "16",
                            r: "14",
                            stroke: "currentColor",
                            "stroke-width": "2.5",
                            fill: "none",
                            class: "opacity-30"
                          }),
                          createVNode("circle", {
                            cx: "16",
                            cy: "16",
                            r: "14",
                            stroke: "currentColor",
                            "stroke-width": "2.5",
                            fill: "none",
                            "stroke-dasharray": 87.96,
                            "stroke-dashoffset": 87.96 - 87.96 * downloadStats.value.activeProgress / 100,
                            class: "transition-all duration-300"
                          }, null, 8, ["stroke-dashoffset"])
                        ])) : createCommentVNode("", true)
                      ])
                    ], 8, ["aria-label"])) : createCommentVNode("", true)
                  ]),
                  _: 1
                }),
                createVNode(_component_NuxtErrorBoundary, { onError: handleError }, {
                  error: withCtx(({ error, clearError }) => [
                    createVNode("div", { class: "fixed inset-0 bg-gray-900 flex items-center justify-center z-50" }, [
                      createVNode("div", { class: "bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md mx-4" }, [
                        createVNode("h2", { class: "text-xl font-bold text-red-400 mb-4" }, "Something went wrong"),
                        createVNode("p", { class: "text-gray-300 mb-4" }, toDisplayString(error.message || "An unexpected error occurred"), 1),
                        createVNode("div", { class: "flex gap-3" }, [
                          createVNode("button", {
                            onClick: clearError,
                            class: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          }, " Try Again ", 8, ["onClick"]),
                          createVNode("button", {
                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/"),
                            class: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                          }, " Go Home ", 8, ["onClick"])
                        ])
                      ])
                    ])
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };;globalThis.__timing__.logEnd('Load chunks/build/default-EWOxdmJ1');
//# sourceMappingURL=default-EWOxdmJ1.mjs.map
