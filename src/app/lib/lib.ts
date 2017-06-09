import {Cookie} from 'ng2-cookies';
import * as config from '../lib/const';

export class DsLib {
    constructor() {
    }

    public setToken(res: any) {
        const cookval = JSON.stringify({
            id: res.id,
            user_id: res.user_id
        });
        const cookieName = btoa(config.cookie_tokens);

        const dateString = res.expire,
            reggie = /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
            [, year, month, day, hours, minutes, seconds] = reggie.exec(dateString);
        const expires = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
        Cookie.set(cookieName, btoa(cookval), expires, '/');
    }

    public getToken(): any {
        const cookieName = btoa(config.cookie_tokens);
        const tk = Cookie.get(cookieName);
        return JSON.parse(atob(tk));
    }

    public checkLogin(): boolean {
        const cookieName = btoa(config.cookie_tokens);
        if (Cookie.check(cookieName)) {
            return true;
        } else {
            return false;
        }
    }

    public removeToken() {
        const cookieName = btoa(config.cookie_tokens);
        Cookie.delete(cookieName, '/');
    }

    public genCampaignDetailUrl(uri: string): string {
        return config.campaign_url + `?campaign=${uri}`;
    }

    public getBaseImgUrl(sFace, base: any) {
        return config.imgDir + base + '_' + sFace + '.png';
    }

    public getCampaignId() {
        const cookieName = config.campaignCookie;
        if (Cookie.check(cookieName)) {
            return Cookie.get(cookieName);
        } else {
            return '';
        }
    }

    public removeCampaign() {
        Cookie.delete(config.campaignCookie, '/', config.domail);
    }
}
