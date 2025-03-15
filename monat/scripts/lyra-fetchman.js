// fetchman - 네트워크 요청 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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