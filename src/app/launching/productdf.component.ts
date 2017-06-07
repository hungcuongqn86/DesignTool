import {Component, OnInit} from '@angular/core';
import {Cookie} from 'ng2-cookies';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import {Campaign, Product, DesignService} from '../design.service';

import {Observable} from 'rxjs/Rx';

export interface PromptModel {
    title;
}

declare const SVG: any;
const colors: any = {
    white: {
        value: '#ffffff'
    }
};
const imgDir = 'http://cdn.30usd.com/images/';
const campaignCookie = 'campaign_id';

@Component({
    templateUrl: './productdf.component.html',
    styleUrls: ['./productdf.component.css']
})
export class ProductdfComponent extends DialogComponent<PromptModel, string> implements PromptModel, OnInit {
    title;
    status = 'baseType';
    Product: Product;
    color: any = [];
    arrBaseTypes: any = [];
    baseType: any = [];
    arrBase: any = [];
    face = 'front';

    draw: any;
    productColor: any;
    productImg: any;
    nested: any;

    constructor(public Campaign: Campaign, dialogService: DialogService, private DesignService: DesignService) {
        super(dialogService);
        this.Product = new Product();
        this.Campaign.id = 'z8YcVNt1mvGeFbDK';
        if (Cookie.check(campaignCookie)) {
            this.Campaign.id = Cookie.get(campaignCookie);
        }
        this.getCampaign();
    }

    ngOnInit() {
        this.draw = SVG('drawing');
        this.productColor = this.draw.rect().fill(colors.white.value);
        this.productImg = this.draw.image();
        this.nested = this.draw.nested();
    }

    private getCampaign() {
        this.DesignService.getCampaign(this.Campaign.id).subscribe(
            res => {
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });
                if (this.Campaign.products.length) {
                    const checkExit = this.Campaign.products.findIndex(x => x.default === true);
                    if (checkExit >= 0) {
                        Object.keys(this.Campaign.products[checkExit]).map((index) => {
                            this.Product[index] = this.Campaign.products[checkExit][index];
                        });
                    }
                }
                if (this.Product.back_view) {
                    this.face = 'back';
                }

                this.color = this.getColor(this.color, this.Product.colors);
                const index = this.Product.colors.findIndex(x => x.id === this.color.id);
                if (index >= 0) {
                    this.Product.colors[index].default = true;
                }
                this.getBases();
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public setView() {
        const myjs = this;
        const maxH = 320;
        const maxW = 320;
        this.productImg.load(this.getBaseImgUrl(this.face, this.Product.base.id)).loaded(function (loader) {
            const tl: number = (loader.width / loader.height);
            let rsW: number = loader.width;
            let rsH: number = loader.height;
            if (rsH > maxH) {
                rsH = maxH;
                rsW = rsH * tl;
                if (rsW > maxW) {
                    rsW = maxW;
                    rsH = rsW / tl;
                }
            }
            myjs.draw.size(rsW, rsH);
            myjs.productImg.size(rsW, rsH);
            myjs.productColor.size(rsW, rsH);
            const zoom = (rsW / myjs.Product.base.image.width);
            myjs.genDesign(zoom);
        });
        if (this.color) {
            this.productColor.fill(this.color.value);
        }
    }

    private genDesign(zoom) {
        this.nested.clear();
        Object.keys(this.Product.designs).map((index) => {
            if (this.Product.designs[index].type === this.face) {
                this.addImg(this.Product.designs[index], zoom);
            }
        });
    }

    public addImg(dsrs: any, zoom) {
        const myobj = this;
        this.nested.image(dsrs.image.url)
            .loaded(function () {
                this.id = dsrs.id;
                myobj.resizeImg(this, dsrs, zoom);
            });
    }

    private resizeImg(img: any, dsrs: any, zoom) {
        const optnew = this.Product.getOpt(this.face);
        const optold = this.getOldOpt();
        const tlX: number = (optnew.maxX - optnew.minX) / (optold.maxX - optold.minX);
        const tlY: number = (optnew.maxY - optnew.minY) / (optold.maxY - optold.minY);
        const mx: number = dsrs.image.printable_left * tlX;
        const my: number = dsrs.image.printable_top * tlY;
        let mW = dsrs.image.printable_width * tlX;
        let mH = 0;
        if (optnew.minX + mx + mW <= optnew.maxX) {
            mH = mW * dsrs.image.height / dsrs.image.width;
        } else {
            mW = optnew.maxX - (optnew.minX + mx);
            mH = mW * dsrs.image.height / dsrs.image.width;
        }

        if (optnew.minY + my + mH > optnew.maxY) {
            mH = optnew.maxY - (optnew.minY + my);
            mW = mH * dsrs.image.width / dsrs.image.height;
        }
        img.move((optnew.minX + mx) * zoom, (optnew.minY + my) * zoom).size(mW * zoom, mH * zoom);
    }

    private getOldOpt(): any {
        for (let index = 0; index < this.Campaign.products.length; index++) {
            const check = this.Campaign.products[index].designs.findIndex(x => x.main === true);
            if (check >= 0) {
                const product = new Product();
                product.base = this.Campaign.products[index].base;
                return product.getOpt(this.face);
            }
        }
        return [];
    }

    public getBaseImgUrl(sFace, base: any) {
        return imgDir + base + '_' + sFace + '.png';
    }

    public setFace(face) {
        this.face = face;
        this.Product.back_view = (face === 'back');
        this.setView();
    }

    public selectProduct(Product) {
        this.Product.id = Product.id;
        this.Product.base = Product.base;
        this.Product.colors = Product.colors;
        this.color = this.getColor(this.color, this.Product.colors);
        const index = this.Product.colors.findIndex(x => x.id === this.color.id);
        if (index >= 0) {
            this.Product.colors[index].default = true;
        }
        this.getBases();
    }

    public changeColor(sColor: any) {
        this.color = sColor;
        const index = this.Product.colors.findIndex(x => x.id === this.color.id);
        if (index >= 0) {
            this.Product.colors[index].default = true;
        }
    }

    private getColor(color: any, arrcolors: any) {
        if (arrcolors.length) {
            const check = arrcolors.findIndex(x => x.id === color.id);
            if (check < 0) {
                const index = arrcolors.findIndex(x => x.default === true);
                if (index < 0) {
                    return arrcolors[0];
                } else {
                    return arrcolors[index];
                }
            } else {
                return arrcolors[check];
            }
        } else {
            return null;
        }
    }

    private getBases() {
        this.DesignService.getBases(this.Product.base.type_id).subscribe(
            data => {
                this.arrBase = data;
                this.selectBase(this.Product.base.id);
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    private selectBase(id) {
        for (let i = 0; i < this.arrBase.length; i++) {
            const value = this.arrBase[i].id;
            if (value === id) {
                this._selectBase(this.arrBase[i]);
            }
        }
    }

    private _selectBase(base: any) {
        this.Product.base = base;
        this.setView();
    }

    public mdClose() {
        this.close();
    }

    public confirm(product) {
        this.result = product;
        this.close();
    }
}
