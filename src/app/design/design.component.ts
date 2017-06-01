import {Component, OnInit, ViewChild} from '@angular/core';
import {NgModel} from '@angular/forms';
import {Design, Product, Campaign, DesignService} from './design.service';
import {ProductComponent} from './product.component';
import {ColorComponent} from './color.component';
import {DialogService} from 'ng2-bootstrap-modal';
import {Cookie} from 'ng2-cookies';

import {Observable} from 'rxjs/Rx';

declare const SVG: any;
declare const key: any;
const imgDir = 'http://cdn.30usd.com/images/';
const colors: any = {
    white: {
        value: '#ffffff'
    }
};
const campaignCookie = 'campaign_id';
const userid = 'cuongnh';

@Component({
    selector: 'app-design',
    templateUrl: './design.component.html',
    styleUrls: ['./design.component.css']
})
export class DesignComponent implements OnInit {
    @ViewChild('form1') form: NgModel;
    face = 'front';
    color = null;
    Product: Product;
    arrBaseTypes: any = [];
    BaseTypeGroup: any;
    arrBase: any = [];
    fDesign: any = JSON.parse('{"sBaseType":"","file":""}');
    draw: any;
    nested: any;
    productColor: any;
    productImg: any;
    printable: any;
    selectItem: any;
    filetype = '';

    loadconflic = false;

    constructor(public Campaign: Campaign, private DesignService: DesignService, private dialogService: DialogService) {
        this.Product = new Product();
        let id = 'RcSX3ZZfo96uRJ2F';
        if (Cookie.check(campaignCookie)) {
            id = Cookie.get(campaignCookie);
        }
        this.initCampaign(id, userid);
    }

    ngOnInit() {
        const myobj = this;
        this.draw = SVG('drawing');
        this.productColor = this.draw.rect().fill(colors.white.value);
        this.productImg = this.draw.image().click(function () {
            myobj.resetSelect();
        });
        this.printable = this.draw.polyline().fill('none').stroke({color: 'rgba(0, 0, 0, 0.3)', width: 1});
        this.nested = this.draw.nested();
        this.getBaseTypes();
        key('delete', function () {
            myobj.deleteImg();
        });
    }

