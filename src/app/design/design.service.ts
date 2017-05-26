import {Injectable} from '@angular/core';
import {Response, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {HttpClient} from '../http-client';

@Injectable()
export class Design {
    public face = 'front';
    public img: any;

    constructor() {
    }
}

@Injectable()
export class Product {
    public base: any;
    public face = 'front';
    public color;
    public colors: any = [];
    public designs: Array<Design> = [];

    constructor() {
    }

    public getDesigns(face) {
        const arrReturn = [];
        for (let i = 0; i < this.designs.length; i++) {
            if (this.designs[i].face === face) {
                arrReturn.push(this.designs[i]);
            }
        }
        return arrReturn;
    }

    public getOpt(sFace) {
        let opt: any = [];
        if (sFace === 'front') {
            opt = {
                minX: Number(this.base.printable.front_left)
                , minY: Number(this.base.printable.front_top)
                , maxX: Number(this.base.printable.front_left) + Number(this.base.printable.front_width)
                , maxY: Number(this.base.printable.front_top) + Number(this.base.printable.front_height)
            };
        } else {
            opt = {
                minX: Number(this.base.printable.back_left)
                , minY: Number(this.base.printable.back_top)
                , maxX: Number(this.base.printable.back_left) + Number(this.base.printable.back_width)
                , maxY: Number(this.base.printable.back_top) + Number(this.base.printable.back_height)
            };
        }
        return opt;
    }

    public getHeight(sFace) {
        if (sFace === 'front') {
            return this.base.printable.front_height;
        } else {
            return this.base.printable.back_height;
        }
    }

    public getWidth(sFace) {
        if (sFace === 'front') {
            return this.base.printable.front_width;
        } else {
            return this.base.printable.back_width;
        }
    }

    public getTop(sFace) {
        if (sFace === 'front') {
            return this.base.printable.front_top;
        } else {
            return this.base.printable.back_top;
        }
    }

    public getLeft(sFace) {
        if (sFace === 'front') {
            return this.base.printable.front_left;
        } else {
            return this.base.printable.back_left;
        }
    }

    public getPrintablePoint(sFace) {
        let opt: any = [];
        if (sFace === 'front') {
            opt = [[Number(this.base.printable.front_left), Number(this.base.printable.front_top)],
                [Number(this.base.printable.front_left), Number(this.base.printable.front_top) + Number(this.base.printable.front_height)],
                [Number(this.base.printable.front_left) + Number(this.base.printable.front_width),
                    Number(this.base.printable.front_top) + Number(this.base.printable.front_height)],
                [Number(this.base.printable.front_left) + Number(this.base.printable.front_width)
                    , Number(this.base.printable.front_top)],
                [Number(this.base.printable.front_left), Number(this.base.printable.front_top)]
            ];
        } else {
            opt = [[Number(this.base.printable.back_left), Number(this.base.printable.back_top)],
                [Number(this.base.printable.back_left), Number(this.base.printable.back_top) + Number(this.base.printable.back_height)],
                [Number(this.base.printable.back_left) + Number(this.base.printable.back_width),
                    Number(this.base.printable.back_top) + Number(this.base.printable.back_height)],
                [Number(this.base.printable.back_left) + Number(this.base.printable.back_width)
                    , Number(this.base.printable.back_top)],
                [Number(this.base.printable.back_left), Number(this.base.printable.back_top)]
            ];
        }
        return opt;
    }

    public addDesign(Design: Design) {
        this.designs.push(Design);
    }

    public deleteDesign(Design: Design) {
        for (let i = 0; i < this.designs.length; i++) {
            if ((this.designs[i].face === Design.face) && (this.designs[i].img.attr('id') === Design.img.attr('id'))) {
                this.designs.splice(i, 1);
                return true;
            }
        }
        return false;
    }
}

@Injectable()
export class Products {
    static instance: Products;
    public data: Array<Product> = [];
    public index = 0;

    constructor() {
        return Products.instance = Products.instance || this;
    }

    public add(Product: Product) {
        this.data.push(Product);
        this.index = this.data.indexOf(Product);
    }

    public edit(Product: Product) {
        this.data[this.index] = Product;
    }

    public delete(id) {
        for (let index = 0; index < this.data.length; index++) {
            if (this.data[index].base.id === id) {
                console.log(this.data[index]);
                this.data.splice(index, 1);
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
