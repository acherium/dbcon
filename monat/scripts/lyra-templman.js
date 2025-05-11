// templman - HTML 템플릿 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
import { RGBAtoHEX, HEXtoRGBA, RGBtoHSL, HSLtoRGB } from "./lyra-methods.js";
import { $, $a, get, set, unset, create, append, unseal, root } from "./lyra-domman.js";
import { on, send } from "./lyra-eventman.js";
import { fetchHTML } from "./lyra-fetchman.js";
import { LyraWindow } from "./lyra-winman.js";
import { COLOR_MODE, HEX_REGEX } from "./lyra-envman.js";

export const LYRA_TEMPLATE_COLOR_PICKER = fetchHTML("./monat/templates/LyraColorPicker.html");

/**
 * 색상 개체.
 * @typedef {object} ColorObject
 * @param {number} [r] R 값.
 * @param {number} [g] G 값.
 * @param {number} [b] B 값.
 * @param {number} [h] H 값.
 * @param {number} [s] S 값.
 * @param {number} [l] L 값.
 * @param {number} [a] 투명도 값.
 * @param {string} [hex] HEX 값.
 */
/**
 * LyraColorPicker 생성자 매개변수 구조체.
 * @typedef {object} LyraColorPicketParameters
 * @param {string} [mode] 색상 모드.
 * @param {boolean} [includeAlpha] 투명도 포함 여부.
 * @param {ColorObject} [color] 색상 개체.
 */
/**
 * 창 기반의 색상 선택기 템플릿을 생성합니다.
 * @param {object} master 마스터 개체
 * @param {string} id ID.
 * @param {LyraColorPicketParameters} param 매개변수.
 * @returns {LyraColorPicker} 색상 선택기.
 */
