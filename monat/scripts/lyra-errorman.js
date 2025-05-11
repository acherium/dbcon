// errorman - 오류 로그 및 안내창 출력 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
import { create, append } from "./lyra-domman.js";
import { LYRA_NAME, LYRA_DISPLAY_NAME, LYRA_VERSION, LYRA_DATE } from "./lyra-envman.js";
import { LyraWindow } from "./lyra-winman.js";

/**
 * 기본 오류 창을 출력합니다.
 * @param {string} message 오류 메시지.
 */
export const error = (message) => {
  const e = new Error(message);
  const win = new LyraWindow({
    includes: [
      "titlebar",
      "titlebar-left",
      "titlebar-right",
      "close-button",
      "bottom",
      "bottom-right"
    ],
    height: 300,
    position: "center",
    size: "pixel fit-content",
    maximizable: false,
    minimizable: false
  }).setIcon(create("div", { classes: [ "lyra-icon" ] }))
    .setTitle(LYRA_NAME)
    .setBody(create("windowmain", { attributes: { flex: "", aligncenter: "", gap: "" }, properties: { innerHTML: `<il class="error"></il><p>An error has occurred.<br><br><span highlight red wordbreak>${message}</span><br><br>For more information for this error, please check the console.<br><span sub>${LYRA_DISPLAY_NAME} build ${LYRA_VERSION}@${LYRA_DATE}</span></p>` } }));

  append(create("button", { attributes: { "closewindow": "" }, properties: { innerText: "OK" }, events: { "click": win.close } }), win.parts.inner.body.bottom.right.$);
  append(create("button", { properties: { innerText: "Copy this message" }, events: { "click": () => { navigator.clipboard.writeText(message); } } }), win.parts.inner.body.bottom.right.$);
  
  win.show();
  console.error(e);
  return message;
};