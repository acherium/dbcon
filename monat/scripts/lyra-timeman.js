// timeman - 시간 관련 모듈 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 내부 변수
const _TIMEZONE_DATA = [
  // 포맷: [ 키, [ 영문, 한글, 오프셋(분) ] ]
  [ "UTC", [ "Coordinated Universal Time", "협정 세계시", 0 ] ],
  // UTC-12:00
  [ "AoE", "Anywhere on Earth", "Anywhere on Earth", 720 ],
  // UTC-11:00
  [ "SST", [ "Samoa Standard Time", "사모아 표준시", 660 ] ],
  // UTC-10:00
  [ "HST", [ "Hawaii-Aleutian Time Zone", "하와이-알류샨 시간대", 600 ] ],
  // UTC-09:00
  [ "AKST", [ "Alaska Time Zone", "알래스카 시간대", 540 ] ],
  // UTC-08:00
  [ "PTZ", [ "Pacific Time Zone", "태평양 표준시", 480 ] ],
  [ "PT", [ "Pacific Time Zone", "태평양 표준시", 480 ] ],
  // UTC-07:00
  [ "MTZ", [ "Mountain Time Zone", "산악 표준시", 420 ] ],
  [ "MT", [ "Mountain Time Zone", "산악 표준시", 420 ] ],
  // UTC-06:00
  [ "CTZ", [ "Central Time Zone", "중부 표준시", 360 ] ],
  [ "CT", [ "Central Time Zone", "중부 표준시", 360 ] ],
  // UTC-05:00
  [ "ETZ", [ "Eastern Time Zone", "동부 표준시", 300 ] ],
  [ "ET", [ "Eastern Time Zone", "동부 표준시", 300 ] ],
  [ "ACT", [ "Acre Time", "아크리 시간", 300 ] ],
  // UTC-04:00
  [ "AMT", [ "Amazon Time", "아마존 시간", 240 ] ],
  [ "AST", [ "Atlantic Standard Time", "대서양 표준시", 240 ] ],
  // UTC-03:00
  [ "BRT", [ "Brazilia Time", "브라질리아 시간", 180 ] ],
  // UTC-02:00
  [ "FNT", [ "Fernando de Noronha Time", "페르난두 지 노로냐 시간", 120 ] ],
  [ "WGT", [ "Western Greenland Time", "서부 그린란드 시간", 120 ] ],
  // UTC-01:00
  [ "AZOT", [ "Azores Time", "아조레스 시간", 60 ] ],
  [ "CVT", [ "Cape Verde Time", "카보베르데 시간", 60 ] ],
  // UTC 00:00
  [ "WET", [ "Western European Time", "서유럽 표준시", 0 ] ],
  [ "GMT", [ "Greenwich Mean Time", "그리니치 표준시", 0 ] ],
  // UTC+01:00
  [ "CET", [ "Central European Time", "중앙 유럽 표준시", -60 ] ],
  [ "WAT", [ "West African Time", "서아프리카 표준시", -60 ] ],
  // UTC+02:00
  [ "EET", [ "Eastern European Time", "동유럽 표준시", -120 ] ],
  [ "SAST", [ "South Africa Standard Time", "남아프리카 표준시", -120 ] ],
  [ "KALT", [ "Kaliningrad Time", "칼리닌그라드 시간대", -120 ] ],
  // UTC+03:00
  [ "MSK", [ "Moscow Time", "모스크바 시간대", -180 ] ],
  [ "TRT", [ "Turkey Time", "튀르키예 표준시", -180 ] ],
  // UTC+03:30
  [ "IRST", [ "Iran Standard Time", "이란 표준시", -210 ] ],
  // UTC+04:00
  [ "SAMT", [ "Samara Time", "사마라 시간대", -240 ] ],
  // UTC+04:30
  [ "AFT", [ "Afghanistan Time", "아프가니스탄 시간", -270 ] ],
  // UTC+05:00
  [ "YEKT", [ "Yekaterinburg Time", "예카테린부르크 시간대", -300 ] ],
  // UTC+05:30
  [ "IST", [ "Indian Standard Time", "인도 표준시", -330 ] ],
  // UTC+05:45
  [ "NPT", [ "Nepal Standard Time", "네팔 표준시", -345 ] ],
  // UTC+06:00
  [ "OMST", [ "Omsk Time", "옴스크 시간대", -360 ] ],
  // UTC+06:30
  [ "MMT", [ "Myanmar Standard Time", "미얀마 표준시", -390 ] ],
  // UTC+07:00
  [ "KRAT", [ "Krasnoyarsk Time", "크라스노야르스크 시간대", -420 ] ],
  // UTC+08:00
  [ "IRKT", [ "Irkutsk Time", "이르쿠츠크 시간대", -480 ] ],
  [ "CST", [ "China Standard Time", "중국 표준시", -480 ] ],
  [ "BJT", [ "Beijing Time", "베이징 시간", -480 ] ],
  [ "AWST", [ "Australian Western Standard Time", "호주 서부 표준시", -480 ] ],
  [ "MST", [ "Macau Standard Time", "마카오 표준시", -480 ] ],
  [ "NST", [ "National Standard Time", "국가표준시", -480 ] ],
  [ "PHST", [ "Philippine Standard Time", "필리핀 표준시", -480 ] ],
  // UTC+08:30
  [ "PYT", [ "Pyongyang Time", "평양 시간", -510 ] ],
  // UTC+09:00
  [ "KST", [ "Korea Standard Time", "한국 표준시", -540 ] ],
  [ "JST", [ "Japan Standard Time", "일본 표준시", -540 ] ],
  [ "YAKT", [ "Yakutsk Time", "야쿠츠크 시간대", -540 ] ],
  // UTC+09:30
  [ "ACST", [ "Australian Central Standard Time", "호주 중부 표준시", -570 ] ],
  // UTC+10:00
  [ "VLAT", [ "Vladivostok Time", "블라디보스토크 시간대", -600 ] ],
  [ "AEST", [ "Australian Eastern Standard Time", "호주 동부 표준시", -600 ] ],
  // UTC+10:30
  [ "LHST", [ "Lord Howe Standard Time", "로드하우 표준시", -630 ] ],
  // UTC+11:00
  [ "MAGT", [ "Magadan Time", "마가단 시간대", -660 ] ],
  [ "SRET", [ "Srednekolymsk Time", "스레드네콜림스크 시간", -660 ] ],
  // UTC+12:00
  [ "PETT", [ "Kamchtka Time", "캄차카 시간대", -720 ] ],
  [ "ANAT", [ "Anadyr Time", "아나디리 시간대", -720 ] ],
  [ "NZST", [ "New Zealand Standard Time", "뉴질랜드 표준시", -720 ] ],
  // UTC+12:45
  [ "CHAST", [ "Chatham Standard Time", "채텀 표준시", -765 ] ],
  // UTC+13:00
  [ "PHOT", [ "Phoenix Island Time", "피닉스 섬 시간", -780 ] ],
  [ "TKT", [ "Tokelau Time", "토켈라우 시간", -780 ] ],
  [ "TOT", [ "Tonga Time", "통가 시간", -780 ] ],
  [ "WST", [ "West Samoa Time", "서사모아 시간", -780 ] ],
  // UTC+14:00
  [ "LINT", [ "Line Islands Time", "라인 제도 시간", -840 ] ]
];

