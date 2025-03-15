// winman - 창 요소 조작 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
import { COMMON_INTERVAL, WINDOW_ANIMATION_DURATION, POSITION_PARAMETERS, SIZE_PARAMETERS } from "./lyra-envman.js";
import {
  $, $a, $p, $pa, create, append, revoke, after, before,
  get, set, unset, revokeAttribute,
  body
} from "./lyra-domman.js";
import {
  copy
} from "./lyra-objman.js";

export const LyraWindowManager = class {
  constructor() {
    this.reserve = {};
    return this;
  };

  retrieve = (target = document, param = {}) => {
    const retrieveTargets = {};
    for (const x of Array.from($a("window[id]", target)).map((x) => [ x.id, new LyraWindow(param, x) ])) {
      this.reserve[x[0]] = x[1];
      retrieveTargets[x[0]] = x[1];
    };
    return retrieveTargets;
  };
};

export const LyraWindow = class {
  constructor(param = {}, origin = null) {
    // 초기화
    this.parent = null;
    this.master = null;
    
    this.parts = {
      $: null,
      outer: {
        $: null
      },
      inner: {
        $: null,
        titlebar: {
          $: null,
          left: {
            $: null,
            icon: {
              $: null
            },
            title: {
              $: null,
              text: null
            }
          },
          right: {
            $: null
          }
        },
        top: {
          $: null
        },
        body: {
          $: null
        },
        bottom: {
          $: null,
          left: {
            $: null
          },
          right: {
            $: null
          }
        },
        resizePointer: {
          $: null
        }
      },
      overlay: {
        $: null
      }
    };
    this.partsOrigin = {};
    this.closed = true;
    this.resetOnClosed = false;
    this.maximized = false;
    this.minimized = false;
    this.maximizable = true;
    this.minimizable = true;
    this.movable = true;
    this.resizable = true;
    this.rect = {
      x: 0,
      y: 0,
      width: 600,
      height: 480,
      preset: {
        x: null,
        y: null,
        width: null,
        height: null
      }
    };
    this.rectOrigin = {};
    this.listener = new EventTarget();

    const includeList = param.includes || [];

    // 원본 요소가 있으면 원본에서 지정함
    if (origin) {
      this.parent = origin.parentNode;

      // main 요소
      this.parts.$ = revoke(origin);

      // outer 요소
      this.parts.outer.$ = $("outer", this.parts.$);

      // inner 요소
      this.parts.inner.$ = $("inner", this.parts.$);

      // inner - titlebar 요소
      this.parts.inner.titlebar.$ = $("titlebar", this.parts.inner.$);

      this.parts.inner.titlebar.left.$ = $(".left", this.parts.inner.titlebar.$);
      this.parts.inner.titlebar.left.icon.$ = $(".icon", this.parts.inner.titlebar.left.$);
      this.parts.inner.titlebar.left.title.$ = $("span", this.parts.inner.titlebar.left.$);
      this.parts.inner.titlebar.left.title.text = this.parts.inner.titlebar.left.title.$?.innerText || null;

      this.parts.inner.titlebar.right.$ = $(".left", this.parts.inner.titlebar.$);

      // inner - top 요소
      this.parts.inner.top.$ = $("top", this.parts.inner.$);

      // inner - body 요소
      this.parts.inner.body.$ = $("windowbody", this.parts.inner.$);

      // inner - bottom 요소
      this.parts.inner.bottom.$ = $("bottom", this.parts.inner.$);
      this.parts.inner.bottom.left.$ = $(".left", this.parts.inner.bottom.$);
      this.parts.inner.bottom.right.$ = $(".right", this.parts.inner.bottom.$);

      // inner - resizePointer 요소
      this.parts.inner.resizePointer.$ = $("resizepointer", this.parts.inner.$);

      // overlay 요소
      this.parts.overlay.$ = $("overlay", this.parts.$);

      // 기본 Rect값 불러오기
      if (get(this.parts.$, "x")) this.rect.x = parseInt(revokeAttribute(this.parts.$, "x"));
      if (get(this.parts.$, "y")) this.rect.y = parseInt(revokeAttribute(this.parts.$, "y"));
      if (get(this.parts.$, "width")) this.rect.width = parseInt(revokeAttribute(this.parts.$, "width"));
      if (get(this.parts.$, "height")) this.rect.height = parseInt(revokeAttribute(this.parts.$, "height"));

      // 위치 프리셋 불러오기
      if (get(this.parts.$, "position")) {
        const raw = revokeAttribute(this.parts.$, "position").split(/ +/).map((x) => x.trim()).filter((x) => x.length);
        
        if (raw.length === 1) {
          if (!POSITION_PARAMETERS.includes(raw[0])) return;
          this.rect.preset.x = raw[0] !== "pixel" ? raw[0] : null;
          this.rect.preset.y = raw[0] !== "pixel" ? raw[0] : null;
        } else if (raw.length > 1) {
          if (!POSITION_PARAMETERS.includes(raw[0]) || !POSITION_PARAMETERS.includes(raw[1])) return;
          this.rect.preset.x = raw[0] !== "pixel" ? raw[0] : null;
          this.rect.preset.y = raw[1] !== "pixel" ? raw[1] : null;
        };
      };

      // 크기 프리셋 불러오기
      if (get(this.parts.$, "size")) {
        const raw = revokeAttribute(this.parts.$, "size").split(/ +/).map((x) => x.trim()).filter((x) => x.length);
        
        if (raw.length === 1) {
          if (!SIZE_PARAMETERS.includes(raw[0])) return;
          this.rect.preset.width = raw[0] !== "pixel" ? raw[0] : null;
          this.rect.preset.height = raw[0] !== "pixel" ? raw[0] : null;
        } else if (raw.length > 1) {
          if (!SIZE_PARAMETERS.includes(raw[0]) || !SIZE_PARAMETERS.includes(raw[1])) return;
          this.rect.preset.width = raw[0] !== "pixel" ? raw[0] : null;
          this.rect.preset.height = raw[1] !== "pixel" ? raw[1] : null;
        };
      };

      // 위치, 크기 조정 불가 여부 불러오기
      if (get(this.parts.$, "fixedposition") !== null) this.movable = false;
      if (get(this.parts.$, "fixedsize") !== null) this.resizable = false;
    } else {
      this.parent = body;

      // main 요소
      this.parts.$ = create("window");

      // outer 요소
      if (includeList.includes("outer")) this.parts.outer.$ = append(create("outer"), this.parts.$);

      // inner 요소
      this.parts.inner.$ = append(create("inner"), this.parts.$);

      // inner - titlebar 요소
      if (includeList.includes("titlebar")) this.parts.inner.titlebar.$ = append(create("titlebar"), this.parts.inner.$);

      if (includeList.includes("titlebar-left")) this.parts.inner.titlebar.left.$ = append(create("div", { classes: [ "left" ] }), this.parts.inner.titlebar.$);
      
      if (includeList.includes("titlebar-right")) this.parts.inner.titlebar.right.$ = append(create("div", { classes: [ "right" ] }), this.parts.inner.titlebar.$);
      if (includeList.includes("close-button")) append(create("button", { attributes: { "closewindow": "" } }), this.parts.inner.titlebar.right.$);
      if (includeList.includes("maximize-button")) append(create("button", { attributes: { "maximizewindow": "" } }), this.parts.inner.titlebar.right.$);
      if (includeList.includes("minimize-button")) append(create("button", { attributes: { "minimizewindow": "" } }), this.parts.inner.titlebar.right.$);

      // inner - top 요소
      if (includeList.includes("top")) this.parts.inner.top.$ = append(create("top"), this.parts.inner.$);

      // inner - body 요소
      this.parts.inner.body.$ = append(create("windowbody"), this.parts.inner.$);

      // inner - bottom 요소
      if (includeList.includes("bottom")) this.parts.inner.bottom.$ = append(create("bottom"), this.parts.inner.$);
      if (includeList.includes("bottom-left")) this.parts.inner.bottom.left.$ = append(create("div", { classes: [ "left" ] }), this.parts.inner.bottom.$);
      if (includeList.includes("bottom-right")) this.parts.inner.bottom.right.$ = append(create("div", { classes: [ "right" ] }), this.parts.inner.bottom.$);

      // inner - resizePointer 요소
      if (includeList.includes("resize-pointer")) this.parts.inner.resizePointer.$ = append(create("resizepointer"), this.parts.inner.$);

      // overlay 요소
      if (includeList.includes("overlay")) this.parts.overlay.$ = append(create("overlay"), this.parts.$);

      // 최대화/최소화 가능 여부 조절
      if (typeof param.maximizable !== "undefined") this.maximizable = !!param.maximizable;
      if (typeof param.minimizable !== "undefined") this.minimizable = !!param.minimizable;

      // 기본 Rect값 불러오기
      if (typeof param.x !== "undefined") this.rect.x = param.x;
      if (typeof param.y !== "undefined") this.rect.y = param.y;
      if (typeof param.width !== "undefined") this.rect.width = param.width;
      if (typeof param.height !== "undefined") this.rect.height = param.height;
      
      // 위치 프리셋 불러오기
      if (typeof param.position !== "undefined") {
        const raw = `${param.position}`.split(/ +/).map((x) => x.trim()).filter((x) => x.length);
        
        if (raw.length === 1) {
          if (!POSITION_PARAMETERS.includes(raw[0])) return;
          this.rect.preset.x = raw[0] !== "pixel" ? raw[0] : null;
          this.rect.preset.y = raw[0] !== "pixel" ? raw[0] : null;
        } else if (raw.length > 1) {
          if (!POSITION_PARAMETERS.includes(raw[0]) || !POSITION_PARAMETERS.includes(raw[1])) return;
          this.rect.preset.x = raw[0] !== "pixel" ? raw[0] : null;
          this.rect.preset.y = raw[1] !== "pixel" ? raw[1] : null;
        };
      };

      // 크기 프리셋 불러오기
      if (typeof param.size !== "undefined") {
        const raw = `${param.size}`.split(/ +/).map((x) => x.trim()).filter((x) => x.length);
        
        if (raw.length === 1) {
          if (!SIZE_PARAMETERS.includes(raw[0])) return;
          this.rect.preset.width = raw[0] !== "pixel" ? raw[0] : null;
          this.rect.preset.height = raw[0] !== "pixel" ? raw[0] : null;
        } else if (raw.length > 1) {
          if (!SIZE_PARAMETERS.includes(raw[0]) || !SIZE_PARAMETERS.includes(raw[1])) return;
          this.rect.preset.width = raw[0] !== "pixel" ? raw[0] : null;
          this.rect.preset.height = raw[1] !== "pixel" ? raw[1] : null;
        };
      };

      // 위치, 크기 조정 불가 여부 불러오기
      if (typeof param.movable !== "undefined") this.movable = param.movable;
      if (typeof param.resizable !== "undefined") this.resizable = param.resizable;
    };

    // 이벤트 초기화
    // 창 닫기
    const closeTriggers = $a("[closewindow]", this.parts.$);
    for (const node of closeTriggers) {
      if ($a("*", node).length < 1) append(create("i", { classes: [ "close" ] }), node);
      node.addEventListener("pointerup", this.close);
    };
    if (this.parts.outer.$) this.parts.outer.$.onclick = this.close;

    // 창 최대화
    const maximizeTriggers = $a("[maximizewindow]", this.parts.$);
    for (const node of maximizeTriggers) {
      if ($a("*", node).length < 1) append(create("i", { classes: [ (this.minimized ? "undo-maximize" : "maximize" ) ] }), node);
      node.addEventListener("pointerup", () => {
        this.toggleMaximize();
      });
    };
    if (this.parts.inner.titlebar.$) {
      this.parts.inner.titlebar.$.addEventListener("dblclick", (event) => {
        if (event.target !== this.parts.inner.titlebar.$) return;
        this.toggleMaximize();
      });
    };

    // 창 최소화
    const minimizeTriggers = $a("[minimizewindow]", this.parts.$);
    for (const node of minimizeTriggers) {
      if ($a("*", node).length < 1) append(create("i", { classes: [ (this.minimized ? "arrow-n" : "minimize" ) ] }), node);
      node.addEventListener("pointerup", () => {
        this.toggleMinimize();
      });
    };

    // 창 조절
    if (this.movable) this.setMoveEvent();
    if (this.resizable) this.setResizeEvent();

    // 창 활성화
    this.parts.inner.$.addEventListener("pointerdown", () => { this.active(); });

    // 파라미터 재정의
    for (const key of Object.keys(param)) if (typeof this[key] !== "undefined") this[key] = param[key];

    // 최초 데이터 정의
    this.partsOrigin = copy(this.parts);
    this.rectOrigin = copy(this.rect);

    return this;
  };

  show = () => {
    this.active();
    if (!this.closed) return this;
    this.closed = false;

    if (this.resetOnClosed) {
      this.rect = this.rectOrigin;
    };
    
    this.parts.inner.$.animate([ { opacity: "0" } ], { fill: "both" });
    this.parts.inner.$.animate([ { transform: "translateY(2px) scale(0.99)" } ],
    {
      fill: "both",
      composite: "accumulate"
    });

    append(this.parts.$, this.parent);

    if (this.parts.outer.$) this.parts.outer.$.animate([ { opacity: "0" }, { opacity: "1" }], { duration: WINDOW_ANIMATION_DURATION, fill: "both" });
    this.parts.inner.$.animate([ { opacity: "0" }, { opacity: "1" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: "cubic-bezier(0.02, 0.61, 0.47, 0.99)"
      });
    this.parts.inner.$.animate([ { transform: "translateY(2px) scale(0.99)" }, { transform: "translateY(0px) scale(1)" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: "cubic-bezier(0.02, 0.61, 0.47, 0.99)",
        composite: "accumulate"
      });
  
    this.refreshRect();
    this.listener.dispatchEvent(new Event("show"));
    return this;
  };

  close = () => {
    this.closed = true;
    this.inactive();

    if (this.parts.outer.$) this.parts.outer.$.animate([ { opacity: "1" }, { opacity: "0" }], { duration: WINDOW_ANIMATION_DURATION, fill: "both" });
    this.parts.inner.$.animate([ { opacity: "1" }, { opacity: "0" } ],
    {
      duration: WINDOW_ANIMATION_DURATION,
      fill: "both",
      ease: "cubic-bezier(0.02, 0.61, 0.47, 0.99)"
    });
    this.parts.inner.$.animate([ { transform: "translateY(0px) scale(1)" }, { transform: "translateY(2px) scale(0.99)" } ],
    {
      duration: WINDOW_ANIMATION_DURATION,
      fill: "both",
      ease: "cubic-bezier(0.02, 0.61, 0.47, 0.99)",
      composite: "accumulate"
    });

    setTimeout(() => {
      this.parts.$ = revoke(this.parts.$);
    }, WINDOW_ANIMATION_DURATION + COMMON_INTERVAL);

    this.listener.dispatchEvent(new Event("close"));
    return this;
  };

  toggleMaximize = () => {
    if (!this.maximizable) return;
    this.maximized = !this.maximized;
    
    const maximizeTriggers = $a("[maximizewindow]:not([noiconchange])", this.parts.$);
    if (this.maximized) {
      set(this.parts.$, "maximized", "");
      for (const x of maximizeTriggers) for (const y of $a("i.maximize", x)) y.className = "undo-maximize";
      this.listener.dispatchEvent(new Event("maximizestart"));
    } else {
      unset(this.parts.$, "maximized");
      for (const x of maximizeTriggers) for (const y of $a("i.undo-maximize", x)) y.className = "maximize";
      this.listener.dispatchEvent(new Event("maximizeend"));
    };

    this.listener.dispatchEvent(new Event("maximize"));
    return this;
  };

  toggleMinimize = () => {
    if (!this.minimizable) return;
    this.minimized = !this.minimized;

    const minimizeTriggers = $a("[minimizewindow]:not([noiconchange])", this.parts.$);
    if (this.minimized) {
      set(this.parts.$, "minimized", "");
      for (const x of minimizeTriggers) for (const y of $a("i.minimize", x)) y.className = "undo-minimize";
      this.listener.dispatchEvent(new Event("minimizestart"));
    } else {
      unset(this.parts.$, "minimized");
      for (const x of minimizeTriggers) for (const y of $a("i.undo-minimize", x)) y.className = "minimize";
      this.listener.dispatchEvent(new Event("minimizeend"));
    };

    this.listener.dispatchEvent(new Event("minimize"));
    return this;
  };

  active = () => {
    for (const node of Array.from($a("window[active]")).filter((x) => x !== this.parts.$)) unset(node, "active");
    if (get(this.parts.$, "active") === null) {
      set(this.parts.$, "active", "");
      this.parent.insertAdjacentElement("beforeend", this.parts.$);
    };

    this.listener.dispatchEvent(new Event("active"));
    return this;
  };

  inactive = () => {
    unset(this.parts.$, "active");
    this.listener.dispatchEvent(new Event("inactive"));
    return this;
  };

  setTitle = (string) => {
    if (!this.parts.inner.$ || !this.parts.inner.titlebar.$ || !this.parts.inner.titlebar.left.$) return;
    if (!this.parts.inner.titlebar.left.title.$) this.parts.inner.titlebar.left.title.$ = append(create("span"), this.parts.inner.titlebar.left.$);

    this.parts.inner.titlebar.left.title.$.innerText = string;
    this.parts.inner.titlebar.left.title.text = string;

    return this;
  };

  setIcon = (node) => {
    if (!this.parts.inner.$ || !this.parts.inner.titlebar.$ || !this.parts.inner.titlebar.left.$) return;
    if (!this.parts.inner.titlebar.left.icon.$) this.parts.inner.titlebar.left.icon.$ = append(create("div", { classes: [ "icon" ] }), this.parts.inner.titlebar.left.$);

    this.parts.inner.titlebar.left.icon.$.textContent = "";
    append(node, this.parts.inner.titlebar.left.icon.$);

    return this;
  };

  setBody = (node) => {
    if (!this.parts.inner.$ || !this.parts.inner.body.$) return;
    after(this.parts.inner.body.$, node);
    revoke(this.parts.inner.body.$);
    this.parts.inner.body.$ = node;
    return this;
  };

  setBottom = (node) => {
    if (!this.parts.inner.$ || !this.parts.inner.bottom.$) return;
    after(this.parts.inner.bottom.$, node);
    revoke(this.parts.inner.bottom.$);
    this.parts.inner.bottom.$ = node;
    return this;
  };

  refreshRect = () => {
    this.parts.$.style["justify-content"] = this.rect.preset.x || null;
    this.parts.$.style["align-items"] = this.rect.preset.y || null;

    this.parts.inner.$.animate([
      {
        transform: `translate(${this.rect.x}px, ${this.rect.y}px)`,
        width: `${this.rect.preset.width || `${this.rect.width}px`}`,
        height: `${this.rect.preset.height || `${this.rect.height}px`}`
      }
    ], {
      fill: "both",
      composite: "accumulate"
    });

    this.listener.dispatchEvent(new Event("refresh"));
    return this;
  };

  setPosition = (x = null, y = null) => {
    if (!this.movable) return this;
    if (x !== null) this.rect.x = x;
    if (y !== null) this.rect.y = y;
    this.refreshRect();
    this.listener.dispatchEvent(new Event("positionmove"));
    return this;
  };

  addPosition = (x = null, y = null) => {
    if (!this.movable) return this;
    if (x !== null) this.rect.x += x;
    if (y !== null) this.rect.y += y;
    this.refreshRect();
    this.listener.dispatchEvent(new Event("positionmove"));
    return this;
  };

  setSize = (width = null, height = null) => {
    if (!this.resizable) return this;
    if (width !== null) this.rect.width = width;
    if (height !== null) this.rect.height = height;
    this.refreshRect();
    this.listener.dispatchEvent(new Event("sizechange"));
    return this;
  };

  addSize = (width = null, height = null) => {
    if (!this.resizable) return this;
    if (width !== null) this.rect.width += width;
    if (height !== null) this.rect.height += height;
    if (this.rect.preset.x === "end" || this.rect.preset.y === "end") this.addPosition((this.rect.preset.x === "end" ? width : null), (this.rect.preset.y === "end" ? height : null));
    this.refreshRect();
    this.listener.dispatchEvent(new Event("sizechange"));
    return this;
  };

  setMoveEvent = () => {
    if (!this.parts.inner.$ || !this.parts.inner.titlebar.$) return;

    this.parts.inner.titlebar.$.onpointerdown = (pointer) => {
      if (
        ( pointer.target !== this.parts.inner.titlebar.$ ) ||
        this.maximized
      ) return;

      const cb = (event) => this.addPosition(event.movementX, event.movementY);
      document.addEventListener("pointermove", cb);
      document.addEventListener("pointerup", () => { document.removeEventListener("pointermove", cb); }, { once: true });
      document.addEventListener("pointercancel", () => { document.removeEventListener("pointermove", cb); }, { once: true });
    };

    return this;
  };

  setResizeEvent = () => {
    if (!this.parts.inner.$ || !this.parts.inner.resizePointer.$) return;

    this.parts.inner.resizePointer.$.onpointerdown = (pointer) => {
      if (pointer.target !== this.parts.inner.resizePointer.$) return;

      const cb = (event) => this.addSize(event.movementX, event.movementY);
      document.addEventListener("pointermove", cb);
      document.addEventListener("pointerup", () => { document.removeEventListener("pointermove", cb); }, { once: true });
      document.addEventListener("pointercancel", () => { document.removeEventListener("pointermove", cb); }, { once: true });
    };
  };
};