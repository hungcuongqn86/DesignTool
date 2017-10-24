import {Cookie} from 'ng2-cookies';
import * as config from './const';

import {addDays, format} from 'date-fns';

declare const moment: any;

export class DsLib {
  static getToken = () => JSON.parse(atob(Cookie.get(btoa(config.cookie_tokens))));
  static setToken = res => DsLib.setCookie(config.cookie_tokens, JSON.stringify({id: res.id}), res.expire);
  static checkLogin = (): boolean => Cookie.check(btoa(config.cookie_tokens));
  static checkSession = () => Cookie.check('session_id');
  static getSession = () => Cookie.get('session_id');
  static removeToken = () => Cookie.delete(btoa(config.cookie_tokens), '/');
  static getBaseImgUrl = (sFace, base: any) => sFace ? base.image[sFace] : '';
  static removeCampaign = domail => Cookie.delete(config.campaignCookie, '/', domail);
  static getColorDefault = () => config.colorsDefault.white.value;

  static getProfile(): any {
    const tk = Cookie.get('user_email');
    return (tk && tk !== '') ? tk : null;
  }

  static setCookie(cookieName, cookval, expire_time) {
    const dateString = expire_time,
      reggie = /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
      [, year, month, day, hours, minutes, seconds] = reggie.exec(dateString),
      expires = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
    Cookie.set(btoa(cookieName), btoa(cookval), expires, '/');
  }

  static imageExists(url, callback) {
    const img = new Image();
    img.onload = function () {
      callback(true);
    };
    img.onerror = function () {
      callback(false);
    };
    img.src = url;
  }

  static getPrice(ds: any, base: any, config: any): number {
    let res: number;
    const type = [];
    for (const item of ds) {
      if (!type.includes(item.type)) {
        type.push(item.type);
      }
    }
    res = Number(base.price);
    if (type.length === 1) {
      res = res + Number(config['product.one.side.printing.price']);
    }
    if (type.length === 2) {
      res = res + Number(config['product.two.sides.printing.price']);
    }
    return res;
  }

  static getCampaignId = () => Cookie.check(config.campaignCookie) ? Cookie.get(config.campaignCookie) : '';

  static getTimeLength(): Array<any> {
    moment.tz.setDefault('America/New_York');
    const res: Array<any> = [];
    for (const itemtime of config.timeLength) {
      const nday = moment().add(itemtime - 1, 'day'), item: any = [];
      nday.hour(23);
      nday.minute(0);
      nday.seconds(0);
      item.number = itemtime;
      item.format = nday.format('YYYYMMDDTHHmmss') + 'Z';
      item.view = nday.format('dddd, MMMM Do YYYY, h:mm:ss a z');
      res.push(item);
    }
    return res;
  }

  static convert2select(arrData, key) {
    if (arrData && arrData.length) {
      Object.keys(arrData).map((index) => {
        arrData[index]['text'] = arrData[index][key];
      });
    }
    return arrData;
  }

  constructor() {
  }
}