// 변수
/**
 * 시간대 코드입니다.
 */
export const TIMEZONE_CODES = _TIMEZONE_DATA.map((x) => x[0]);

/**
 * 시간대 이름입니다.
 */
export const TIMEZONE_NAMES = Object.fromEntries(_TIMEZONE_DATA.map((x) => [ x[0], { en: x[1][0], ko: x[1][1] } ]));

/**
 * 시간대 오프셋입니다.
 */
export const TIMEZONE_OFFSETS = Object.fromEntries(_TIMEZONE_DATA.map((x) => [ x[0], x[1][2] ]));

/**
 * 시간 표현식 문자 및 메소드입니다.
 */
export const TIME_EXPRESSIONS = {
  // 기본
  "YYYY": (date) => `${date.getFullYear()}`,
  "MM": (date) => `${date.getMonth() + 1}`.padStart(2, "0"),
  "DD": (date) => `${date.getDate()}`.padStart(2, "0"),
  "HH": (date) => `${date.getHours()}`.padStart(2, "0"),
  "hh": (date) => `${date.getHours() / 12 < 1 ? date.getHours() : date.getHours() - 12}`.padStart(2, "0"),
  "mm": (date) => `${date.getMinutes()}`.padStart(2, "0"),
  "ss": (date) => `${date.getSeconds()}`.padStart(2, "0"),
  "ii": (date) => `${date.getMilliseconds()}`,
  "AA": (date) => `${date.getHours() / 12 < 1 ? "AM" : "PM"}`,
  "AK": (date) => `${date.getHours() / 12 < 1 ? "오전" : "오후"}`,
  // 자릿수 채움 없음(쿼티 기준 왼쪽 키)
  "NN": (date) => `${date.getMonth() + 1}`,
  "SS": (date) => `${date.getDate()}`,
  "GG": (date) => `${date.getHours()}`,
  "gg": (date) => `${date.getHours() / 12 < 1 ? date.getHours() : date.getHours() - 12}`,
  "nn": (date) => `${date.getMinutes()}`,
  "aa": (date) => `${date.getSeconds()}`,
};

/**
 * 기본 일시 형식입니다.
 */
export const DEFAULT_TIME_FORMAT_DATETIME = "YYYY-MM-DD HH:mm:ss";

