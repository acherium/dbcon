// winman - 창 요소 조작 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
import { COMMON_INTERVAL, WINDOW_ANIMATION_DURATION, WINDOW_ANIMATION_TIMING_FUNCTION, POSITION_PARAMETERS, SIZE_PARAMETERS } from "./lyra-envman.js";
import { on, once, off, send } from "./lyra-eventman.js";
import {
  $, $a, $p, $pa, create, append, revoke, after, before,
  get, set, unset, revokeAttribute,
  body
} from "./lyra-domman.js";

/**
 * LyraWindow 생성자 매개변수 구조체.
 * @typedef {object} LyraWindowParameters
 * @param {string} [id] 창 ID.
 * @param {Element} [parent] 부모 요소.
 * @param {array<string>} [includes] 창 구조물.
 * @param {boolean} [maximizable] 최대화 가능 여부.
 * @param {boolean} [minimizable] 최소화 가능 여부.
 * @param {boolean} [movable] 이동 가능 여부.
 * @param {boolean} [resizable] 크기 조절 가능 여부.
 * @param {number} [x] X 좌푯값.
 * @param {number} [y] Y 좌푯값.
 * @param {number} [width] 창 너비.
 * @param {number} [height] 창 높이.
 * @param {string} [position] 창 위치 프리셋 스타일.
 * @param {string} [size] 창 크기 프리셋 스타일.
 */
/**
 * 창 매니저를 생성합니다.
 * @param {string} name 창 매니저 이름.
 * @param {boolean} [debugging] 디버깅 활성화 여부.
 * @returns {LyraWindowManager} 창 매니저.
 */
export const LyraWindowManager = class {
  master = null;
  name = null;
  debugging = false;

  reserve = {};
  opened = {};
  current = null;

  listener = new EventTarget();

  constructor(master, name, debugging = false) {
    this.master = master;

    if (name && typeof name === "string") this.name = name;
    this.debugging = debugging;

    return this;
  };

  /**
   * 대상 요소 내에 존재하는 창 요소를 회수하여 매니저에 등록합니다.
   * @param {Element} [target] 대상 요소. 지정하지 않으면 문서 전역에서 회수합니다.
   * @param {LyraWindowParameters} [param] 창 요소 생성자에 전달할 매개변수.
   * @returns {LyraWindowManager} 창 매니저.
   */
  retrieve = (target = document, param = {}) => {
    for (const x of Array.from($a("window[id]", target)).map((x) => [ x.id, new LyraWindow(param, x) ])) {
      this.reserve[x[0]] = x[1];
      this.reserve[x[0]].master = this;
    };

    return this;
  };

  /**
   * 창 요소를 매니저에 등록합니다.
   * @param {LyraWindow} target 창 요소.
   * @returns {LyraWindowManager} 창 매니저.
   */
  register = (target) => {
    if (!target || target.constructor !== LyraWindow || !target.id) return this;
    target.master = this;
    this.reserve[target.id] = target;
    return this;
  };

  /**
   * 창을 표시하고 매니저의 상태값을 변경합니다.
   * @param {string} id 대상 창 ID.
   * @param {boolean} [f] 실제 동작 여부.
   * @returns {LyraWindowManager} 창 매니저.
   */
  show = (id, f = true) => {
    if (!id || typeof id !== "string") return;

    const target = this.reserve[id];
    if (!target) return;

    this.opened[id] = target;
    if (f) target.show();

    return this;
  };

  /**
   * 창을 닫고 매니저의 상태값을 변경합니다.
   * @param {string} id 대상 창 ID.
   * @param {boolean} [f] 실제 동작 여부.
   * @returns {LyraWindowManager} 창 매니저.
   */
  close = (id, f = true) => {
    if (!id || typeof id !== "string") return;

    const target = this.reserve[id];
    if (!target) return;

    delete this.opened[id];
    if (f) target.close(false);

    return this;
  };

  /**
   * 창을 활성화하고 매니저의 상태값을 변경합니다.
   * @param {string} id 대상 창 ID.
   * @param {boolean} [f] 실제 동작 여부.
   * @returns {LyraWindowManager} 창 매니저.
   */
  active = (id, f = true) => {
    if (!id || typeof id !== "string") return this;
    
    const target = this.reserve[id];
    if (!target) return;

    this.current = target;
    if (f) target.active();

    return this;
  };

  /**
   * 현재 활성화된 창을 비활성화하고 매니저의 상태값을 변경합니다.
   * @param {boolean} [f] 실제 동작 여부.
   * @returns {LyraWindowManager} 창 매니저.
   */
  inactive = (f = true) => {
    if (!this.current) return this;

    if (f) this.current.inactive();
    this.current = null;

    return this;
  };

  /**
   * 매니저에 등록된 모든 창을 표시합니다.
   * @returns {LyraWindowManager} 창 매니저.
   */
  showAll = () => {
    for (const x of Object.values(this.reserve)) x.show();
    
    return this;
  };

  /**
   * 매니저에 등록된 모든 창을 닫습니다.
   * @returns {LyraWindowManager} 창 매니저.
   */
  closeAll = () => {
    for (const x of Object.values(this.reserve)) x.close();

    return this;
  };

  /**
   * 매니저에 등록된 모든 창에 이벤트를 전달합니다.
   * @param {Event} event 전달할 이벤트.
   * @returns {LyraWindowManager} 창 매니저.
   */
  broadcast = (event) => {
    for (const x of Object.values(this.reserve)) { send(x.listener, event); }

    return this;
  };

  /**
   * 디버깅 활성화 여부를 변경합니다.
   * @param {boolean} bool 활성화 여부.
   * @returns {LyraWindowManager} 창 매니저.
   */
  setDebugging = (bool) => {
    this.debugging = bool;

    const debuggingStatus = new Event("debuggingstatus");
    debuggingStatus.status = bool;
    this.broadcast(debuggingStatus);

    return this;
  };
};

