// objman - JS 개체 조작 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 변수

// 함수
/**
 * 입력받은 객체 형식의 값을 깊은 동결(Deep Freeze)처리합니다.
 * @param {*} obj 객체 형식의 값
 * @see {@link https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze | MDN 레퍼런스> Object.freeze()}
 */
export const freeze = (obj) => {
  for (const value of Object.values(obj)) if (typeof value === "object" && typeof value[Symbol.iterator] === "function") freeze(value);
  Object.freeze(obj);
  return;
};

/**
 * 입력받은 값을 깊은 복사(Deep Copy)하고 그 값을 반환합니다.
 * @param {*} val 아무 값, 변수, 배열, etc...
 * @returns {*} 복사된 값
 * @see {@link https://developer.mozilla.org/ko/docs/Glossary/Deep_copy | MDN 레퍼런스> 깊은 복사}
 */
export const copy = (val) => {
  return JSON.parse(JSON.stringify(val));
};