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
    uri: any = JSON.parse('{"url":""}');
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
                }
                if (this.Product.back_view) {
                    this.face = 'back';
                }
                this.color = this.getColor(this.color, this.Product.colors);
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
    }

    public suggestion() {
        if (this.Campaign.title !== '') {
            this.DesignService.suggestion(this.Campaign.title).subscribe(
                res => {
                    if (res.available) {
                        this.uri = res;
                        this.Campaign.url = this.url + this.uri.uri;
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
        }
    }

    public checkSuggestion() {
        if (this.uri !== '') {
            this.DesignService.checkSuggestion(this.uri).subscribe(
                res => {
                    console.log(res.uri);
                },
                error => {
                    console.error(error.json().message);
                    return Observable.throw(error);
                }
            );
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
            this.color = this.getColor(this.color, this.Product.colors);
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
            const tl: number = Number((loader.width / loader.height).toFixed(2));
            let rsW: number = loader.width;
            let rsH: number = loader.height;
            if (rsH > maxH) {
                rsH = maxH;
                rsW = Number((rsH * tl).toFixed(2));
                if (rsW > maxW) {
                    rsW = maxW;
                    rsH = Number((rsW / tl).toFixed(2));
                }
            }
            myjs.draw.size(rsW, rsH);
            myjs.productImg.size(rsW, rsH);
            myjs.productColor.size(rsW, rsH);
            const zoom = Number((rsW / myjs.Product.base.image.width).toFixed(2));
            // myjs.genDesign(zoom);
        });
        if (this.color) {
            this.productColor.fill(this.color.value);
        }
    }
}
