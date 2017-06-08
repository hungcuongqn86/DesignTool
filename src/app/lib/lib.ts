import {Cookie} from 'ng2-cookies';
import * as config from '../lib/const';

export class DsLib {
    constructor() {
    }

    public setToken(res): boolean {
        const cookval = JSON.stringify({
            id: res.id,
            user_id: res.user_id
        });
        const cookieName = btoa(config.cookie_tokens);
        Cookie.set(cookieName, btoa(cookval));
        return true;
    }

    public getToken(): string {
        const cookieName = btoa(config.cookie_tokens);
        const tk = Cookie.get(cookieName);
        return JSON.parse(atob(tk));
    }
}
