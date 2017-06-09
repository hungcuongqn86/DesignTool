import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Campaign, Product, DesignService} from '../design.service';
import {Select2OptionData} from 'ng2-select2';
import {DialogService} from 'ng2-bootstrap-modal';
import {ProductdfComponent} from './productdf.component';
import {Cookie} from 'ng2-cookies';
import {Observable} from 'rxjs/Rx';

declare const SVG: any;
const colors: any = {
    white: {
        value: '#ffffff'
    }
};
const imgDir = 'http://cdn.30usd.com/images/';
const campaignCookie = 'campaign_id';
const userid = 'cuongnh';

@Component({
    selector: 'app-launching',
    templateUrl: './launching.component.html',
    styleUrls: ['./launching.component.css']
})
export class LaunchingComponent implements OnInit {
    Product: Product;
    quillOption = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{'size': ['small', false, 'large', 'huge']}],
            [{'color': []}, {'background': []}],
            [{'align': []}],
            ['link', 'image']
        ]
    };
    placeholder = '...';
    options: Select2Options;
    arrDomains: any = [];
    arrCategories: Array<Select2OptionData> = [];
    arrCatValue: string[];
    uri: any = JSON.parse('{"uri":""}');
    url: string;

    draw: any;
    productColor: any;
    productImg: any;
    nested: any;
    arrBase: any = [];
    face = 'front';
    color: any = [];

    constructor(private router: Router, private DesignService: DesignService,
                public Campaign: Campaign, private dialogService: DialogService) {
        this.Campaign.step = 3;
        this.Product = new Product();

        this.Campaign.id = 'z8YcVNt1mvGeFbDK';
        if (Cookie.check(campaignCookie)) {
            this.Campaign.id = Cookie.get(campaignCookie);
        } else {
            // this.router.navigate(['/design']);
        }
        this.getCampaign();
    }

    ngOnInit() {
        this.draw = SVG('drawingLaunching');
        this.productColor = this.draw.rect().fill(colors.white.value);
        this.productImg = this.draw.image();
        this.nested = this.draw.nested();

        this.getDomains();
        this.options = {
            multiple: true
        };
    }

    private getCampaign() {
        this.DesignService.getCampaign(this.Campaign.id).subscribe(
            res => {
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });
                this.Campaign.desc = decodeURIComponent(this.Campaign.desc);
                if (this.Campaign.products.length) {
                    const checkExit = this.Campaign.products.findIndex(x => x.default === true);
                    if (checkExit >= 0) {
                        Object.keys(this.Campaign.products[checkExit]).map((index) => {
                            this.Product[index] = this.Campaign.products[checkExit][index];
                        });
                    }
                }
                const checkS = this.Campaign.url.slice(-1);
                if (checkS !== '/') {
                    this.url = this.Campaign.url + '/';
                    this.Campaign.uri = this.uri.uri;
                }
                if (this.Product.back_view) {
                    this.face = 'back';
                }
                this.color = this.getColor(this.Product.colors);
                this.getBases();
                this.getCategories();
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public getBaseImgUrl(sFace, base: any) {
        return imgDir + base + '_' + sFace + '.png';
    }

    private getColor(arrcolors: any) {
        const index = arrcolors.findIndex(x => x.default === true);
        if (index < 0) {
            return null;
        } else {
            return arrcolors[index];
        }
    }

    public setVisibility(val) {
        this.Campaign.private = val;
    }

    private getDomains() {
        this.DesignService.getDomains().subscribe(
            res => {
                this.arrDomains = res.domains;
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public setDomain(val) {
        const checkS = val.slice(-1);
        if (checkS !== '/') {
            val += '/';
        }
        this.url = val;
        this.Campaign.url = this.url + this.uri.uri;
        this.Campaign.uri = this.uri.uri;
    }

    public suggestion() {
        if (this.Campaign.title !== '') {
            this.DesignService.suggestion(this.Campaign.title).subscribe(
                res => {
                    if (res.available) {
                        this.uri = res;
                        this.Campaign.url = this.url + this.uri.uri;
                        this.Campaign.uri = this.uri.uri;
                    }
                },
                error => {
                    console.error(error.json().message);
                    return Observable.throw(error);
                }
            );
        } else {
            this.uri = JSON.parse('{"url":""}');
            this.Campaign.url = this.url + this.uri.uri;
            this.Campaign.uri = this.uri.uri;
        }
    }

    public checkSuggestion() {
        if (this.uri && this.uri.uri !== '') {
            this.DesignService.checkSuggestion(this.uri.uri).subscribe(
                res => {
                    this.uri = res;
                },
                error => {
                    console.error(error.json().message);
                    return Observable.throw(error);
                }
            );
        } else {
            this.uri = JSON.parse('{"uri":"","available": true}');
        }
    }

    private getCategories() {
        this.DesignService.getCategories(1).subscribe(
            res => {
                this.arrCategories = this.convertCat(res.categories);
                this.arrCatValue = this.Campaign.categories.split(',');
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    private convertCat(arrCat) {
        Object.keys(arrCat).map((index) => {
            arrCat[index]['text'] = arrCat[index].name;
        });
        return arrCat;
    }

    public categoriesSelect(data: { value: string[] }) {
        this.Campaign.categories = data.value.join(',');
    }

    public changeProduct() {
        this.dialogService.addDialog(ProductdfComponent, {
            title: 'Select product'
        })
            .subscribe((product) => {
                this.mergProduct(product);
            });
    }

    private mergProduct(product: any) {
        if (product) {
            Object.keys(this.Campaign.products).map((index) => {
                if (this.Campaign.products[index].id === product.id) {
                    this.Campaign.products[index].default = true;
                    this.Campaign.products[index].back_view = product.back_view;
                    this.Campaign.products[index].colors = product.colors;
                    Object.keys(this.Campaign.products[index]).map((key) => {
                        this.Product[key] = this.Campaign.products[index][key];
                    });
                } else {
                    this.Campaign.products[index].default = false;
                }
            });
            if (this.Product.back_view) {
                this.face = 'back';
            } else {
                this.face = 'front';
            }
            this.color = this.getColor(this.Product.colors);
            this.getBases();
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

    public setView() {
        const myjs = this;
        const maxH = 500;
        const maxW = 400;
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
}