    private initCampaign(id, user) {
        this.DesignService.initCampaign(id, user).subscribe(
            res => {
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });
                if (this.Campaign.products.length) {
                    Object.keys(this.Campaign.products[0]).map((index) => {
                        this.Product[index] = this.Campaign.products[0][index];
                    });
                    this.selectProduct(this.Product);
                } else {
                    this.loadconflic = true;
                }
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    private updateCampaign() {
        this.DesignService.updateCampaign(this.Campaign).subscribe(
            res => {
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    private getBaseTypes() {
        this.DesignService.getBaseTypes().subscribe(
            data => {
                this.arrBaseTypes = data;
                if (this.arrBaseTypes.length) {
                    if (this.loadconflic) {
                        if (this.Product.base.type_id) {
                            this.fDesign.sBaseType = this.Product.base.type_id;
                        } else {
                            this.fDesign.sBaseType = this.arrBaseTypes[0].base_types[0].id;
                        }
                        this.selectBaseType();
                    } else {
                        this.loadconflic = true;
                    }
                }
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

    public handleFileSelect(evt) {
        const files = evt.target.files;
        const file = files[0];

        if (files && file) {
            this.filetype = file.type;
            const reader = new FileReader();
            reader.onload = this._handleReaderLoaded.bind(this);
            reader.readAsBinaryString(file);
        }
    }

    private _handleReaderLoaded(readerEvt) {
        const binaryString = readerEvt.target.result;
        const newDesign = new Design();
        newDesign.product_id = this.Product.id;
        newDesign.type = this.face;
        newDesign.image.position = this.Product.designs.length + 1;
        newDesign.image.mime_type = this.filetype;
        newDesign.image.data = btoa(binaryString);
        this.DesignService.addDesign(newDesign).subscribe(
            res => {
                this.addImg(res);
                this.form['controls']['filePicker'].reset();
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public selectBaseType() {
        this.getBases();
    }

    private getBaseTypeGroup() {
        for (let i = 0; i < this.arrBaseTypes.length; i++) {
            const arrBaseType: any = this.arrBaseTypes[i].base_types;
            for (let j = 0; j < arrBaseType.length; j++) {
                if (arrBaseType[j].id === this.Product.base.type_id) {
                    return this.arrBaseTypes[i];
                }
            }
        }
        return [];
    }

    private getBases() {
        this.DesignService.getBases(this.fDesign.sBaseType).subscribe(
            data => {
                this.arrBase = data;
                if (this.Product.base) {
                    this.selectBase(this.Product.base.id);
                } else {
                    if (this.arrBase.length > 0) {
                        this.selectBase(this.arrBase[0].id);
                    }
                }
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public selectBase(id) {
        for (let i = 0; i < this.arrBase.length; i++) {
            const value = this.arrBase[i].id;
            if (value === id) {
                this._selectBase(this.arrBase[i]);
            }
        }
    }

    public _selectBase(base: any) {
        this.Product.base = base;
        this.setFace(this.face);
        if (this.color) {
            if (this.Product.base.colors) {
                const index = this.Product.base.colors.findIndex(x => x.id === this.color.id);
                if (index < 0) {
                    this.color = this.Product.base.colors[0];
                }
            } else {
                this.color = null;
            }
        } else {
            this.color = null;
            if (this.Product.base.colors) {
                this.color = this.Product.base.colors[0];
            }
        }
        this.setColor(this.color);
        this.setSize();
    }

    private setSize() {
        this.draw.size(this.Product.base.image.width, this.Product.base.image.height);
        this.productImg.size(this.Product.base.image.width, this.Product.base.image.height);
        this.productColor.size(this.Product.base.image.width, this.Product.base.image.height);
    }

    public setFace(face) {
        this.face = face;
        this.productImg.load(this.getBaseImgUrl(this.face, this.Product.base.id));
        this.genDesign();
        this.setPrintable();
    }

    private resetSelect() {
        const nestedElement = this.nested.children();
        Object.keys(nestedElement).map((index) => {
            if (nestedElement[index].type === 'image') {
                nestedElement[index].selectize(false, {deepSelect: true});
            }
        });
        this.selectItem = null;
    }

    private setPrintable() {
        this.printable.clear();
        this.printable.plot(this.Product.getPrintablePoint(this.face));
        this.setPosition(this.Product.getOpt(this.face));
    }

    private setPosition(opt: any) {
        const myobj = this;
        for (let i = 0; i < this.nested.length; i++) {
            const img = this.nested[i];
            console.log(img);

            /*const tlX = (opt.maxX - opt.minX) / (img.printableConf.maxX - img.printableConf.minX);
             const tlY = (opt.maxY - opt.minY) / (img.printableConf.maxY - img.printableConf.minY);
             const mx = (img.x() - img.printableConf.minX) * tlX;
             const my = (img.y() - img.printableConf.minY) * tlY;

             let mW = img.width() * tlX;
             let mH = 0;
             if (opt.minX + mx + mW <= opt.maxX) {
             mH = mW * img.height() / img.width();
             } else {
             mW = opt.maxX - (opt.minX + mx);
             mH = mW * img.height() / img.width();
             }

             if (opt.minY + my + mH <= opt.maxY) {
             img.move(opt.minX + mx, opt.minY + my).size(mW, mH);
             } else {
             mH = opt.maxY - (opt.minY + my);
             mW = mH * img.width() / img.height();
             img.move(opt.minX + mx, opt.minY + my).size(mW, mH);
             }*/

            img.selectize(false, {deepSelect: true}).draggable(false);
            img.click(function () {
                myobj.resetSelect();
                this.selectize().resize({
                    constraint: opt
                }).draggable(opt);
                myobj.selectItem = this;
            });

            img.printableConf = opt;
            this.Product.designs[i] = img;
        }
    }

    public setColor(sColor: any) {
        if (sColor) {
            this.color = sColor;
            this.productColor.fill(sColor.value);
        } else {
            this.productColor.fill(colors.white.value);
        }
    }

    public changeColor(sColor: any) {
        this.color = sColor;
    }

    public addImg(dsrs: any) {
        const myobj = this;
        const printw = this.Product.getWidth(this.face);
        const printh = this.Product.getHeight(this.face);
        const opt = this.Product.getOpt(this.face);
        const image = this.nested.image(dsrs.image.url)
            .loaded(function (loader) {
                if (printw < loader.width) {
                    let mwidth = printw;
                    let mheight = loader.height * mwidth / loader.width;
                    if (mheight <= printh) {
                        this.size(mwidth, mheight);
                    } else {
                        mheight = printh;
                        mwidth = loader.width * mheight / loader.height;
                        this.size(mwidth, mheight);
                    }
                } else {
                    if (printh < loader.height) {
                        const mheight = printh;
                        const mwidth = loader.width * mheight / loader.height;
                        this.size(mwidth, mheight);
                    }
                }
            })
            .move(this.Product.getLeft(this.face), this.Product.getTop(this.face))
            .click(function () {
                myobj.resetSelect();
                this.selectize().resize({
                    constraint: opt
                }).draggable(opt);
                myobj.selectItem = this;
            })
            .on('dragend', function (e) {
                myobj.updateCampaign();
            })
            .on('resizedone', function (e) {
                myobj.updateCampaign();
            });
        image.id = dsrs.id;
    }

    public selectLayer(leyer: any) {
        const opt = this.Product.getOpt(this.face);
        this.resetSelect();
        leyer.selectize().resize({
            constraint: opt
        }).draggable(opt);
        this.selectItem = leyer;
    }

    public deleteImg() {
        if (this.selectItem) {
            this.deleteLayer(this.selectItem);
        }
    }

    public deleteLayer(leyer: any) {
        this.DesignService.deleteDesign(leyer, this.Campaign.id).subscribe(
            res => {
                console.log(res);
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public _addProduct() {
        const newProduct = new Product();
        newProduct.base.id = this.Product.base.id;
        let color: any;
        if (this.color) {
            if (this.Product.base.colors) {
                const index = this.Product.base.colors.findIndex(x => x.id === this.color.id);
                if (index < 0) {
                    if (this.Product.base.colors.length) {
                        color = this.Product.base.colors[0];
                    }
                } else {
                    color = this.color;
                }
            }
        } else {
            if (newProduct.base.colors) {
                color = this.Product.base.colors[0];
            }
        }
        newProduct.position = this.Campaign.products.length + 1;
        if (color) {
            newProduct.colors.push({id: color.id});
        }
        this.Campaign.add(newProduct);
        this.updateCampaign();
        this.setColor(newProduct.colors[0]);
    }

    public addProduct() {
        this.dialogService.addDialog(ProductComponent, {
            title: 'Select product'
        })
            .subscribe((product) => {
                if (product) {
                    this.Product.base = product;
                    this.BaseTypeGroup = this.getBaseTypeGroup();
                    this._addProduct();
                    this._selectBase(this.Product.base);
                }
            });
    }

    public selectProduct(Product) {
        this.Product.base = Product.base;
        if (this.loadconflic) {
            this.fDesign.sBaseType = this.Product.base.type_id;
            this.selectBaseType();
        } else {
            this.loadconflic = true;
        }
    }

    private genDesign() {
        this.nested.clear();
        Object.keys(this.Product.designs).map((index) => {
            if (this.Product.designs[index].type === this.face) {
                this.addImg(this.Product.designs[index]);
            }
        });
    }

    public deleteProduct(id) {
        const count = this.Campaign.products.length;
        this.Campaign.deletePro(id);
        if (count > 1) {
            const check = this.Campaign.products.findIndex(x => x.base.id === this.Product.base.id);
            if (check < 0) {
                this.selectProduct(this.Campaign.products[0]);
            }
        } else {
            this.resetDs();
        }
        this.updateCampaign();
    }

    private resetDs() {
        this.nested.clear();
        this.Product.colors = [];
        this.fDesign.sBaseType = this.arrBaseTypes[0].base_types[0].id;
        this.selectBaseType();
    }

    public addColor(oProduct: Product) {
        this.dialogService.addDialog(ColorComponent, {
            oProduct: oProduct
        }).subscribe(() => {
            this.updateCampaign();
        });
    }
}
