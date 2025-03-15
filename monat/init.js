import {
  root, body, head, $, $a, $p, $s, create, append, revoke, after, before, adjacent,
  get, set, unset,
  xhr,
  DRAG_SCROLLING_THRESHOLD, COMMON_INTERVAL, WINDOW_ANIMATION_DURATION,
  LYRA_NAME, LYRA_DISPLAY_NAME, LYRA_AUTHOR, LYRA_VERSION, LYRA_DATE,
  LyraWindowManager, LyraWindow,
  error
} from "./module.js";

const master = {};

/**
 * 대상을 Lyra Engine으로 초기화합니다.
 * @param {HTMLElement} target 대상 요소.
 */
const init = (target) => {
  // :indeterminate 상태의 체크박스 초기화
  const $indeterminateCheckboxes = $a(`input[type="checkbox"][indeterminate]`);
  for (const $checkbox of ($indeterminateCheckboxes)) $checkbox.indeterminate = true;

  // 탭 관련 기능 초기화
  // 탭 목록 넘칠 시 드래그로 스크롤
  const $tabLists = $a(":is(.tabs, .tabs-row, .tabs-column)", target);
  for (const $tabList of $tabLists) {
    if ($tabList.classList.contains("tabs") || $tabList.classList.contains("tabs-row")) {
      // 횡렬 탭 목록의 경우
      $tabList.onpointerdown = (pointer) => {
        if (pointer.pointerType !== "mouse") return;
        let i = 0;

        $tabList.onpointermove = (move) => {
          if (i < DRAG_SCROLLING_THRESHOLD) {
            i += Math.abs(move.movementX);
            return;
          };

          $tabList.scroll($tabList.scrollLeft + move.movementX * -1, 0);
        };

        document.addEventListener("pointerup", () => {
          $tabList.onpointermove = null;
          $tabList.onpointerup = null;
          $tabList.onpointercancel = null;
        }, { once: true });

        $tabList.onpointercancel = () => {
          $tabList.onpointermove = null;
          $tabList.onpointerup = null;
          $tabList.onpointercancel = null;
        };
      };
    } else if($tabList.classList.contains("tabs-column")) {
      // 종렬 탭 목록의 경우
      $tabList.onpointerdown = (pointer) => {
        if (pointer.pointerType !== "mouse") return;
        let i = 0;

        $tabList.onpointermove = (move) => {
          if (i < DRAG_SCROLLING_THRESHOLD) {
            i += Math.abs(move.movementY);
            return;
          };

          $tabList.scroll(0, $tabList.scrollTop + move.movementY * -1);
        };

        document.addEventListener("pointerup", () => {
          $tabList.onpointermove = null;
          $tabList.onpointerup = null;
          $tabList.onpointercancel = null;
        }, { once: true });

        $tabList.onpointercancel = () => {
          $tabList.onpointermove = null;
          $tabList.onpointerup = null;
          $tabList.onpointercancel = null;
        };
      };
    };
  };

  // 탭 항목 숨김/표시
  const $tabs = $a(`:is(.tabs, .tabs-row, .tabs-column) > label:has(input[type="radio"])`, target);
  for (const $tab of $tabs) {
    const $targets = $a(get($tab, "target"), target);
    const $radio = $(`input[type="radio"]`, $tab);
    if (!$targets || !$radio) continue;

    const name = get($radio, "name");
    const value = get($radio, "value");
    if (!name || !value) continue;

    for (const $target of $targets) {
      $target.style["display"] = $radio.checked ? null : "none";
    };

    $radio.onchange = () => {
      if (!$radio.checked) return;
      
      const $alts = $a(`label:has(input[type="radio"][name="${name}"]:not([value="${value}"]))`);
      for (const $alt of $alts) {
        const $altTargets = $a(get($alt, "target"));
        if (!$altTargets) continue;

        for (const $altTarget of $altTargets) {
          $altTarget.style["display"] = "none";
        };
      };

      for (const $target of $targets) {
        $target.style["display"] = null;
      };
    };
  };

  // 다크모드 강제 토글
  const $tglForceDarkmode = $a("[toggledarkmode]", target);
  const toggleForceDarkmode = (flag = null) => {
    flag = flag || get(root, "forcedarkmode") === null;
    flag ? set(root, "forcedarkmode", "") : unset(root, "forcedarkmode");
    Array.from($a(`input[toggledarkmode]:is([type="checkbox"], [type="radio"])`)).forEach(($node) => $node.checked = flag);
  };
  for (const $node of $tglForceDarkmode) {
    if ($node.nodeName === "INPUT" && [ "checkbox", "radio" ].includes($node.type)) {
      $node.addEventListener("change", () => toggleForceDarkmode($node.checked));
    } else {
      $node.addEventListener("click", () => toggleForceDarkmode());
    };
  };

  // 선택 목록 초기화
  const $selects = $a("label > select", target);
  for (const $select of $selects) {
    const isMultiple = (typeof get($select, "multiple") === "string" && get($select, "multiple") !== "false");
    const defaultText = $(`option[value=""]`, $select) ? $(`option[value=""]`, $select).innerText : "선택";
    const $options = $a("option", $select);
    const $selectedOrigin = Array.from($select.options).filter((x) => x.selected);

    const $label = $select.parentElement;
    const $displayText = append(create("span"), $label);
    const $icon = append(create("i", { classes: [ "select-arrow" ] }), $label);
    const setText = () => {
      const $selected = Array.from($select.options).filter((x) => x.selected);
      $displayText.innerText = $selected.length < 1 ? defaultText : $selected.map((x) => x.innerText).join(", ");
      $displayText.title = $selected.length < 1 ? defaultText : $selected.map((x) => x.innerText).join(", ");
      if ($selected.length > 1) $displayText.innerHTML = `<span highlight bold>${$selected.length}개</span> ${$displayText.innerHTML}`;
    };
    setText();

    const $listBody = append(create("div", { classes: [ "immersive-select-list" ], properties: { style: "display: none; pointer-events: none;" } }), $label);
    const open = () => {
      if ($label.getBoundingClientRect().top > innerHeight / 2) set($label, "listontop", "");
      else unset($label, "listontop");

      set($label, "expanded", "");

      $listBody.animate([ { opacity: "0", transform: "translateY(2px) scale(0.99)" } ], { fill: "both" });
      $listBody.style["display"] = null;
      $listBody.style["pointer-events"] = null;
      $listBody.animate([ { opacity: "1", transform: "translateY(0px) scale(1)" } ], { duration: WINDOW_ANIMATION_DURATION, fill: "both", easing: "cubic-bezier(0.02, 0.61, 0.47, 0.99)" });
    };
    const close = () => {
      unset($label, "expanded");

      $listBody.animate([ { opacity: "0", transform: "translateY(2px) scale(0.99)" } ], { duration: WINDOW_ANIMATION_DURATION, fill: "both", easing: "cubic-bezier(0.02, 0.61, 0.47, 0.99)" });
      $listBody.style["pointer-events"] = "none";
      setTimeout(() => {
        $listBody.style["display"] = "none";

        if ($label.getBoundingClientRect().top > innerHeight / 2) set($label, "listontop", "");
        else unset($label, "listontop");
      }, COMMON_INTERVAL + WINDOW_ANIMATION_DURATION);
    };
    $select.onclick = () => {
      if (get($label, "expanded") === null) open();
      else close();
    };
    $select.onkeydown = (event) => {
      if (event.key === " " || event.key === "Enter") {
        if (get($label, "expanded") === null) open();
        else close();
      } else if (event.key === "ArrowDown") {
        if (get($label, "expanded") === null) open();
        else {
          console.log($(`input[type="checkbox"]:not(:disabled)`, $list));
          $(`input[type="checkbox"]:not(:disabled)`, $list).focus();
        }
      } else if (event.key === "ArrowUp") close();
    };

    const $topList = append(create("div", { classes: [ "top-list", "list-row" ], attributes: { "nogap": "", "widthfull": "" } }), $listBody);
    const $searchLabel = append(create("label", { attributes: { "withnext": "", "widthfull": "", "flexfull": "" }}), $topList);
    const $searchIcon = append(create("i", { classes: [ "search" ] }), $searchLabel);
    const $search = append(create("input", { properties: { type: "text", placeholder: "검색" } }), $searchLabel);
    $search.oninput = () => {
      const $itemLis = Array.from($a("li", $list));
      if ($search.value) {
        const regex = new RegExp($search.value.trim().replace(/ +/g, ""), "gi");
        for (const $li of $itemLis) {
          const liText = $("span", $li).innerText.trim().replace(/ +/g, "");
          $li.style["display"] = regex.exec(liText) ? null : "none";
        };
      } else {
        for (const $li of $itemLis) $li.style["display"] = null;
      };
    };
    const $btnClose = append(create("button", { properties: { innerHTML: `<i class="close"></i>` } }), $topList);
    $btnClose.onclick = close;

    const $list = append(create("ul"), $listBody);

    for (const $option of $options) {
      const $li = create("li");
      const $optionLabel = append(create("label"), $li);
      const $optionCheckbox = append(create("input", { properties: { type: "checkbox", value: $option.value } }), $optionLabel);
      const $optionIcon = append(create("i", { classes: [ "blank" ] }), $optionLabel);
      const $optionText = append(create("span", { properties: { innerText: $option.innerText } }), $optionLabel);
      $optionLabel.title = $option.innerText;

      if ((typeof get($option, "disabled") === "string" && get($option, "disabled") !== "false")) set($optionCheckbox, "disabled", "");
      if ((typeof get($option, "selected") === "string" && get($option, "selected") !== "false")) {
        set($optionCheckbox, "checked", "");
        $optionIcon.className = "accept";
      };

      $optionCheckbox.onchange = () => {
        if ($optionCheckbox.checked) {
          $option.selected = true;
          $optionIcon.className = "accept";
          if (!isMultiple) {
            const $others = Array.from($a(`input[type="checkbox"]:checked`, $list)).filter((x) => x !== $optionCheckbox);
            for (const $other of $others) $other.checked = false;
          };
        } else {
          $option.selected = false;
          $optionIcon.className = "blank";
        };

        setText();
      };
      append($li, $list);
    };

    const $btnList = append(create("div", { classes: [ "button-list" ] }), $listBody);
    const $btnUnselect = append(create("button", { properties: { innerHTML: `<span>전체 해제</span>` } }), $btnList);
    const $btnSelect = append(create("button", { properties: { innerHTML: `<span>전체 선택</span>` } }), $btnList);
    const $btnReset = append(create("button", { properties: { innerHTML: `<span>초기화</span>` } }), $btnList);
    $btnUnselect.onclick = () => {
      const $items = $a(`input[type="checkbox"]`, $list);
      for (const $option of $options) $option.selected = false;
      for (const $checkbox of $items) {
        $checkbox.checked = false;
        $s("i", $checkbox).className = "blank";
      };
      setText();
    };
    $btnSelect.onclick = () => {
      if (!isMultiple) return;
      const $itemsAble = $a(`input[type="checkbox"]:not(:disabled)`, $list);
      const $optionsAble = $a("option:not(:disabled)", $select);
      for (const $option of $optionsAble) $option.selected = true;
      for (const $checkbox of $itemsAble) {
        $checkbox.checked = true;
        $s("i", $checkbox).className = "accept";
      };
      setText();
    };
    $btnReset.onclick = () => {
      const $items = $a(`input[type="checkbox"]`, $list);
      for (const $option of $options) $option.selected = false;
      for (const $checkbox of $items) {
        $checkbox.checked = false;
        $s("i", $checkbox).className = "blank";
      };

      const $itemsOrigin = Array.from($items).filter((x) => $selectedOrigin.map((x) => x.value).includes(x.value));
      for (const $originOption of $selectedOrigin) $originOption.selected = true;
      for (const $originItem of $itemsOrigin) {
        $originItem.checked = true;
        $s("i", $originItem).className = "accept";
      };
      setText();
    };

    const $outer = append(create("div", { classes: [ "outer" ] }), $label);
    
    if (!isMultiple) $btnSelect.style["display"] = "none";
    if (get($label, "nobuttons") !== null) $btnList.style["display"] = "none";
    if (get($label, "nosearch") !== null) $searchLabel.style["display"] = "none";
  };

  // 뷰 모듈 초기화
  for (const partial of $a("partial", target)) {
    const partialType = get(partial, "type");
    const partialSrc = get(partial, "src");
    const partialParent = partial.parentNode;
    
    xhr(partialSrc, {
      load: (data) => {
        if (data.target.status !== 200) {
          error(`Failed to load this partial HTML >>> [${partialType ?? "plain"}]"${partialSrc}"@${partialParent.nodeName} >>> ${data.target.status} ${data.target.statusText}`);
          return;
        };

        const raw = data.target.response;
        const sealed = create("seal", { properties: { innerHTML: raw } });
        init(sealed);

        const partialman = {};
        const partialRunners = $a("script[runner][partial]", sealed);
        for (const runner of partialRunners) initPartialRunner(runner, partialman);

        if (partialType === "window") partialman.windowReserved = master.winman.retrieve(sealed, { parent: partialParent });
        else adjacent(partial, "afterend", ...sealed.children);


        adjacent(partial, "beforebegin", ...$a("link", sealed));

        sealed.remove();
        revoke(partial);
      }
    });
  };

  // 프로젝트명, 버전 정보 텍스트 초기화
  for (const $span of $a("span[LYRA_NAME]", target)) $span.innerText = LYRA_NAME;
  for (const $span of $a("span[LYRA_DISPLAY_NAME]", target)) $span.innerText = LYRA_DISPLAY_NAME;
  for (const $span of $a("span[LYRA_AUTHOR]", target)) $span.innerText = LYRA_AUTHOR;
  for (const $span of $a("span[LYRA_VERSION]", target)) $span.innerText = LYRA_VERSION;
  for (const $span of $a("span[LYRA_DATE]", target)) $span.innerText = LYRA_DATE;

  return target;
};

