import {Cookie} from 'ng2-cookies';
import * as config from '../lib/const';

export class DsLib {
    constructor() {
    }

    public getToken(): string {
        const cookieName = btoa(config.cookie_tokens);
        const tk = Cookie.get(cookieName);
        return atob(tk);
    }
}
