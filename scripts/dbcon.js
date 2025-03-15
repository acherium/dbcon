import { $, $a, create, append, copy, get, COMMON_INTERVAL } from "../monat/module.js";

export default function(master) {
  const meta = {
    length: 0,
    interval: 0,
    name: ""
  };
  const metaOrigin = copy(meta);
  const options = {
    area: {
      width: 200,
      height: 200
    },
    output: {
      width: 200,
      height: 200
    },
    position: {
      x: 0,
      y: 0
    },
    grid: {
      x: 2,
      y: 1
    },
    animation: {
      interval: 0
    }
  };
  const optionsOrigin = copy(options);

  const listener = new EventTarget();
  let loadedData = [];
  let isChanged = false;

  const $boxLoading = $("#loading-screen");

  const $uploader = $("#uploader");
  const $preview = $("#preview");
  const $previewImageCtn = $("#preview-image-container");
  const $previewGridCtn = $("#preview-grid-container");
  const $btnUpload = $("#button-upload");
  const $chkTglGrid = $("#checkbox-toggle-grid");
  const $chkTglFit = $("#checkbox-toggle-auto-fit");

  const doAutoFit = () => {
    const $img = $("img", $previewImageCtn);
    if (!$img) return;

    const $checker = new Image();
    $checker.onload = () => {
      const width = $checker.width;
      const height = $checker.height;

      options.area.width = Math.floor(width / options.grid.x);
      options.area.height = Math.floor(height / options.grid.y);

      if (options.area.width > options.area.height) options.area.width = options.area.height;
      else if (options.area.width < options.area.height) options.area.height = options.area.width;

      if (height > options.area.height) {
        const diff = height - options.area.height * options.grid.y;
        options.position.y = Math.floor(diff / 2);
      };
      if (width > options.area.width) {
        const diff = width - options.area.width * options.grid.x;
        options.position.x = Math.floor(diff / 2);
      };

      refreshInputOptions();
      if ($chkTglGrid.checked) refreshGrid();
    };
    $checker.src = $img.src;
  };
  
  $uploader.onchange = () => {
    const file = $uploader.files[0];
    const reader = new FileReader();
    
    reader.readAsDataURL(file);
    reader.onload = () => {
      isChanged = true;
      const $img = create("img", { properties: { src: reader.result } });
      $previewImageCtn.textContent = "";
      for (const $node of $a(".placeholder", $preview)) $node.remove();
      append($img, $previewImageCtn);

      if ($chkTglGrid.checked) refreshGrid();
      if ($chkTglFit.checked) doAutoFit();
      
      for (const [ key, value ] of Object.entries(metaOrigin)) meta[key] = value;
      loadedData = [];

      const name = file.name.split(".");
      name.pop();
      meta.name = name.join(".");
    };
  };
  
  $btnUpload.onclick = () => $uploader.click();

  const refreshGrid = () => {
    const $prev = $("div", $previewGridCtn);
    if ($prev) $prev.remove();
    if (!$("img", $previewImageCtn)) return;

    const $grid = append(create("div", { properties: { style: `left: ${options.position.x}px; top: ${options.position.y}px;` } }), $previewGridCtn);
    for (let y = 0; y < options.grid.y; y++) {
      const $row = append(create(), $grid);
      for (let x = 0; x < options.grid.x; x++) {
        const $column = append(create("div", { properties: { style: `width: ${options.area.width}px; height: ${options.area.height}px;` } }), $row);
      };
    };
  };

  $chkTglGrid.onchange = () => {
    if ($chkTglGrid.checked) {
      $previewGridCtn.style["display"] = null;
      refreshGrid();
    } else {
      $previewGridCtn.style["display"] = "none";
    };
  };
  $previewGridCtn.style["display"] = $chkTglGrid.checked ? null : "none";
  
  const $outputBox = $("#output-box");
  let $output = $("#output");
  const $btnGenerate = $("#button-generate");
  const $btnRefresh = $("#button-refresh");

  $btnGenerate.onclick = () => {
    $boxLoading.style["display"] = null;
    const $origin = $("img", $previewImageCtn);
    if (!$origin) return;
    loadedData = [];

    const frameSets = [];
    $output.textContent = "";

    for (let y = 0; y < options.grid.y; y++) {
      const $row = append(create("div", { attributes: { y: y } }), $output);
      frameSets[y] = [];

      for (let x = 0; x < options.grid.x; x++) {
        const frameSet = {
          x: x,
          y: y,
          images: []
        };

        frameSets[y][x] = frameSet;
      };
    };

    gifFrames({ url: $origin.src, frames: "all", outputType: "canvas", cumulative: true }).then((data) => {
      meta.length = data.length;
      meta.interval = data[0].frameInfo.delay;
      if (isChanged) {
        options.animation.interval = meta.interval;
        refreshInputOptions();
      };

      for (const frame of data) {
        const $origin = frame.getImage();
        const originCtx = $origin.getContext("2d");

        const $renderer = create("canvas");
        $renderer.width = options.area.width;
        $renderer.height = options.area.height;
        const rendererCtx = $renderer.getContext("2d");

        const $canvas = create("canvas");
        $canvas.width = options.output.width;
        $canvas.height = options.output.height;
        const ctx = $canvas.getContext("2d");

        for (let y = 0; y < options.grid.y; y++) {
          for (let x = 0; x < options.grid.x; x++) {
            const posX = (options.position.x + options.area.width * x);
            const posY = (options.position.y + options.area.height * y);

            const partial = originCtx.getImageData(posX, posY, options.area.width, options.area.height);
            rendererCtx.putImageData(partial, 0, 0);
            ctx.drawImage($renderer, 0, 0, options.output.width, options.output.height);

            frameSets[y][x].images.push($canvas.toDataURL());
          };
        };
      };

      for (let y = 0; y < options.grid.y; y++) {
        for (let x = 0; x < options.grid.x; x++) {
          const $row = $(`div[y="${y}"]`, $output);
          const frameSet = frameSets[y][x];
  
          gifshot.createGIF({
            gifWidth: options.output.width,
            gifHeight: options.output.height,
            images: frameSet.images,
            interval: options.animation.interval/100
          }, (result) => {
            const $column = create("div", { classes: [ "output-item" ], properties: { style: `order: ${frameSet.x}; width: ${options.output.width}px; height: ${options.output.height}px;` } });
            const $img = create("img", { properties: { src: result.image }, attributes: { loading: "lazy", x: x, y: y } });
  
            append($img, $column);

            loadedData.push({
              row: $row,
              column: $column
            });
            listener.dispatchEvent(new Event("loaded"));
          });
        };
      };
    });
  };

  listener.addEventListener("loaded", () => {
    if (loadedData.length !== options.grid.x * options.grid.y) return;

    for (const data of loadedData) {
      append(data.column, data.row);
      isChanged = false;
      $boxLoading.style["display"] = "none";
    };
  });

  document.addEventListener("click", (event) => {
    const $checker = $a(".output-item");
    if (!Array.from($checker).find((x) => x === event.target)) return;

    const $img = $("img", event.target);

    const $temp = create("a");
    const date = Date.now();
    const filename = `${meta.name}-${get($img, "y")}-${get($img, "x")}-${date}.gif`;
    append($temp);

    $temp.href = $img.src;
    $temp.download = filename;
    $temp.click();
    $temp.remove();
  });

  const $btnDownloadAll = $("#button-download-all");
  $btnDownloadAll.onclick = () => {
    const $imgs = $a(".output-item > img");
    for (const $img of $imgs) {
      const $temp = create("a");
      const date = Date.now();
      const filename = `${meta.name}-${get($img, "y")}-${get($img, "x")}-${date}.gif`;
      append($temp);
  
      $temp.href = $img.src;
      $temp.download = filename;
      $temp.click();
      $temp.remove();
    };
  };

  const $inputOptions = {
    area: {
      width: $("#input-area-width"),
      height: $("#input-area-height")
    },
    output: {
      width: $("#input-output-width"),
      height: $("#input-output-height")
    },
    position: {
      x: $("#input-position-x"),
      y: $("#input-position-y")
    },
    grid: {
      x: $("#input-grid-x"),
      y: $("#input-grid-y")
    },
    animation: {
      interval: $("#input-animation-interval")
    }
  };
  for (const [ x, category ] of Object.entries($inputOptions)) {
    for (const [ y, $input ] of Object.entries(category)) {
      $input.value = options[x][y];

      $input.onchange = () => {
        const value = parseInt($input.value);
        if (!Number.isNaN(value)) {
          options[x][y] = value;
          $input.value = value;
        } else {
          $input.value = options[x][y];
        };
        refreshGrid();
      };
    };
  };

  const refreshInputOptions = () => {
    for (const [ x, category ] of Object.entries($inputOptions)) {
      for (const [ y, $input ] of Object.entries(category)) {
        $input.value = options[x][y];
      };
    };
  };
};