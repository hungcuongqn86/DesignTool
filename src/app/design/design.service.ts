import {Injectable} from '@angular/core';
import {Response, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {HttpClient} from '../http-client';

const sFaceDf = 'front';

@Injectable()
export class Design {
    public group;
    public face = sFaceDf;
    public img: any;

    constructor() {
    }
}

@Injectable()
export class Product {
    public id;
    public position;
    public base: any;
    public colors: Array<any> = [];
    public designs: Array<Design> = [];

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
export class Designs {
    static instance: Designs;
    public data: Array<Design> = [];
    public index = 0;

    constructor() {
        return Designs.instance = Designs.instance || this;
    }

    public add(Design: Design) {
        this.data.push(Design);
        this.index = this.data.indexOf(Design);
    }

    public getByface(face) {
        const arrReturn = [];
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].face === face) {
                arrReturn.push(this.data[i]);
            }
        }
        return arrReturn;
    }

    public deleteImg(Design: Design) {
        for (let i = 0; i < this.data.length; i++) {
            if ((this.data[i].face === Design.face) && (this.data[i].img.attr('id') === Design.img.attr('id'))) {
                this.data.splice(i, 1);
                return true;
            }
        }
        return false;
    }
}

@Injectable()
export class Campaign {
    static instance: Campaign;
    public id;
    public products: Array<Product> = [];

    constructor() {
        return Campaign.instance = Campaign.instance || this;
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
                return true;
            }
        }
        return false;
    }
}

@Injectable()
export class DesignService {
    private apiUrl = './api/v1/';  // URL to web api

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
        const url = this.apiUrl + `campaigns/` + campaign.id;
        const body = JSON.stringify(campaign);
        return this.http.put(url, body).map((res: Response) => res.json());
    }

    private createCampaign(userid): any {
        const url = this.apiUrl + `campaigns`;
        const body = JSON.stringify({user_id: userid});
        return this.http.post(url, body).map((res: Response) => res.json());
    }

    private getCampaign(id): any {
        const url = this.apiUrl + `campaigns/` + id;
        return this.http.get(url).map((res: Response) => res.json());
    }

    getBaseTypes(): any {
        const url = this.apiUrl + `base_groups`;
        return this.http.get(url).map((res: Response) => res.json().base_groups);
    }

    getBases(type_id): any {
        const url = this.apiUrl + `bases`;
        const params: URLSearchParams = new URLSearchParams();
        params.set('type_id', type_id);
        return this.http.get(url, {search: params}).map((res: Response) => res.json().bases);
    }
}