export const LyraColorPicker = class {
  master = null;
  id = null;

  mode = "RGB";
  includeAlpha = true;
  color = {
    r: 0,
    g: 0,
    b: 0,
    h: 0,
    s: 0,
    l: 0,
    a: 100,
    hex: "000000FF"
  };

  parts = {
    window: null,
    preview: {
      $: null
    },
    colorMode: {
      $: null,
      text: {
        $: null
      }
    },
    r: {
      $: null,
      input: {
        $: null
      }
    },
    g: {
      $: null,
      input: {
        $: null
      }
    },
    b: {
      $: null,
      input: {
        $: null
      }
    },
    h: {
      $: null,
      input: {
        $: null
      }
    },
    s: {
      $: null,
      input: {
        $: null
      }
    },
    l: {
      $: null,
      input: {
        $: null
      }
    },
    a: {
      $: null,
      input: {
        $: null
      }
    },
    hex: {
      input: {
        $: null
      },
      button: {
        $: null
      }
    }
  };

  listener = new EventTarget();

  constructor(master, id, param = {}) {
    if (!master || !master.winman || !id || id.constructor !== String) return;

    this.master = master;
    this.id = id;

    if (typeof param.mode !== "undefined" && COLOR_MODE.includes(param.mode)) this.mode = param.mode;
    if (typeof param.includeAlpha !== "undefined" && param.includeAlpha.constructor === Boolean) this.includeAlpha = param.includeAlpha;
    if (typeof param.color !== "undefined") {
      for (const key of Object.keys(this.color)) {
        if (typeof param.color[key] === "undefined") continue;
        this.color[key] = param.color[key];
      };
    };

    LYRA_TEMPLATE_COLOR_PICKER.then(($seal) => {
      const $items = $a(".RANGE-ITEM:has(.RANGE)", $seal);
      for (const $item of $items) {
        const $range = $(".RANGE", $item);
        const target = get($range, "target");

        this.parts[target.toLowerCase()].$ = $item;
        this.parts[target.toLowerCase()].input.$ = $range;
      };

      const $inputHex = $(".INPUT.HEX", $seal);
      const $btnHex = $(".BUTTON.HEX", $seal);
      this.parts.hex.input.$ = $inputHex;
      this.parts.hex.button.$ = $btnHex;

      on($btnHex, "click", () => {
        navigator.clipboard.writeText(`#${this.color.hex}`);
        if (master.notiman) master.notiman.showToast({ text: "HEX 코드를 복사하였습니다." });
      });

      const $preview = $(".PREVIEW", $seal);
      this.parts.preview.$ = $preview;

      on(this.parts.hex.input.$, "input", () => { this.parts.hex.input.$.value = this.parts.hex.input.$.value.replace(/#/gi, ""); });

      const $btnMode = $(".CHANGE-COLOR-MODE", $seal);
      const $btnModeText = $(".COLOR-MODE", $btnMode);
      this.parts.colorMode.$ = $btnMode;
      this.parts.colorMode.text.$ = $btnModeText;

      on(this.parts.colorMode.$, "click", () => { this.changeMode(); });

      for (const [ key, value ] of Object.entries(this.color)) {
        this.parts[key].input.$.value = value;
        set(this.parts[key].input.$, "defaultValue", value);
        send(this.parts[key].input.$, "input");

        on(this.parts[key].input.$, "input", () => { this.setColorByKey(key); });
      };

      this.parts.window = new LyraWindow({ id: this.id, parent: root, maximizable: false, minimizable: false }, $(".LYRA-COLOR-PICKER", $seal));
      this.master.winman.register(this.parts.window);

      this.setMode(this.mode);
      this.setIncludeAlpha(this.includeAlpha);
      this.setColorByKey();
    });

    return this;
  };

  /**
   * 색상 선택기를 표시합니다.
   * @returns {LyraColorPicker} 색상 선택기.
   */
  show() {
    this.master.winman.show(this.id);

    return this;
  };

  /**
   * 색상 선택기의 제목을 설정합니다.
   * @param {string} text 제목.
   * @returns {LyraColorPicker} 색상 선택기.
   */
  setTitle(text) {
    this.parts.window.setTitle(text);

    return this;
  };

  /**
   * 색상 모드를 설정합니다.
   * @param {string} mode 색상 모드.
   * @returns {LyraColorPicker} 색상 선택기.
   */
  setMode(mode) {
    if (!COLOR_MODE.includes(mode)) return this;

    this.mode = mode;
    switch(this.mode) {
      case "RGB":
        unset(this.parts.r.$, "none");
        unset(this.parts.g.$, "none");
        unset(this.parts.b.$, "none");
        set(this.parts.h.$, "none", "");
        set(this.parts.s.$, "none", "");
        set(this.parts.l.$, "none", "");
        break;
      case "HSL":
        set(this.parts.r.$, "none", "");
        set(this.parts.g.$, "none", "");
        set(this.parts.b.$, "none", "");
        unset(this.parts.h.$, "none");
        unset(this.parts.s.$, "none");
        unset(this.parts.l.$, "none");
        break;
    };

    this.parts.colorMode.text.$.innerText = this.mode;
    return this;
  };

  /**
   * 색상 모드를 전환합니다.
   * @returns {LyraColorPicker} 색상 선택기.
   */
  changeMode() {
    switch(this.mode) {
      case "RGB":
        this.setMode("HSL");
        break;
      case "HSL":
        this.setMode("RGB");
        break;
    };

    return this;
  };

  /**
   * 투명도 포함 여부를 설정합니다.
   * @param {boolean} bool 투명도 포함 여부.
   * @returns {LyraColorPicker} 색상 선택기.
   */
  setIncludeAlpha(bool) {
    if (bool.constructor !== Boolean) return this;

    this.includeAlpha = bool;
    this.includeAlpha ? unset(this.parts.a.$, "none") : set(this.parts.a.$, "none", "");

    return this;
  };

  /**
   * 색상 개체의 키를 기준으로 색상을 계산하고 적용합니다.
   * @param {string} key 키.
   * @returns {LyraColorPicker} 색상 선택기.
   */
  setColorByKey(key = "r") {
    switch(key) {
      case "r":
      case "g":
      case "b":
        this.color[key] = parseInt(this.parts[key].input.$.value);
        Object.assign(this.color, RGBtoHSL(this.color.r, this.color.g, this.color.b));

        for (const [ key, value ] of Object.entries(this.color)) key === "hex" ? {} : this.color[key] = Math.floor(value);
        this.color.hex = RGBAtoHEX(this.color.r, this.color.g, this.color.b, this.color.a);

        for (const [ key, value ] of Object.entries(this.color)) {
          this.parts[key].input.$.value = value;
          send(this.parts[key].input.$, "change");
        };
        break;
      case "h":
      case "s":
      case "l":
        this.color[key] = parseInt(this.parts[key].input.$.value);
        Object.assign(this.color, HSLtoRGB(this.color.h, this.color.s, this.color.l));

        for (const [ key, value ] of Object.entries(this.color)) key === "hex" ? {} : this.color[key] = Math.floor(value);
        this.color.hex = RGBAtoHEX(this.color.r, this.color.g, this.color.b, this.color.a);

        for (const [ key, value ] of Object.entries(this.color)) {
          this.parts[key].input.$.value = value;
          send(this.parts[key].input.$, "change");
        };
        break;
      case "a":
        this.color.a = parseInt(this.parts.a.input.$.value);
        for (const [ key, value ] of Object.entries(this.color)) key === "hex" ? {} : this.color[key] = Math.floor(value);
        this.color.hex = RGBAtoHEX(this.color.r, this.color.g, this.color.b, this.color.a);

        for (const [ key, value ] of Object.entries(this.color)) {
          this.parts[key].input.$.value = value;
          send(this.parts[key].input.$, "change");
        };
        break;
      case "hex":
        if (HEX_REGEX.exec(this.parts.hex.input.$.value)) {
          this.color.hex = this.parts.hex.input.$.value;
          Object.assign(this.color, HEXtoRGBA(this.color.hex));
          Object.assign(this.color, RGBtoHSL(this.color.r, this.color.g, this.color.b));
          for (const [ key, value ] of Object.entries(this.color)) key === "hex" ? {} : this.color[key] = Math.floor(value);
  
          for (const [ key, value ] of Object.entries(this.color)) {
            this.parts[key].input.$.value = value;
            send(this.parts[key].input.$, "change");
          };
        };
        break;
    };

    this.parts.preview.$.style["background-color"] = `#${this.color.hex}`;

    return this;
  };
};