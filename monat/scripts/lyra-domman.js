// domman - HTML 조작 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 변수
/**
 * 문서의 루트 요소입니다.
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Document/documentElement | MDN 레퍼런스> Document.documentElement}
 */
export const root = document.documentElement;

/**
 * 문서 본문 요소입니다.
 * @see {@link https://developer.mozilla.org/ko/docs/Web/HTML/Element/body | MDN 레퍼런스> <body>: 문서 본문 요소}
 */
export const body = document.body;

/**
 * 문서의 헤드 요소입니다.
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Document/head | MDNS 레퍼런스> Document.head}
 */
export const head = document.head;

// 함수
/**
 * 제공한 선택자와 일치하는 첫 번째 요소를 반환하고, 일치하는 개체가 없다면 null을 반환합니다.
 * @param {string} query 선택자.
 * @param {Element} [target] 탐색 대상 요소. 제공되지 않으면 기본적으로 Document에서 탐색합니다.
 * @returns {Element | null}
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Document/querySelector | MDN 레퍼런스> Document.querySelector()}
 */
export const $ = (query, target = document) => {
  if (!target) return null;
  return target.querySelector(query);
};

/**
 * 제공한 선택자와 일치하는 모든 요소를 NodeList로 반환합니다.
 * @param {string} query 선택자.
 * @param {Element} [target] 탐색 대상 요소. 제공되지 않으면 기본적으로 document에서 탐색합니다.
 * @returns {NodeList}
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Document/querySelectorAll | MDN 레퍼런스> Document.querySelectorAll()}
 */
export const $a = (query, target = document) => target.querySelectorAll(query);

/**
 * 탐색 대상 요소의 모든 부모 요소 중 제공한 선택자와 일치하는 첫 번째 요소를 반환하고, 일치하는 개체가 없다면 null을 반환합니다.
 * @param {string} query 선택자.
 * @param {Element} [target] 탐색 대상 요소. 제공되지 않으면 기본적으로 루트 요소에서 탐색합니다.
 * @returns {Element | null}
 */
export const $p = (query, target = root) => {
  const checker = $a(query);
  let result = target;

  while (result !== null) {
    result = result.parentElement;
    if (Array.from(checker).find((x) => x === result)) break;
  };

  return result;
};

/**
 * 탐색 대상 요소의 모든 부모 요소 중 제공한 선택자와 일치하는 모든 요소를 배열로 반환합니다.
 * @param {string} query 선택자.
 * @param {Element} [target] 탐색 대상 요소. 제공되지 않으면 기본적으로 루트 요소에서 탐색합니다.
 * @returns {array}
 */
export const $pa = (query, target = root) => {
  const checker = $a(query);
  const result = [];
  let last = target;

  while (last !== null) {
    last = last.parentElement;
    if (Array.from(checker).find((x) => x === last)) result.push(last);
  };

  return result;
};

/**
 * 탐색 대상 요소의 모든 형제 중 제공한 선택자와 일치하는 첫 번째 요소를 반환하고, 일치하는 개체가 없다면 null을 반환합니다.
 * @param {string} query 선택자.
 * @param {Element} [target] 탐색 대상 요소. 제공되지 않으면 기본적으로 루트 요소에서 탐색합니다.
 * @returns {Element | null}
 */
export const $s = (query, target = root) => {
  const checker = $a(query);
  const siblings = target.parentNode.children;
  let result = null;

  for (const node of Array.from(siblings)) {
    if (Array.from(checker).find((x) => x === node)) {
      result = node;
      break;
    };
  };

  return result;
};

/**
 * 탐색 대상 요소의 모든 형제 중 제공한 선택자와 일치하는 모든 요소를 배열로 반환합니다.
 * @param {string} query 선택자.
 * @param {Element} [target] 탐색 대상 요소. 제공되지 않으면 기본적으로 루트 요소에서 탐색합니다.
 * @returns {array}
 */
export const $sa = (query, target = root) => {
  const checker = $a(query);
  const siblings = target.parentNode.children;
  const result = [];

  for (const node of Array.from(siblings)) if (Array.from(checker).find((x) => x === node)) result.push(node);

  return result;
};

/**
 * create 함수 매개변수 구조체
 * @typedef {object} LyraCreateParameters
 * @property {string} [id] 요소에 적용할 ID의 이름.
 * @property {array} [classes] 요소에 적용할 클래스의 목록.
 * @property {object} [attributes] 요소에 적용할 속성값(Attributes)의 객체 형식의 모음집.
 * @property {object} [properties] 요소에 적용할 속성값(Properties)의 객체 형식의 모음집.
 * @property {object} [events] 요소에 적용할 이벤트의 객체 형식의 모음집.
 */
/**
 * 지정한 태그명의 요소를 만들어 반환합니다. 매개변수가 지정된 경우 지정된 값에 따라 속성이나 이벤트를 설정하고 반환합니다.
 * @param {string} tag 요소명.
 * @param {LyraCreateParameters} [params] 매개변수.
 * @returns {Element} 지정한 태그에 따라 반환합니다.
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Document/createElement | MDN 레퍼런스> Document.createElement()}
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Element/setAttribute | MDN 레퍼런스> Document.setAttribute()}
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/EventTarget/addEventListener | MDN 레퍼런스> EventTarget.addEventListener()}
 */
