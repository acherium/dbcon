// fetchman - 네트워크 요청 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
import { init } from "../init.js";
import { $a, create } from "./lyra-domman.js";
import { error } from "./lyra-errorman.js";
import { LYRA_NAME, LYRA_DISPLAY_NAME, LYRA_AUTHOR, LYRA_VERSION, LYRA_DATE } from "./lyra-envman.js";

// 함수
/**
 * @typedef {object} LyraFetchmanParameters
 * @property {string} [method] 메소드 이름.
 * @property {string} [url] 요청 대상 주소.
 * @property {object} [reqHeader] 헤더.
 * @property {*} [send] 전송할 데이터.
 */
/**
 * @typedef {object} LyraFetchmanHandlers
 * @property {function} [abort] XMLHttpRequest Abort 이벤트 핸들러
 * @property {function} [error] XMLHttpRequest Error 이벤트 핸들러
 * @property {function} [load] XMLHttpRequest Load 이벤트 핸들러
 * @property {function} [loadend] XMLHttpRequest LoadEnd 이벤트 핸들러
 * @property {function} [loadstart] XMLHttpRequest LoadStart 이벤트 핸들러
 * @property {function} [progress] XMLHttpRequest Progress 이벤트 핸들러
 * @property {function} [readystatechange] XMLHttpRequest ReadyStateChange 이벤트 핸들러
 * @property {function} [timeout] XMLHttpRequest Timeout 이벤트 핸들러
 */
/**
 * AJAX 요청을 생성하고 전송합니다.
 * @param {LyraFetchmanParameters | string} param 매개변수. 값이 문자열인 경우 해당 문자열을 주소로 두고 GET 요청을 생성합니다.
 * @param {LyraFetchmanHandlers} handler 이벤트 핸들러.
 */
export const xhr = async (param = {}, handler = {}) => {
  let method, url, reqHeader, send;

  if (param.constructor === String) {
    method = "GET";
    url = param;
    reqHeader = {};
    send = "";
  } else {
    method = param.method ?? "GET";
    url = param.url ?? "/";
    reqHeader = param.header ?? {};
    send = param.send ?? "";
  };

  const _ = new XMLHttpRequest();
  _.open(method, url, true);
  
  for (const key of Object.keys(reqHeader)) _.setRequestHeader(key, reqHeader[key]);
  for (const key of Object.keys(handler)) _.addEventListener(key, handler[key]);

  _.send(JSON.stringify(send));

  return new Promise((resolve) => {
    _.addEventListener("load", (data) => resolve(data));
    _.addEventListener("error", (data) => resolve(data));
    _.addEventListener("abort", (data) => resolve(data));
  });
};

/**
 * HTML 문서를 불러오는 AJAX 요청을 생성하고 Seal 요소로 반환합니다.
 * @param {LyraFetchmanParameters | string} param 매개변수. 값이 문자열인 경우 해당 문자열을 주소로 두고 GET 요청을 생성합니다.
 * @returns {Promise<HTMLElement>} Seal 요소.
 */
export const fetchHTML = (param = {}) => {
  return new Promise((resolve, reject) => {
    xhr(param, {
      load: (data) => {
        if (data.target.status !== 200) {
          error(`Failed to load this HTML >>> ${data.target.responseURL} >>> ${data.target.status} ${data.target.statusText}`);
          reject(data);
          return;
        };

        const raw = data.target.response;
        const sealed = create("seal", { properties: { innerHTML: raw } });
        init(sealed);
        
        for (const $span of $a("span[LYRA_NAME]", sealed)) $span.innerText = LYRA_NAME;
        for (const $span of $a("span[LYRA_DISPLAY_NAME]", sealed)) $span.innerText = LYRA_DISPLAY_NAME;
        for (const $span of $a("span[LYRA_AUTHOR]", sealed)) $span.innerText = LYRA_AUTHOR;
        for (const $span of $a("span[LYRA_VERSION]", sealed)) $span.innerText = LYRA_VERSION;
        for (const $span of $a("span[LYRA_DATE]", sealed)) $span.innerText = LYRA_DATE;

        resolve(sealed);
      }
    });
  });
};

/**
 * JSON 문서를 불러오는 AJAX 요청을 생성하고 JSON 데이터를 반환합니다.
 * @param {LyraFetchmanParameters | string} param 매개변수. 값이 문자열인 경우 해당 문자열을 주소로 두고 GET 요청을 생성합니다.
 * @returns {Promise<*>} JSON 데이터.
 */
export const fetchJSON = (param = {}) => {
  return new Promise((resolve, reject) => {
    xhr(param, {
      load: (data) => {
        if (data.target.status !== 200) {
          error(`Failed to load this JSON >>> ${data.target.responseURL} >>> ${data.target.status} ${data.target.statusText}`);
          reject(data);
          return;
        };

        try {
          const raw = data.target.response;
          const json = JSON.parse(raw);

          resolve(json);
        } catch(e) {
          error(`Failed to load this JSON >>> ${e.fileName} >>> ${e.name}@${e.lineNumber}:${e.columnNumber}`);
          reject(e);
          return;
        }
      }
    });
  });
};