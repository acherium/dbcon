// master - 마스터 개체 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
/**
 * 마스터 개체를 생성합니다.
 * @param {Document} [targetDocument] 대상 문서 요소.
 * @param {Document} [targetRoot] 대상 문서의 루트 요소.
 * @param {HTMLHeadElement} [targetHead] 대상 문서의 헤드 요소.
 * @param {HTMLBodyElement} [targetBody] 대상 문서의 본문 요소.
 * @returns {LyraMaster} 마스터 개체.
 */
export const LyraMaster = class {
  document = null;
  root = null;
  head = null;
  body = null;

  winman = null;
  panelman = null;
  menuman = null;
  notiman = null;
  dictman = null;

  constructor(targetDocument = document, targetRoot = document.documentElement, targetHead = document.head, targetBody = document.body) {
    this.document = targetDocument;
    this.root = targetRoot;
    this.head = targetHead;
    this.body = targetBody;

    return this;
  };
};