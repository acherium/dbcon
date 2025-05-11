// notiman - 알림 요소 조작 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
import {
  COMMON_INTERVAL, WINDOW_ANIMATION_DURATION, WINDOW_ANIMATION_TIMING_FUNCTION,
  DEFAULT_NOTIFICATION_DURATION, DEFAULT_TOAST_DURATION
} from "./lyra-envman.js";
import { on, once, off, send } from "./lyra-eventman.js";
import {
  $, $a, $p, $pa, create, append, revoke, after, before, adjacent,
  get, set, unset, revokeAttribute,
  body
} from "./lyra-domman.js";

/**
 * LyraNotification 생성자 매개변수 구조체.
 * @typedef {object} LyraNotificationParameters
 * @param {string} [id] 알림 ID.
 * @param {Element} [parent] 부모 요소.
 * @param {number} [duration] 유지 시간.
 * @param {string} [icon] 알림 아이콘 ID.
 * @param {string} [title] 알림 제목.
 * @param {string} [content] 알림 내용.
 * @param {string} [html] HTML 내용. 지정된 경우 텍스트 내용을 덮어씌웁니다.
 * @param {array<Element>} [buttons] 하단 버튼 목록.
 */
/**
 * LyraToastNotification 생성자 매개변수 구조체.
 * @typedef {object} LyraToastNotificationParameters
 * @param {string} [text] 텍스트 내용.
 * @param {string} [html] HTML 내용. 지정된 경우 텍스트 내용을 덮어씌웁니다.
 * @param {number} [duration] 유지 시간.
 */
/**
 * 알림 매니저를 생성합니다.
 * @param {string} name 알림 매니저 이름.
 * @param {boolean} [debugging] 디버깅 활성화 여부.
 * @returns {LyraNotificationManager} 알림 매니저.
 */
