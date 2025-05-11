// dictman - 사전 및 단어 템플릿 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
import { $a } from "./lyra-domman.js";
import { send } from "./lyra-eventman.js";

export const LyraDictionaryManager = class {
  master = null;
  name = null;
  debugging = null;

  dictionary = {};

  listener = new EventTarget();

  constructor(master, name, debugging = false) {
    this.master = master;

    if (name && typeof name === "string") this.name = name;
    this.debugging = debugging;

    return this;
  };

  set(param1, param2 = null) {
    const list = [];

    if (typeof param1 !== "undefined" && param1.constructor === Array) list.push(...param1);
    else if (typeof param1 !== "undefined" && param1 instanceof Object) list.push(param1);
    else if (typeof param1 !== "undefined" && typeof param2 !== "undefined" && param1.constructor === String) list.push(Object.fromEntries([ [ `${param1}`, `${param2}` ] ]));

    for (const cell of list) {
      if (cell instanceof Object) {
        for (const [ key, value ] of Object.entries(cell)) {
          this.dictionary[key] = `${value}`;
        };
      };
    };

    return this;
  };
  
  apply(target = this.master.body) {
    for (const [ key, value ] of Object.entries(this.dictionary)) {
      const elements = $a(`span[dict="${key}"]`, target);
      for (const element of elements) element.innerText = value;
    };

    if (target === this.master.body) this.broadcast();

    return this;
  };

  broadcast() {
    for (const win of Object.values(this.master.winman.reserve)) send(win.listener, "updatedictionary", { dictionary: this.dictionary });
    for (const panel of Object.values(this.master.panelman.reserve)) send(panel.listener, "updatedictionary", { dictionary: this.dictionary });
    for (const menu of Object.values(this.master.menuman.reserve)) send(menu.listener, "updatedictionary", { dictionary: this.dictionary });
    for (const noti of Object.values(this.master.notiman.reserve)) send(noti.listener, "updatedictionary", { dictionary: this.dictionary });

    return this;
  };

  unset(key) {
    delete this.dictionary[key];

    return this;
  };
};