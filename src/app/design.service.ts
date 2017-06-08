import {Injectable} from '@angular/core';
import {Response, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {HttpClient} from './http-client';

const apiUrl = './psp/api/v1/';  // URL to web api
const aspApiUrl = './asp/api/v1/';  // URL to web api
const sFaceDf = 'front';

@Injectable()
export class Design {
    public id;
    public campaign_id;
    public product_id;
    public type = sFaceDf;
    public img: any;
    public image: any = JSON.parse('{"position":"","mime_type":"","data":""}');

    constructor() {
    }
}

@Injectable()
export class Product {
    public id;
    public position;
    public base: any = JSON.parse('{"id":""}');
    public colors: Array<any> = [];
    public designs: Array<any> = [];
    public default = false;
    public back_view = false;

    constructor() {
    }

    public getOpt(sFace) {
        if (sFace === sFaceDf) {
            return {
                minX: Number(this.base.printable.front_left)
                , minY: Number(this.base.printable.front_top)
                , maxX: Number(this.base.printable.front_left) + Number(this.base.printable.front_width)
                , maxY: Number(this.base.printable.front_top) + Number(this.base.printable.front_height)
            };
        } else {
            return {
                minX: Number(this.base.printable.back_left)
                , minY: Number(this.base.printable.back_top)
                , maxX: Number(this.base.printable.back_left) + Number(this.base.printable.back_width)
                , maxY: Number(this.base.printable.back_top) + Number(this.base.printable.back_height)
            };
        }
    }

    public getHeight(sFace) {
        if (sFace === sFaceDf) {
            return this.base.printable.front_height;
        } else {
            return this.base.printable.back_height;
        }
    }

    public getWidth(sFace) {
        if (sFace === sFaceDf) {
            return this.base.printable.front_width;
        } else {
            return this.base.printable.back_width;
        }
    }

    public getTop(sFace) {
        if (sFace === sFaceDf) {
            return this.base.printable.front_top;
        } else {
            return this.base.printable.back_top;
        }
    }

    public getLeft(sFace) {
        if (sFace === sFaceDf) {
            return this.base.printable.front_left;
        } else {
            return this.base.printable.back_left;
        }
    }

    public getPrintablePoint(sFace) {
        if (sFace === sFaceDf) {
            return [[Number(this.base.printable.front_left), Number(this.base.printable.front_top)],
                [Number(this.base.printable.front_left), Number(this.base.printable.front_top) + Number(this.base.printable.front_height)],
                [Number(this.base.printable.front_left) + Number(this.base.printable.front_width),
                    Number(this.base.printable.front_top) + Number(this.base.printable.front_height)],
                [Number(this.base.printable.front_left) + Number(this.base.printable.front_width)
                    , Number(this.base.printable.front_top)],
                [Number(this.base.printable.front_left), Number(this.base.printable.front_top)]
            ];
        } else {
            return [[Number(this.base.printable.back_left), Number(this.base.printable.back_top)],
                [Number(this.base.printable.back_left), Number(this.base.printable.back_top) + Number(this.base.printable.back_height)],
                [Number(this.base.printable.back_left) + Number(this.base.printable.back_width),
                    Number(this.base.printable.back_top) + Number(this.base.printable.back_height)],
                [Number(this.base.printable.back_left) + Number(this.base.printable.back_width)
                    , Number(this.base.printable.back_top)],
                [Number(this.base.printable.back_left), Number(this.base.printable.back_top)]
            ];
        }
    }
}

@Injectable()
export class Campaign {
    public id;
    public title;
    public step = 1;
    public private;
    public url;
    public fb_pixel;
    public categories;
    public products: Array<Product> = [];

    constructor() {
    }

    public add(Product: Product) {
        this.products.push(Product);
    }

    public deletePro(id) {
        for (let index = 0; index < this.products.length; index++) {
            if (this.products[index].base.id === id) {
                this.products.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    public hasBase(id) {
        for (let index = 0; index < this.products.length; index++) {
            if (this.products[index].base.id === id) {
                return index;
            }
        }
        return -1;
    }
}

@Injectable()
export class DesignService {
    constructor(private http: HttpClient) {
    }

    initCampaign(id, userid): any {
        if (id !== '') {
            return this.getCampaign(id);
        } else {
            return this.createCampaign(userid);
        }
    }

    updateCampaign(campaign: Campaign) {
        const url = apiUrl + `campaigns/` + campaign.id;
        const body = JSON.stringify(campaign);
        return this.http.put(url, body).map((res: Response) => res.json());
    }

    private createCampaign(userid): any {
        const url = apiUrl + `campaigns`;
        const body = JSON.stringify({user_id: userid});
        return this.http.post(url, body).map((res: Response) => res.json());
    }

    getCampaign(id): any {
        const url = apiUrl + `campaigns/` + id;
        return this.http.get(url).map((res: Response) => res.json());
    }

    getBaseTypes(): any {
        const url = apiUrl + `base_groups`;
        return this.http.get(url).map((res: Response) => res.json().base_groups);
    }

    getBases(type_id): any {
        const url = apiUrl + `bases`;
        const params: URLSearchParams = new URLSearchParams();
        params.set('type_id', type_id);
        return this.http.get(url, {search: params}).map((res: Response) => res.json().bases);
    }

    addDesign(Design: Design) {
        const url = apiUrl + `designs`;
        const body = JSON.stringify({product_id: Design.product_id, type: Design.type, image: Design.image});
        return this.http.post(url, body).map((res: Response) => res.json());
    }

    updateDesign(Design: Design) {
        const url = apiUrl + `designs/` + Design.id;
        const body = JSON.stringify(Design);
        return this.http.put(url, body).map((res: Response) => res.json());
    }

    deleteDesign(Design: Design, cpId) {
        const url = apiUrl + `designs/` + Design.id + '?campaign_id=' + cpId;
        return this.http.delete(url).map((res: Response) => res.json());
    }

    getDomains(): any {
        const url = apiUrl + `domains`;
        return this.http.get(url).map((res: Response) => res.json());
    }

    getCategories(visible) {
        const url = apiUrl + `categories`;
        const params: URLSearchParams = new URLSearchParams();
        params.set('visible', visible);
        return this.http.get(url).map((res: Response) => res.json());
    }

    suggestion(suggestion: string): any {
        const url = apiUrl + `uri`;
        const params: URLSearchParams = new URLSearchParams();
        params.set('suggestion', suggestion);
        return this.http.get(url, {search: params}).map((res: Response) => res.json());
    }

    checkSuggestion(uri: string): any {
        const url = apiUrl + `uri`;
        const params: URLSearchParams = new URLSearchParams();
        params.set('check', uri);
        return this.http.get(url, {search: params}).map((res: Response) => res.json());
    }

    accRegister(acc: any) {
        const url = aspApiUrl + `users`;
        const body = JSON.stringify(acc);
        return this.http.post(url, body).map((res: Response) => res.json());
    }

    accLogin(acc: any) {
        const url = aspApiUrl + `tokens`;
        const body = JSON.stringify(acc);
        return this.http.post(url, body).map((res: Response) => res.json());
    }

    getProfile(tk: any) {
        const url = aspApiUrl + `tokens/${tk.id}`;
        const params: URLSearchParams = new URLSearchParams();
        params.set('scope', 'profile');
        return this.http.get(url, {search: params}).map((res: Response) => res.json());
    }

    accLogout(tk: any) {
        const url = aspApiUrl + `tokens/${tk.id}`;
        return this.http.delete(url).map((res: Response) => res.json());
    }
}