export const LyraNotificationManager = class {
  master = null;
  name = null;
  debugging = null;

  reserve = {};
  opened = {};

  parts = {
    $: null,
    wrap: {
      $: null
    }
  };

  listener = new EventTarget();

  constructor(master, name, debugging = false) {
    this.master = master;
    
    if (name && typeof name === "string") this.name = name;
    this.debugging = debugging;

    this.parts.$ = $("#LYRA-NOTIFICATION-AREA", body) ? revoke($("#LYRA-NOTIFICATION-AREA", body)) : create("div", { id: "LYRA-NOTIFICATION-AREA" });
    this.parts.wrap.$ = $(".WRAP", this.parts.$) || append(create("div", { classes: [ "WRAP" ] }), this.parts.$);

    append(this.parts.$, body);

    return this;
  };

  /**
   * 대상 요소 내에 존재하는 알림 요소를 회수하여 매니저에 등록합니다.
   * @param {Element} [target] 대상 요소. 지정하지 않으면 문서 전역에서 회수합니다.
   * @param {LyraNotificationParameters} [param] 알림 요소 생성자에 전달할 매개변수.
   * @returns {LyraNotificationManager} 알림 매니저.
   */
  retrieve = (target = document, param = {}) => {
    for (const x of Array.from($a("notification[id]", target)).map((x) => [ x.id, new LyraNotification(param, x) ])) {
      this.reserve[x[0]] = x[1];
      this.reserve[x[0]].master = this;
    };

    for (const x of Array.from($a("notification[id]", this.parts.$)).map((x) => [ x.id, new LyraNotification(param, x) ])) {
      this.reserve[x[0]] = x[1];
      this.reserve[x[0]].master = this;
    };

    return this;
  };

  /**
   * 일회성 알림을 생성하고 표시합니다. 이 메소드로 생성된 알림은 매니저에 등록되지 않습니다.
   * @param {LyraNotificationParameters} [param] 알림 요소 생성자에 전달할 매개변수.
   * @returns {LyraNotificationManager} 알림 매니저.
   */
  showOnce = (param = {}) => {
    param.parent = this.parts.wrap.$;
    new LyraNotification(param).show();

    return this;
  };

  /**
   * 토스트 알림을 생성하여 표시합니다.
   * @param {LyraToastNotificationParameters} [param] 토스트 요소 생성자에 전달할 매개변수.
   * @returns {LyraNotificationManager} 알림 매니저.
   */
  showToast = (param = {}) => {
    new LyraToastNotification(param).show();

    return this;
  };
  
  /**
   * 알림을 표시하고 매니저의 상태값을 변경합니다.
   * @param {string} id 대상 알림 ID.
   * @param {boolean} [f] 실제 동작 여부.
   * @returns {LyraNotificationManager} 알림 매니저.
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
   * 알림을 닫고 매니저의 상태값을 변경합니다.
   * @param {string} id 대상 알림 ID.
   * @param {boolean} [f] 실제 동작 여부.
   * @returns {LyraNotificationManager} 알림 매니저.
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
   * 매니저에 등록된 모든 알림을 표시합니다.
   * @returns {LyraNotificationManager} 알림 매니저.
   */
  showAll = () => {
    for (const x of Object.values(this.reserve)) x.show();
    
    return this;
  };
  
  /**
   * 매니저에 등록된 모든 알림을 닫습니다.
   * @returns {LyraNotificationManager} 알림 매니저.
   */
  closeAll = () => {
    for (const x of Object.values(this.reserve)) x.close();

    return this;
  };
  
  /**
   * 매니저에 등록된 모든 알림에 이벤트를 전달합니다.
   * @param {Event} event 전달할 이벤트.
   * @returns {LyraNotificationManager} 알림 매니저.
   */
  broadcast = (event) => {
    for (const x of Object.values(this.reserve)) { send(x.listener, event); }

    return this;
  };
  
  /**
   * 디버깅 활성화 여부를 변경합니다.
   * @param {boolean} bool 활성화 여부.
   * @returns {LyraNotificationManager} 알림 매니저.
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
 * 알림 요소를 생성합니다.
 * @param {LyraNotificationParameters} [param] 매개변수.
 * @param {Element} [origin] 원본 요소.
 * @returns {LyraNotification} 알림 요소.
 */
export const LyraNotification = class {
  parent = null;
  master = null;
  id = null;

  status = false;
  closed = true;

  duration = DEFAULT_NOTIFICATION_DURATION;
  timeout = null;

  parts = {
    $: null,
    bottom: {
      $: null
    }
  };
  partsOrigin = null;

  listener = new EventTarget();

  constructor(param = {}, origin = null) {
    const includeList = param.includes || [];

    // 원본 요소가 있으면 원본에서 지정함
    if (origin) {
      this.parent = origin.parentNode;
      this.id = origin.id;

      // main 요소
      this.parts.$ = revoke(origin);
      
      // bottom 요소
      this.parts.bottom.$ = $("bottom", this.parts.$);

      // 유지 시간 불러오기
      if (get(this.parts.$, "duration") && !Number.isNaN(Number(get(this.parts.$, "duration")))) this.duration = Number(get(this.parts.$, "duration"));
    } else {
      this.parent = body;

      // main 요소
      this.parts.$ = create("notification");

      // bottom 요소
      if (includeList.includes("bottom")) this.parts.bottom.$ = append(create("bottom"), this.parts.$);
      
      // 유지 시간 불러오기
      if (typeof param.duration !== "undefined" && !Number.isNaN(Number(param.duration))) this.duration = Number(param.duration);

      // 아이콘 불러오기
      if (typeof param.icon !== "undefined") append(create("i", { classes: [ `${param.icon}` ] }), this.parts.$);

      // 제목 불러오기
      if (typeof param.title !== "undefined") append(create("h1", { properties: { innerText: `${param.title}` } }), this.parts.$);

      // 내용 불러오기
      if (typeof param.content !== "undefined") append(create("p", { properties: { innerText: `${param.content}` } }), this.parts.$);

      // HTML 불러오기
      if (typeof param.html !== "undefined") this.parts.$.innerHTML = param.html;

      // 버튼 불러오기
      if (typeof param.buttons !== "undefined" && param.buttons.constructor === Array) {
        if (!this.parts.bottom.$) this.parts.bottom.$ = append(create("bottom"), this.parts.$);

        for (const $button of param.buttons) {
          if (!get($button, "blank")) set($button, "blank", "");
          append($button, this.parts.bottom.$);
        };
      };
      
      // ID 불러오기
      if (typeof param.id !== "undefined") {
        this.id = param.id;
        this.parts.$.id = param.id;
      };
    };

    // 부모 요소 재지정
    if (typeof param.parent !== "undefined") this.parent = param.parent;

    // 최초 데이터 정의
    this.partsOrigin = JSON.stringify(this.parts);

    // 디버깅용 이벤트 정의
    on(this.listener, "debugging", () => {
      if (!this.master || !this.master.debugging) return;
      console.log(this);
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
   * 알림을 표시합니다.
   * @returns {LyraNotification} 알림 요소.
   */
  show = () => {
    if (!this.closed) return this;
    this.closed = false;
    
    this.parts.$.animate([ { opacity: "0" } ], { fill: "both" });
    this.parts.$.animate([ { transform: "translateY(2px) scale(0.99)" } ],
      {
        fill: "both",
        composite: "accumulate"
      });

    adjacent(this.parent, "afterbegin", this.parts.$);

    this.parts.$.animate([ { opacity: "0" }, { opacity: "1" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION
      });
    this.parts.$.animate([ { transform: "translateY(2px) scale(0.99)" }, { transform: "translateY(0px) scale(1)" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION,
        composite: "accumulate"
      });
  
    if (this.master) this.master.show(this.id, false);

    this.timeout = setTimeout(this.close, this.duration);

    send(this.listener, "show");
    return this;
  };

  /**
   * 알림을 닫습니다.
   * @returns {LyraNotification} 알림 요소.
   */
  close = () => {
    if (this.closed) return this;
    this.closed = true;

    clearTimeout(this.timeout);
    this.timeout = null;
    
    this.parts.$.animate([ { opacity: "1" }, { opacity: "0" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION
      });
    this.parts.$.animate([ { transform: "translateY(0px) scale(1)" }, { transform: "translateY(2px) scale(0.99)" } ],
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
};

/**
 * 토스트 알림 요소를 생성합니다.
 * @param {LyraToastNotificationParameters} param 매개변수.
 * @returns {LyraToastNotification} 토스트 알림 요소.
 */
export const LyraToastNotification = class {
  duration = DEFAULT_TOAST_DURATION;
  timeout = null;

  parts = {
    $: null,
    main: {
      $: null
    }
  };

  constructor(param = {}) {
    this.parts.$ = create("toast");
    this.parts.main.$ = append(create("toastmain"), this.parts.$);

    if (typeof param.text !== "undefined") this.parts.main.$.innerText = param.text;
    if (typeof param.html !== "undefined") this.parts.main.$.innerHTML = param.html;
    if (typeof param.duration !== "undefined" && !Number.isNaN(Number(param.duration))) this.duration = Number(param.duration);

    return this;
  };

  /**
   * 토스트 알림을 표시합니다.
   * @returns {LyraToastNotification} 토스트 알림 요소.
   */
  show = () => {
    this.parts.$.animate([ { transform: "translateY(2px) scale(0.99)" } ],
    {
      fill: "both",
      composite: "accumulate"
    });

    append(this.parts.$, body);
    
    this.parts.$.animate([ { opacity: "0" }, { opacity: "1" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION
      });
    this.parts.$.animate([ { transform: "translateY(2px) scale(0.99)" }, { transform: "translateY(0px) scale(1)" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION,
        composite: "accumulate"
      });

    this.timeout = setTimeout(this.close, this.duration);
    return this;
  };

  /**
   * 토스트 알림을 닫습니다.
   * @returns {LyraToastNotification} 토스트 알림 요소.
   */
  close = () => {
    clearTimeout(this.timeout);
    this.timeout = null;

    this.parts.$.animate([ { opacity: "1" }, { opacity: "0" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION
      });
    this.parts.$.animate([ { transform: "translateY(0px) scale(1)" }, { transform: "translateY(2px) scale(0.99)" } ],
      {
        duration: WINDOW_ANIMATION_DURATION,
        fill: "both",
        ease: WINDOW_ANIMATION_TIMING_FUNCTION,
        composite: "accumulate"
      });

    setTimeout(() => {
      this.parts.$ = revoke(this.parts.$);
    }, WINDOW_ANIMATION_DURATION + COMMON_INTERVAL);

    return this;
  };
};