export const create = (tag = "div", params = { id: null, classes: [], attributes: {}, properties: {}, events: {} }) => {
  const res = document.createElement(tag);
  if (params) {
    if (params.id && params.id !== null) res.id = params.id;
    if (params.classes?.length > 0) for (const value of params.classes) res.classList.add(value);
    if (params.attributes) for (const key in params.attributes) res.setAttribute(key, params.attributes[key]);
    if (params.properties) for (const key in params.properties) res[key] = params.properties[key];
    if (params.events) for (const key in params.events) res.addEventListener(key, params.events[key]);
  };
  return res;
};

/**
 * 지정한 요소를 특정 요소에 자식으로 추가하고, 추가한 요소를 반환합니다.
 * @param {Element} node 추가할 요소.
 * @param {Element} [target] 추가할 목적지인 요소. 제공되지 않으면 기본적으로 문서 본문 요소(Body)에 추가합니다.
 * @returns {Element} 추가한 요소를 반환합니다.
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Node/appendChild | MDN 레퍼런스> Node.appendChild()}
 */
export const append = (node, target = body) => target.appendChild(node);

/**
 * 지정한 요소를 기준 요소 다음에 추가하고, 추가한 요소를 배열로 반환합니다.
 * @param {Element} target 기준 요소.
 * @param {Element} node 추가할 요소.
 * @returns {array} 추가한 요소를 반환합니다.
 */
export const after = (target, ...node) => {
  target.after(...node);
  return node;
};

/**
 * 지정한 요소를 기준 요소 이전에 추가하고, 추가한 요소를 배열로 반환합니다.
 * @param {Element} target 기준 요소.
 * @param {...Element} node 추가할 요소.
 * @returns {array} 추가한 요소를 반환합니다.
 */
export const before = (target, ...node) => {
  target.before(...node);
  return node;
};

/**
 * 지정한 요소를 기준 요소 인근의 특정 위치에 추가하고, 추가한 요소를 배열로 반환합니다.
 * @param {Element} target 
 * @param {string} position 
 * @param  {...Element} node 
 * @returns {array} 추가한 요소를 반환합니다.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement | MDN 레퍼런스(영문)> Element: insertAdjacentElement() method}
 */
export const adjacent = (target = document, position, ...node) => {
  let last = target;
  for (const x of node) {
    last.insertAdjacentElement(position, x);
    last = x;
  };
  return node;
};

/**
 * 지정한 요소를 부모 요소로부터 회수합니다. 회수된 요소는 삭제되지 않고 DOM에 남아있으므로 재사용이 가능해집니다.
 * @param {Element} node 요소
 * @returns {Element} 회수한 자손 요소.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild | MDN 레퍼런스(영문)> Node: removeChild() method}
 */
export const revoke = (node) => node.parentNode.removeChild(node);

/**
 * 지정한 요소의 속성 값을 불러옵니다. 찾는 속성 값이 없다면 null을 반환합니다.
 * @param {Element} node 요소.
 * @param {string} name 찾는 속성 이름.
 * @returns {* | null}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute | MDN 레퍼런스(영문)> Element: getAttribute() method}
 */
export const get = (node, name) => node.getAttribute(name);

/**
 * 지정한 요소의 속성 값을 설정하거나 바꿉니다. 대상 요소를 반환합니다.
 * @param {Element} node 요소.
 * @param {string} name 속성 이름.
 * @param {*} value 속성 값.
 * @returns {Element}
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Element/setAttribute | MDN 레퍼런스> Element.setAttribute()}
 */
export const set = (node, name, value) => {
  node.setAttribute(name, value);
  return node;
};

/**
 * 지정한 요소의 속성 값을 제거합니다. 대상 요소를 반환합니다.
 * @param {Element} node 요소.
 * @param {string} name 제거할 속성 이름.
 * @returns {Element}
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Element/removeAttribute | MDN 레퍼런스| Element.removeAttribute()}
 */
export const unset = (node, name) => {
  node.removeAttribute(name);
  return node;
};

/**
 * 지정한 요소의 속성 값을 제거하고 반환합니다.
 * @param {Element} node 요소.
 * @param {string} name 제거할 속성 이름.
 * @returns {string}
 */
export const revokeAttribute = (node, name) => {
  const result = get(node, name);
  unset(node, name);
  return result;
};

/**
 * 지정한 요소를 새로운 밀봉 요소로 감싸고 반환합니다.
 * @param {Element} node 요소.
 * @returns {Element} 밀봉 요소.
 */
export const seal = (node) => {
  const sealNode = create("seal");
  before(node, sealNode);
  append(node, sealNode);
  return sealNode;
};

/**
 * 지정한 요소를 감싸고 있던 밀봉 요소에서 빼내고 바로 다음에 추가한 뒤 반환합니다. 지정한 요소가 밀봉 요소로 감싸져 있지 않으면 null을 반환합니다.
 * 지정한 요소를 빼낸 뒤 밀봉 요소 내부에 아무 요소도 없으면 밀봉 요소를 제거합니다.
 * @param {*} node 요소.
 * @returns {Element | null} 요소.
 */
export const unseal = (node) => {
  const parent = node.parentElement;
  if (parent.nodeName !== "SEAL") return null;
  after(parent, node);
  if ($a("*", parent).length < 1) revoke(parent);
  return node;
};