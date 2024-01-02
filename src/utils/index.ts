export const NUMBER_REGEX = /^\d+$/g;
export const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/im;
export const CHARACTERS_REGEX = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/gim;
export const VIETNAMESE_REGEX =
  /Â|Ã|È|É|Ê|Ì|Í|Ò|Ó|Ô|Õ|Ù|Ú|Ă|Đ|Ĩ|Ũ|Ơ|à|á|â|ã|è|é|ê|ì|í|ò|ó|ô|õ|ù|ú|ă|đ|ĩ|ũ|ơ|Ư|Ă|Ạ|Ả|Ấ|Ầ|Ẩ|Ẫ|Ậ|Ắ|Ằ|Ẳ|Ẵ|Ặ|Ẹ|Ẻ|Ẽ|Ề|Ề|Ể|Ế|ư|ă|ạ|ả|ấ|ầ|ẩ|ẫ|ậ|ắ|ằ|ẳ|ẵ|ặ|ẹ|ẻ|ẽ|ề|ề|ể|ế|Ễ|Ệ|Ỉ|Ị|Ọ|Ỏ|Ố|Ồ|Ổ|Ỗ|Ộ|Ớ|Ờ|Ở|Ỡ|Ợ|Ụ|Ủ|Ứ|Ừ|ễ|ệ|ỉ|ị|ọ|ỏ|ố|ồ|ổ|ỗ|ộ|ớ|ờ|ở|ỡ|ợ|ụ|ủ|ứ|ừ|Ử|Ữ|Ự|Ỳ|Ỵ|Ý|Ỷ|Ỹ|ử|ữ|ự|ỳ|ỵ|ỷ|ỹ/gim;

export function isNull(obj: any): boolean {
  return obj === undefined || obj === null;
}

export function isString(obj: any): boolean {
  return typeof obj === 'string' || obj instanceof String;
}

export function isNumber(obj: any): boolean {
  return typeof obj === 'number' || obj instanceof Number;
}

export function isStringNumber(obj: any): boolean {
  return isString(obj) && NUMBER_REGEX.test(obj);
}

export function isStringEmpty(str: string | null | undefined): boolean {
  return isNull(str) || str === '';
}

export function isArrayEmpty(obj: any[]): boolean {
  return isNull(obj) || obj.length === 0;
}

export function isEmailValid(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isSpecialCharacters(str: string): boolean {
  return CHARACTERS_REGEX.test(str);
}

export function isVietnameseTones(str: string): boolean {
  return VIETNAMESE_REGEX.test(str);
}

export function removeVietnameseTones(str: string) {
  if (isStringEmpty(str)) {
    return '';
  }

  str = str?.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str?.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str?.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str?.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str?.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str?.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str?.replace(/đ/g, 'd');
  str = str?.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str?.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str?.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str?.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str?.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str?.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str?.replace(/Đ/g, 'D');
  // Some system encode vietnamese combining accent as individual utf-8 characters

  // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str?.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  str = str?.replace(/\u02C6|\u0306|\u031B/g, '');
  // Remove extra spaces
  str = str?.replace(/ + /g, ' ');
  str = str?.trim();
  // Remove punctuations
  str = str?.replace(
    /!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|\.|:|;|'|"|&|#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' '
  );

  return str;
}