/**
 * 대상 요소 내부에 정의된 모듈 실행자를 Lyra Engine으로 초기화합니다.
 * @param {HTMLElement} target 대상 요소.
 */
const initRunner = (target) => {
  for (const script of $a("script[runner]", target)) {
    import(script.src).then((x) => {
      x.default(master);
    });
    revoke(script);
  };
};

/**
 * 대상 부분 모듈 실행자를 Lyra Engine으로 초기화합니다.
 * @param {HTMLScriptElement} runner 대상 부분 모듈 실행자.
 * @param {*} partialman 대상 실행자에 제공할 값.
 */
const initPartialRunner = (runner, partialman = null) => {
  import(runner.src).then((x) => {
    x.default(master, partialman);
  });
  revoke(runner);
};

(() => {
  // 패비콘 없으면 기본 아이콘으로 설정
  if (!$(`link[rel="shortcut icon"]`)) {
    append(create("link", {
      properties: {
        rel: "shortcut icon",
        href: "./monat/assets/essentials/favicon-alt.svg",
        type: "image/x-icon"
      }
    }), head);
  };

  // 창 초기화
  master.winman = new LyraWindowManager();
  master.winman.retrieve(root);
  body.addEventListener("pointerdown", (event) => { if($p("window", event.target) === null) for (const node of $a("window[active]")) unset(node, "active"); });

  // 선택 목록 닫기
  const closeSelect = ($label) => {
    const $listBody = $("div.immersive-select-list", $label);
    if (!$label || !$listBody) return;

    unset($label, "expanded");

    $listBody.animate([ { opacity: "0", transform: "translateY(2px) scale(0.99)" } ], { duration: WINDOW_ANIMATION_DURATION, fill: "both", easing: "cubic-bezier(0.02, 0.61, 0.47, 0.99)" });
    $listBody.style["pointer-events"] = "none";
    setTimeout(() => {
      $listBody.style["display"] = "none";

      if ($label.getBoundingClientRect().top > innerHeight / 2) set($label, "listontop", "");
      else unset($label, "listontop");
    }, COMMON_INTERVAL + WINDOW_ANIMATION_DURATION);
  };
  document.addEventListener("pointerdown", (event) => {
    if ($p("label:has(>select)", event.target) === null && !Array.from($a("label:has(>select)")).find((x) => x === event.target)) {
      const $expandedSelects = $a("label[expanded]:has(>select)");
      for (const $label of $expandedSelects) closeSelect($label);
    };
  });

  // 초기화
  init(body);
  initRunner(root);
})();