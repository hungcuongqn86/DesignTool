import {Component, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {NgModel} from '@angular/forms';
import {Design, Product, Campaign, DesignService} from '../design.service';
import {ProductComponent} from './product.component';
import {ColorComponent} from './color.component';
import {DialogService} from 'ng2-bootstrap-modal';
import {Cookie} from 'ng2-cookies';

import {Observable} from 'rxjs/Rx';

declare const SVG: any;
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
    arrBase: any = [];
    fDesign: any = JSON.parse('{"sBaseType":"","file":""}');
    draw: any;
    nested: any;
    productColor: any;
    productImg: any;
    printable: any;
    line: any;
    selectItem: any;
    dsrsSave: any;
    filetype = '';

    loadconflic = false;

    constructor(private location: Location, public Campaign: Campaign,
                private DesignService: DesignService, private dialogService: DialogService) {
        this.Campaign.step = 1;
        this.Product = new Product();
        let id = 'z8YcVNt1mvGeFbDK';
        if (Cookie.check(campaignCookie)) {
            id = Cookie.get(campaignCookie);
        }
        this.location.go('/design/' + id);
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
        this.line = this.draw.line(0, 0, 0, 0).stroke({color: 'rgb(35, 173, 228)', width: 1}).opacity(0);
        this.getBaseTypes();
    }

    private initCampaign(id, user) {
        this.DesignService.initCampaign(id, user).subscribe(
            res => {
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });
                if (this.Campaign.products.length) {
                    const checkExit = this.Campaign.products.findIndex(x => x.id === this.Product.id);
                    if (checkExit < 0) {
                        Object.keys(this.Campaign.products[0]).map((index) => {
                            this.Product[index] = this.Campaign.products[0][index];
                        });
                    } else {
                        Object.keys(this.Campaign.products[checkExit]).map((index) => {
                            this.Product[index] = this.Campaign.products[checkExit][index];
                        });
                    }
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

    private getCampaign() {
        this.DesignService.getCampaign(this.Campaign.id).subscribe(
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

    private reActionUpdateDesign() {
        this.dsrsSave.product_id = this.Product.id;
        this.DesignService.updateDesign(this.dsrsSave).subscribe(
            () => {
                this.getCampaign();
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
        this.dsrsSave = null;
    }

    private updateCampaign() {
        this.DesignService.updateCampaign(this.Campaign).subscribe(
            res => {
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });

                const productIndex = this.Campaign.hasBase(this.Product.base.id);
                Object.keys(this.Campaign.products[productIndex]).map((index) => {
                    this.Product[index] = this.Campaign.products[productIndex][index];
                });
                if (this.dsrsSave) {
                    this.reActionUpdateDesign();
                } else {
                    this.selectProduct(this.Product);
                }
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
            (data) => {
                const img = data;
                img.campaign_id = this.Campaign.id;
                img.product_id = this.Product.id;
                img.image.printable_top = 0;
                img.image.printable_left = 0;
                img.image.printable_width = this.Product.getWidth(this.face);
                img.image.printable_height = (img.image.printable_width * img.image.height / img.image.width).toFixed(2);
                if (img.image.printable_height > this.Product.getHeight(this.face)) {
                    img.image.printable_height = this.Product.getHeight(this.face);
                    img.image.printable_width = (img.image.printable_height * img.image.width / img.image.height).toFixed(2);
                }
                this.DesignService.updateDesign(img).subscribe(
                    () => {
                        this.initCampaign(this.Campaign.id, userid);
                    },
                    error => {
                        console.error(error.json().message);
                        this.initCampaign(this.Campaign.id, userid);
                        return Observable.throw(error);
                    }
                );
                this.form['controls']['filePicker'].reset();
            },
            error => {
                this.form['controls']['filePicker'].reset();
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public selectBaseType() {
        this.getBases();
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

    private getColor(color: any, arrcolors: any) {
        if (color) {
            if (arrcolors.length) {
                const index = arrcolors.findIndex(x => x.id === color.id);
                if (index < 0) {
                    return arrcolors[0];
                } else {
                    return color;
                }
            } else {
                return null;
            }
        } else {
            if (arrcolors.length) {
                return arrcolors[0];
            } else {
                return null;
            }
        }
    }

    public _selectBase(base: any) {
        this.Product.base = base;
        const productIndex = this.Campaign.hasBase(base.id);
        if (productIndex >= 0) {
            if ((this.Product.base.id !== this.Campaign.products[productIndex].base.id)) {
                Object.keys(this.Campaign.products[productIndex]).map((index) => {
                    this.Product[index] = this.Campaign.products[productIndex][index];
                });
                this.selectProduct(this.Product);
            }
        } else {
            this.Product.colors = [];
        }
        this.setFace(this.face);
        this.color = this.getColor(this.color, this.Product.colors);
        if (!this.color) {
            this.color = this.getColor(this.color, this.Product.base.colors);
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
        const opt = this.Product.getOpt(this.face);
        const lX = opt.minX + ((opt.maxX - opt.minX) / 2);
        this.line.plot(lX, 0, lX, this.Product.base.image.height);
    }

    private resizeImg(img: any, dsrsold: any) {
        const optnew = this.Product.getOpt(this.face);
        const optold = this.getOldOpt();
        const dsrs = this.Campaign.products[0].designs.filter(function (itm) {
            return itm.id === dsrsold.id;
        })[0];
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
        img.move(optnew.minX + mx, optnew.minY + my).size(mW, mH);
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
        this.nested.image(dsrs.image.url)
            .loaded(function () {
                this.id = dsrs.id;
                myobj.resizeImg(this, dsrs);
            })
            .click(function () {
                myobj.resetSelect();
                const opt = myobj.Product.getOpt(myobj.face);
                this.selectize().resize({
                    constraint: opt
                }).draggable(opt);
                myobj.selectItem = this;
            })
            .on('delete', function () {
                myobj.deleteImg();
            })
            .on('dragstart', function () {
                myobj.line.animate(100, '-', 0).attr({opacity: 1});
            })
            .on('dragend', function () {
                myobj.line.animate(100, '-', 0).attr({opacity: 0});
                myobj.updateDesign(this, dsrs);
            })
            .on('resizedone', function () {
                myobj.updateDesign(this, dsrs);
            });
    }

    private updateDesign(image: any, dsrs: any) {
        const ds = new Design();
        delete ds.image.data;
        delete ds.image.mime_type;
        ds.id = dsrs.id;
        ds.campaign_id = this.Campaign.id;
        ds.product_id = this.Product.id;
        ds.type = dsrs.type;
        ds.image.id = dsrs.image.id;
        ds.image.position = dsrs.image.position;
        ds.image.width = dsrs.image.width;
        ds.image.height = dsrs.image.height;
        ds.image.printable_top = (image.y() - this.printable.y()).toFixed(2);
        ds.image.printable_left = (image.x() - this.printable.x()).toFixed(2);
        ds.image.printable_width = image.width().toFixed(2);
        ds.image.printable_height = image.height().toFixed(2);
        if (this.Campaign.hasBase(this.Product.base.id) >= 0) {
            this.DesignService.updateDesign(ds).subscribe(
                () => {
                    this.getCampaign();
                },
                error => {
                    console.error(error.json().message);
                    this.initCampaign(this.Campaign.id, userid);
                    return Observable.throw(error);
                }
            );
        } else {
            delete ds.product_id;
            this.dsrsSave = ds;
        }
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
            () => {
                this.initCampaign(this.Campaign.id, userid);
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
                    this._addProduct();
                }
            });
    }

    public selectProduct(Product) {
        this.Product.id = Product.id;
        this.Product.base = Product.base;
        this.Product.colors = Product.colors;
        if (this.loadconflic) {
            if (this.Product.base.type_id) {
                this.fDesign.sBaseType = this.Product.base.type_id;
            } else {
                this.fDesign.sBaseType = this.Product.base.type.id;
            }
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
