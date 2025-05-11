// eventman - HTML 요소 이벤트 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

/**
 * 대상 요소에 이벤트 리스너를 추가합니다.
 * @param {HTMLElement} target 대상 요소.
 * @param {string} eventName 이벤트 이름.
 * @param {function} listener 이벤트 리스너.
 * @param {object} option 이벤트 옵션.
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/EventTarget/addEventListener | MDN 레퍼런스> EventTarget.addEventListener()}
 */
export const on = (target, eventName, listener, option = {}) => { target.addEventListener(eventName, listener, option); };

/**
 * 대상 요소에 일회성 이벤트 리스너를 추가합니다.
 * @param {HTMLElement} target 대상 요소.
 * @param {string} eventName 이벤트 이름.
 * @param {function} listener 이벤트 리스너.
 * @param {object} option 이벤트 옵션.
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/EventTarget/addEventListener | MDN 레퍼런스> EventTarget.addEventListener()}
 */
export const once = (target, eventName, listener, option = {}) => {
  option.once = true;
  target.addEventListener(eventName, listener, option);
};

/**
 * 대상 요소에 이벤트 리스너를 제거합니다.
 * @param {HTMLElement} target 대상 요소.
 * @param {string} eventName 이벤트 이름.
 * @param {function} listener 이벤트 리스너.
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/EventTarget/removeEventListener | MDN 레퍼런스> EventTarget.removeEventListener()}
 */
export const off = (target, eventName, listener) => { target.removeEventListener(eventName, listener); };

/**
 * 대상 요소에 이벤트를 발송합니다.
 * @param {HTMLElement | EventTarget} target 대상 요소.
 * @param {Event} event 이벤트 또는 이벤트 이름.
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/EventTarget/dispatchEvent | MDN 레퍼런스> EventTarget.dispatchEvent()}
 */
export const send = (target, event, param = {}) => {
  if (event.constructor === String) event = new Event(event);

  for (const [ key, value ] of Object.entries(param)) event[key] = value;

  target.dispatchEvent(event);
};