/**
 * 창 요소를 생성합니다.
 * @param {LyraWindowParameters} [param] 매개변수.
 * @param {Element} [origin] 원본 요소. 
 * @returns {LyraWindow} 창 요소.
 */
export const LyraWindow = class {
  parent = null;
  master = null;
  id = null;

  status = false;
  closed = true;
  resetOnShow = false;

  parts = {
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
      body: {
        $: null,
        top: {
          $: null
        },
        main: {
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
      },
      resizePointer: {
        $: null
      }
    },
    overlay: {
      $: null
    }
  };
  partsOrigin = null;

  rect = {
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
  rectOrigin = null;

  maximized = false;
  minimized = false;
  maximizable = true;
  minimizable = true;
  movable = true;
  resizable = true;

  listener = new EventTarget();

  constructor(param = {}, origin = null) {
    const includeList = param.includes || [];

    // 원본 요소가 있으면 원본에서 지정함
    if (origin) {
      this.parent = origin.parentNode;
      this.id = origin.id;

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

      this.parts.inner.titlebar.right.$ = $(".right", this.parts.inner.titlebar.$);

      // inner - body 요소
      this.parts.inner.body.$ = $("windowbody", this.parts.inner.$);

      // inner - body - top 요소
      this.parts.inner.body.top.$ = $("top", this.parts.inner.body.$);

      // inner - body - main 요소
      this.parts.inner.body.main.$ = $("windowmain", this.parts.inner.body.$);

      // inner - body - bottom 요소
      this.parts.inner.body.bottom.$ = $("bottom", this.parts.inner.body.$);
      this.parts.inner.body.bottom.left.$ = $(".left", this.parts.inner.body.bottom.$);
      this.parts.inner.body.bottom.right.$ = $(".right", this.parts.inner.body.bottom.$);

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

      // 실행시 위치, 크기 초기화 여부 불러오기
      if (get(this.parts.$, "resetonshow") !== null) this.resetOnShow = true;
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

      // inner - body 요소
      this.parts.inner.body.$ = append(create("windowbody"), this.parts.inner.$);

      // inner - body - top 요소
      if (includeList.includes("top")) this.parts.inner.body.top.$ = append(create("top"), this.parts.inner.body.$);

      // inner - body - main 요소
      this.parts.inner.body.main.$ = append(create("windowmain"), this.parts.inner.body.$);

      // inner - body - bottom 요소
      if (includeList.includes("bottom")) this.parts.inner.body.bottom.$ = append(create("bottom"), this.parts.inner.body.$);
      if (includeList.includes("bottom-left")) this.parts.inner.body.bottom.left.$ = append(create("div", { classes: [ "left" ] }), this.parts.inner.body.bottom.$);
      if (includeList.includes("bottom-right")) this.parts.inner.body.bottom.right.$ = append(create("div", { classes: [ "right" ] }), this.parts.inner.body.bottom.$);

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
          if (POSITION_PARAMETERS.includes(raw[0])) {
            this.rect.preset.x = raw[0] !== "pixel" ? raw[0] : null;
            this.rect.preset.y = raw[0] !== "pixel" ? raw[0] : null;
          };
        } else if (raw.length > 1) {
          if (POSITION_PARAMETERS.includes(raw[0]) && POSITION_PARAMETERS.includes(raw[1])) {
            this.rect.preset.x = raw[0] !== "pixel" ? raw[0] : null;
            this.rect.preset.y = raw[1] !== "pixel" ? raw[1] : null;
          };
        };
      };

      // 크기 프리셋 불러오기
      if (typeof param.size !== "undefined") {
        const raw = `${param.size}`.split(/ +/).map((x) => x.trim()).filter((x) => x.length);
        
        if (raw.length === 1) {
          if (SIZE_PARAMETERS.includes(raw[0])) {
            this.rect.preset.width = raw[0] !== "pixel" ? raw[0] : null;
            this.rect.preset.height = raw[0] !== "pixel" ? raw[0] : null;
          };
        } else if (raw.length > 1) {
          if (SIZE_PARAMETERS.includes(raw[0]) && SIZE_PARAMETERS.includes(raw[1])) {
            this.rect.preset.width = raw[0] !== "pixel" ? raw[0] : null;
            this.rect.preset.height = raw[1] !== "pixel" ? raw[1] : null;
          };
        };
      };

      // 위치, 크기 조정 불가 여부 불러오기
      if (typeof param.movable !== "undefined") this.movable = param.movable;
      if (typeof param.resizable !== "undefined") this.resizable = param.resizable;

      // ID 불러오기
      if (typeof param.id !== "undefined") {
        this.id = param.id;
        this.parts.$.id = param.id;
      };
    };

    // 부모 요소 재지정
    if (typeof param.parent !== "undefined") this.parent = param.parent;

    // 창 닫기
    const closeTriggers = $a("[closewindow]", this.parts.$);
    for (const node of closeTriggers) {
      if ($a("*", node).length < 1) append(create("i", { classes: [ "close" ] }), node);
      on(node, "pointerup", this.close);
    };
    if (this.parts.outer.$) this.parts.outer.$.onclick = () => { this.close(this.id); };

    // 창 최대화
    const maximizeTriggers = $a("[maximizewindow]", this.parts.$);
    for (const node of maximizeTriggers) {
      if ($a("*", node).length < 1) append(create("i", { classes: [ (this.minimized ? "undo-maximize" : "maximize" ) ] }), node);
      on(node, "pointerup", this.toggleMaximize);
    };
    if (this.parts.inner.titlebar.$) {
      on(this.parts.inner.titlebar.$, "dblclick", (event) => {
        if (event.target !== this.parts.inner.titlebar.$) return;
        this.toggleMaximize();
      });
    };

    // 창 최소화
    const minimizeTriggers = $a("[minimizewindow]", this.parts.$);
    for (const node of minimizeTriggers) {
      if ($a("*", node).length < 1) append(create("i", { classes: [ (this.minimized ? "arrow-n" : "minimize" ) ] }), node);
      on(node, "pointerup", this.toggleMinimize);
    };

    // 창 조절
    if (this.movable) this.setMoveEvent();
    if (this.resizable) this.setResizeEvent();

    // 창 활성화
    on(this.parts.inner.$, "pointerdown", this.active);

    // 파라미터 재정의
    for (const key of Object.keys(param)) if (typeof this[key] !== "undefined") this[key] = param[key];

    // 최초 데이터 정의
    this.partsOrigin = JSON.stringify(this.parts);
    this.rectOrigin = JSON.stringify(this.rect);

    // 디버깅용 이벤트 정의
    on(this.listener, "debugging", () => {
      if (!this.master || !this.master.debugging) return;
      console.log(this);
    });
    on(this.listener, "debuggingstatus", (event) => {
      if (this.parts.inner.titlebar.left.title.$) {
        if (this.master.debugging) this.parts.inner.titlebar.left.title.$.innerHTML = `${this.parts.inner.titlebar.left.title.text} (master: ${this.master.name}, id: ${this.id})`;
        else this.parts.inner.titlebar.left.title.$.innerText = this.parts.inner.titlebar.left.title.text;
      };
    });

    // 사전 이벤트 정의
    on(this.listener, "updatedictionary", (event) => {
      for (const [ key, value ] of Object.entries(event.dictionary)) {
        const elements = $a(`span[dict="${key}"]`, this.parts.$);
        for (const element of elements) element.innerText = value;
      };
    });

    return this;
  };

  /**
   * 창을 표시합니다.
   * @returns {LyraWindow} 창 요소.
   */
  show = () => {
    this.active();
    if (!this.closed) return this;
    this.closed = false;

    if (this.resetOnShow) {
      this.rect = JSON.parse(this.rectOrigin);
      this.refreshRect();
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
        ease: WINDOW_ANIMATION_TIMING_FUNCTION
      });
    this.parts.inner.$.animate([ { transform: "translateY(2px) scale(0.99)" }, { transform: "translateY(0px) scale(1)" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION,
        composite: "accumulate"
      });
  
    if (this.master) {
      this.master.show(this.id, false);

      if (this.parts.inner.titlebar.left.title.$) {
        if (this.master.debugging) this.parts.inner.titlebar.left.title.$.innerHTML = `${this.parts.inner.titlebar.left.title.text} (master: ${this.master.name}, id: ${this.id})`;
        else this.parts.inner.titlebar.left.title.$.innerText = this.parts.inner.titlebar.left.title.text;
      };
    };

    this.refreshRect();
    send(this.listener, "show");
    return this;
  };

  /**
   * 창을 닫습니다.
   * @returns {LyraWindow} 창 요소.
   */
  close = () => {
    if (this.closed) return this;
    this.closed = true;
    this.inactive();

    if (this.parts.outer.$) this.parts.outer.$.animate([ { opacity: "1" }, { opacity: "0" }], { duration: WINDOW_ANIMATION_DURATION, fill: "both" });
    this.parts.inner.$.animate([ { opacity: "1" }, { opacity: "0" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION
      });
    this.parts.inner.$.animate([ { transform: "translateY(0px) scale(1)" }, { transform: "translateY(2px) scale(0.99)" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION,
        composite: "accumulate"
      });

    setTimeout(() => {
      this.parts.$ = revoke(this.parts.$);
    }, WINDOW_ANIMATION_DURATION + COMMON_INTERVAL);

    if (this.master) this.master.close(this.id, false);

    send(this.listener, "close");
    return this;
  };

  /**
   * 최대화 상태를 전환합니다.
   * @returns {LyraWindow} 창 요소.
   */
  toggleMaximize = () => {
    if (!this.maximizable) return;
    this.maximized = !this.maximized;
    
    const maximizeTriggers = $a("[maximizewindow]:not([noiconchange])", this.parts.$);
    if (this.maximized) {
      set(this.parts.$, "maximized", "");
      for (const x of maximizeTriggers) for (const y of $a("i.maximize", x)) y.className = "undo-maximize";
      send(this.listener, "maximizestart");
    } else {
      unset(this.parts.$, "maximized");
      for (const x of maximizeTriggers) for (const y of $a("i.undo-maximize", x)) y.className = "maximize";
      send(this.listener, "maximizeend");
    };

    send(this.listener, "maximize");
    return this;
  };

  /**
   * 최소화 상태를 전환합니다.
   * @returns {LyraWindow} 창 요소.
   */
  toggleMinimize = () => {
    if (!this.minimizable) return;
    this.minimized = !this.minimized;

    const minimizeTriggers = $a("[minimizewindow]:not([noiconchange])", this.parts.$);
    if (this.minimized) {
      set(this.parts.$, "minimized", "");
      for (const x of minimizeTriggers) for (const y of $a("i.minimize", x)) y.className = "undo-minimize";
      send(this.listener, "minimizestart");
    } else {
      unset(this.parts.$, "minimized");
      for (const x of minimizeTriggers) for (const y of $a("i.undo-minimize", x)) y.className = "minimize";
      send(this.listener, "minimizeend");
    };

    send(this.listener, "minimize");
    return this;
  };

  /**
   * 이 창을 활성화하고 나머지 창을 비활성화합니다.
   * @returns {LyraWindow} 창 요소.
   */
  active = () => {
    for (const node of Array.from($a("window[active]")).filter((x) => x !== this.parts.$)) unset(node, "active");
    if (get(this.parts.$, "active") === null) {
      set(this.parts.$, "active", "");
      this.parent.insertAdjacentElement("beforeend", this.parts.$);
    };

    this.status = true;
    if (this.master) this.master.active(this.id, false);

    send(this.listener, "active");
    return this;
  };

  /**
   * 창을 비활성화합니다.
   * @returns {LyraWindow} 창 요소.
   */
  inactive = () => {
    unset(this.parts.$, "active");
    
    this.status = false;
    if (this.master) this.master.inactive(false);

    send(this.listener, "inactive");
    return this;
  };

  /**
   * 창의 제목을 설정합니다.
   * @param {string} string 창 제목.
   * @returns {LyraWindow} 창 요소.
   */
  setTitle = (string) => {
    if (!this.parts.inner.$ || !this.parts.inner.titlebar.$ || !this.parts.inner.titlebar.left.$) return;
    if (!this.parts.inner.titlebar.left.title.$) this.parts.inner.titlebar.left.title.$ = append(create("span"), this.parts.inner.titlebar.left.$);

    this.parts.inner.titlebar.left.title.$.innerText = string;
    this.parts.inner.titlebar.left.title.text = string;

    return this;
  };

  /**
   * 창의 아이콘을 설정합니다.
   * @param {Element} node 아이콘으로 등록할 요소.
   * @returns {LyraWindow} 창 요소.
   */
  setIcon = (node) => {
    if (!this.parts.inner.$ || !this.parts.inner.titlebar.$ || !this.parts.inner.titlebar.left.$) return;
    if (!this.parts.inner.titlebar.left.icon.$) this.parts.inner.titlebar.left.icon.$ = append(create("div", { classes: [ "icon" ] }), this.parts.inner.titlebar.left.$);

    this.parts.inner.titlebar.left.icon.$.textContent = "";
    append(node, this.parts.inner.titlebar.left.icon.$);

    return this;
  };

  /**
   * 창의 내용을 설정합니다.
   * @param {Element} node 내용으로 등록할 요소.
   * @returns {LyraWindow} 창 요소.
   */
  setBody = (node) => {
    if (!this.parts.inner.$ || !this.parts.inner.body.$ || !this.parts.inner.body.main.$) return;
    after(this.parts.inner.body.main.$, node);
    revoke(this.parts.inner.body.main.$);
    this.parts.inner.body.main.$ = node;
    return this;
  };

  /**
   * 창의 하단부를 설정합니다.
   * @param {Element} node 하단부로 등록할 요소.
   * @returns {LyraWindow} 창 요소.
   */
  setBottom = (node) => {
    if (!this.parts.inner.$ || !this.parts.inner.bottom.$) return;
    after(this.parts.inner.bottom.$, node);
    revoke(this.parts.inner.bottom.$);
    this.parts.inner.bottom.$ = node;
    return this;
  };

  /**
   * 창의 크기와 위치를 새로 고칩니다.
   * @returns {LyraWindow} 창 요소.
   */
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

    send(this.listener, "refresh");
    return this;
  };

  /**
   * 창의 위치를 설정합니다.
   * @param {number | null} [x] X 좌푯값. null일 경우 변경하지 않습니다. 
   * @param {number | null} [y] Y 좌푯값. null일 경우 변경하지 않습니다.
   * @returns {LyraWindow} 창 요소.
   */
  setPosition = (x = null, y = null) => {
    if (!this.movable) return this;
    if (x !== null) this.rect.x = x;
    if (y !== null) this.rect.y = y;
    this.refreshRect();
    send(this.listener, "positionmove");
    return this;
  };

  /**
   * 창을 이동시킵니다.
   * @param {number | null} [x] 이동할 X 좌푯값. null일 경우 변경하지 않습니다.
   * @param {number | null} [y] 이동할 Y 좌푯값. null일 경우 변경하지 않습니다.
   * @returns {LyraWindow} 창 요소.
   */
  addPosition = (x = null, y = null) => {
    if (!this.movable) return this;
    if (x !== null) this.rect.x += x;
    if (y !== null) this.rect.y += y;
    this.refreshRect();
    send(this.listener, "positionmove");
    return this;
  };

  /**
   * 창의 크기를 설정합니다.
   * @param {number | null} [width] 창 너비. null일 경우 변경하지 않습니다.
   * @param {number | null} [height] 창 높이. null일 경우 변경하지 않습니다.
   * @returns {LyraWindow} 창 요소.
   */
  setSize = (width = null, height = null) => {
    if (!this.resizable) return this;
    if (width !== null) this.rect.width = width;
    if (height !== null) this.rect.height = height;
    this.refreshRect();
    send(this.listener, "sizechange");
    return this;
  };

  /**
   * 창의 크기를 변경합니다.
   * @param {number | null} [width] 변경할 창 너비. null일 경우 변경하지 않습니다. 
   * @param {number | null} [height] 변경할 창 높이. null일 경우 변경하지 않습니다.
   * @returns {LyraWindow} 창 요소.
   */
  addSize = (width = null, height = null) => {
    if (!this.resizable) return this;
    if (width !== null) this.rect.width += width;
    if (height !== null) this.rect.height += height;
    if (this.rect.preset.x === "end" || this.rect.preset.y === "end") this.addPosition((this.rect.preset.x === "end" ? width : null), (this.rect.preset.y === "end" ? height : null));
    this.refreshRect();
    send(this.listener, "sizechange");
    return this;
  };

  /**
   * 창 이동 이벤트를 설정합니다.
   * @returns {LyraWindow} 창 요소.
   */
  setMoveEvent = () => {
    if (!this.parts.inner.$ || !this.parts.inner.titlebar.$) return;

    this.parts.inner.titlebar.$.onpointerdown = (pointer) => {
      if (
        ( pointer.target !== this.parts.inner.titlebar.$ ) ||
        this.maximized
      ) return;

      const cb = (event) => this.addPosition(event.movementX, event.movementY);
      on(document, "pointermove", cb);
      once(document, "pointerup", () => { off(document, "pointermove", cb); });
      once(document, "pointercancel", () => { off(document, "pointermove", cb); });
    };

    return this;
  };

  /**
   * 창 크기 조절 이벤트를 설정합니다.
   * @returns {LyraWindow} 창 요소.
   */
  setResizeEvent = () => {
    if (!this.parts.inner.$ || !this.parts.inner.resizePointer.$) return;

    this.parts.inner.resizePointer.$.onpointerdown = (pointer) => {
      if (pointer.target !== this.parts.inner.resizePointer.$) return;

      const cb = (event) => this.addSize(event.movementX, event.movementY);
      on(document, "pointermove", cb);
      once(document, "pointerup", () => { off(document, "pointermove", cb); });
      once(document, "pointercancel", () => { off(document, "pointermove", cb); });
    };
  };
};