/**
 * 기본 년월일 형식입니다.
 */
export const DEFAULT_TIME_FORMAT_DATE = "YYYY-MM-DD";

/**
 * 기본 시간 형식입니다.
 */
export const DEFAULT_TIME_FORMAT_TIME = "HH:mm:ss";

// 함수
/**
 * 제공된 오프셋 값(분 단위)에 따라 'UTC+HH:MM' 표기를 반환합니다.
 * @param {number} offset 오프셋 값(분 단위).
 * @returns {string}
 */
export const getUTCPlusStr = (offset) => {
  const hours = offset > 0 ? Math.floor(offset / 60) : Math.ceil(offset / 60);
  const minutes = Math.abs(offset - 60 * hours);

  return `UTC${offset === 0 ? " " : offset > 0 ? "+" : "-"}${`${Math.abs(hours)}`.padStart(2, "0")}:${`${minutes}`.padStart(2, "0")}`;
};

/**
 * 제공된 시간값을 문자열로 반환합니다. 시간값을 제공하지 않으면 생성 순간의 날짜와 시간을 기준으로 합니다.
 * @param {*} time UNIX 타임스탬프 시간값.
 * @param {string} format 시간 형식.
 * @returns {string} 시간 문자열.
 */
export const datetime = (time = null, timezone = "KST", format = DEFAULT_TIME_FORMAT_DATETIME) => {
  let date = time === null ? new Date() : new Date(time);
  let result = format;

  date = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
  timezone = timezone || "UTC";

  const timezoneExpressions = {
    "TZC": "",
    "TZE": "",
    "TZK": "",
    "PHM": ""
  };

  if (timezone.constructor === String && TIMEZONE_CODES.includes(timezone)) {
    date = new Date(date.valueOf() - TIMEZONE_OFFSETS[timezone] * 60 * 1000);

    timezoneExpressions["TZC"] = `{{${timezone}}}`;
    timezoneExpressions["TZE"] = `{{${TIMEZONE_NAMES[timezone].en}}}`;
    timezoneExpressions["TZK"] = `{{${TIMEZONE_NAMES[timezone].ko}}}`;
    
    timezoneExpressions["PHM"] = getUTCPlusStr(TIMEZONE_OFFSETS[timezone]);
  } else if (timezone.constructor === Number) {
    date = new Date(date.valueOf() - timezone * 60 * 1000);
    
    timezoneExpressions["PHM"] = getUTCPlusStr(timezone);
  };

  for (const key of Object.keys(timezoneExpressions)) result = result.replace(new RegExp(`(?<!({{)[\w\s]*)(${key})(?![\w\s]*(}}))`, "g"), timezoneExpressions[key]);

  for (const key of Object.keys(TIME_EXPRESSIONS)) result = result.replace(new RegExp(`(?<!({{)[\w\s]*)(${key})(?![\w\s]*(}}))`, "g"), TIME_EXPRESSIONS[key](date));
  
  result = result.replace(/({{)/g, "");
  result = result.replace(/(}})/g, "");

  return result;
};

/**
 * 제공된 시간값을 문자열(년월일)로 반환합니다. 시간값을 제공하지 않으면 생성 순간의 날짜와 시간을 기준으로 합니다.
 * @param {*} time UNIX 타임스탬프 시간값.
 * @returns {string} 시간 문자열(년월일).
 */
export const date = (time = null, timezone = "KST") => datetime(time, timezone, DEFAULT_TIME_FORMAT_DATE);

/**
 * 제공된 시간값을 문자열(시분초)로 반환합니다. 시간값을 제공하지 않으면 생성 순간의 날짜와 시간을 기준으로 합니다.
 * @param {*} time UNIX 타임스탬프 시간값.
 * @returns {string} 시간 문자열(시분초).
 */
export const time = (time = null, timezone = "KST") => datetime(time, timezone, DEFAULT_TIME_FORMAT_TIME);

/**
 * 현재 시간값을 문자열로 반환합니다.
 * @param {string} format 시간 형식.
 * @returns {string} 시간 문자열.
 */
export const now = (timezone = "KST", format = DEFAULT_TIME_FORMAT_DATETIME) => datetime(null, timezone, format);

/**
 * 현재 시간값을 문자열로 반환합니다.
 * @param {string} format 시간 형식.
 * @returns {string} 시간 문자열.
 */
export const nowDate = (timezone = "KST", format = DEFAULT_TIME_FORMAT_DATE) => datetime(null, timezone, format);

/**
 * 현재 시간값을 문자열로 반환합니다.
 * @param {string} format 시간 형식.
 * @returns {string} 시간 문자열.
 */
export const nowTime = (timezone = "KST", format = DEFAULT_TIME_FORMAT_TIME) => datetime(null, timezone, format);