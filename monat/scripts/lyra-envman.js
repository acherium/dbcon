// envman - 환경 변수 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 모듈 정보 변수 초기화
export const LYRA_NAME = "Project Lyra";
export const LYRA_DISPLAY_NAME = "Monat Engine";
export const LYRA_AUTHOR = "Acherium";
export const LYRA_CONTACT = "acherium@pm.me";
export const LYRA_VERSION = "2000";
export const LYRA_DATE = "25-04-25";

// 기본 변수 초기화
export const COMMON_INTERVAL = 30;
export const ANIMATION_INTERVAL = 30;
export const TOOLTIP_DURATION = 10000;
export const TOOLTIP_ANIMATION_DURATION = 150;
export const WINDOW_ANIMATION_DURATION = 150;
export const WINDOW_ANIMATION_DURATION_LONG = 500;
export const WINDOW_ANIMATION_TIMING_FUNCTION = "cubic-bezier(0.02, 0.61, 0.47, 0.99)";
export const DEFAULT_NOTIFICATION_DURATION = 5000;
export const DEFAULT_IMAGE_SLIDER_INTERVAL = 5000;
export const DEFAULT_IMAGE_SLIDER_DURATION = 500;
export const MINIMUM_WINDOW_WIDTH = 100;
export const MINIMUM_WINDOW_HEIGHT = 100;
export const DEFAULT_WINDOW_WIDTH = 600;
export const DEFAULT_WINDOW_HEIGHT = 400;
export const DEFAULT_WINDOW_X = 10;
export const DEFAULT_WINDOW_Y = 10;
export const DRAG_SCROLLING_THRESHOLD = 50;
export const POSITION_PARAMETERS = [ "start", "center", "end", "pixel" ];
export const SIZE_PARAMETERS = [ "min-content", "fit-content", "max-content", "pixel" ];
export const PANEL_DIRECTION_PARAMETERS = [ "left", "right", "top", "bottom", "center" ];
export const PANEL_DIRECTION_VALUE = {
  "left": "translateX(-2px)",
  "right": "translateX(2px)",
  "top": "translateY(-2px)",
  "bottom": "translateY(2px)",
  "center": "translateY(2px)"
};
export const CONTEXT_MENU_DIRECTION_PARAMETERS = [ "left", "right", "bottom", "top", "mouse" ];
export const CONTEXT_MENU_PADDING = 6;
export const DEFAULT_PANZONE_STEPS = 0.1;
export const DEFAULT_PANZONE_MIN = 0.1;
export const DEFAULT_PANZONE_MAX = 2;
export const TOOLTIP_PADDING = 4;
export const TOOLTIP_OFFSET = 10;
export const COLOR_MODE = [ "RGB", "HSL" ];
export const HEX_REGEX = new RegExp("^([0-9a-fA-F]{8})$");
export const DEFAULT_TOAST_DURATION = 3000;