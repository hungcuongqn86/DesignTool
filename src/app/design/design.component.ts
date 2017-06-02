import {Component, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
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
    arrBase: any = [];
    fDesign: any = JSON.parse('{"sBaseType":"","file":""}');
    draw: any;
    nested: any;
    productColor: any;
    productImg: any;
    printable: any;
    line: any;
    selectItem: any;
    filetype = '';

    loadconflic = false;

    constructor(private location: Location, public Campaign: Campaign,
                private DesignService: DesignService, private dialogService: DialogService) {
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
            () => {
                this.initCampaign(this.Campaign.id, userid);
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
        this.setPosition(opt);
    }

    private resizeImg(optold: any, optnew: any, img: any) {
        const tlX = (optnew.maxX - optnew.minX) / (optold.maxX - optold.minX);
        const tlY = (optnew.maxY - optnew.minY) / (optold.maxY - optold.minY);
        const mx = (img.x() - optnew.minX) * tlX;
        const my = (img.y() - optnew.minY) * tlY;

        let mW = img.width() * tlX;
        let mH = 0;
        if (optnew.minX + mx + mW <= optnew.maxX) {
            mH = mW * img.height() / img.width();
        } else {
            mW = optnew.maxX - (optnew.minX + mx);
            mH = mW * img.height() / img.width();
        }

        if (optnew.minY + my + mH <= optnew.maxY) {
            img.move(optnew.minX + mx, optnew.minY + my).size(mW, mH);
        } else {
            mH = optnew.maxY - (optnew.minY + my);
            mW = mH * img.width() / img.height();
            img.move(optnew.minX + mx, optnew.minY + my).size(mW, mH);
        }
    }

    private getOldOpt() {

    }

    private setPosition(opt: any) {
        const myobj = this;
        for (let i = 0; i < this.nested.length; i++) {
            const img = this.nested[i];
            console.log(img);


            const tlX = (opt.maxX - opt.minX) / (img.printableConf.maxX - img.printableConf.minX);
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
            }


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
        const printw = Number(this.Product.getWidth(this.face));
        const printh = Number(this.Product.getHeight(this.face));
        const opt = this.Product.getOpt(this.face);
        const image = this.nested.image(dsrs.image.url)
            .loaded(function (loader) {
                const imgX = Number(myobj.printable.x()) + Number(dsrs.image.printable_left);
                const imgY = Number(myobj.printable.y()) + Number(dsrs.image.printable_top);
                this.move(imgX, imgY);
                const imgW = Number(dsrs.image.printable_width);
                const imgH = Number(dsrs.image.printable_height);
                if (printw < imgW) {
                    let mwidth = printw;
                    let mheight = imgH * mwidth / imgW;
                    if (mheight <= printh) {
                        this.size(mwidth, mheight);
                    } else {
                        mheight = printh;
                        mwidth = imgW * mheight / imgH;
                        this.size(mwidth, mheight);
                    }
                } else {
                    if (printh < imgH) {
                        const mheight = printh;
                        const mwidth = imgW * mheight / imgH;
                        this.size(mwidth, mheight);
                    } else {
                        this.size(imgW, imgH);
                    }
                }
            })
            .click(function () {
                myobj.resetSelect();
                this.selectize().resize({
                    constraint: opt
                }).draggable(opt);
                myobj.selectItem = this;
            })
            .on('delete', function (e) {
                myobj.deleteImg();
            })
            .on('dragstart', function (e) {
                myobj.line.animate(100, '-', 0).attr({opacity: 1});
            })
            .on('dragend', function (e) {
                myobj.line.animate(100, '-', 0).attr({opacity: 0});
                myobj.updateDesign(image, dsrs);
            })
            .on('resizedone', function (e) {
                myobj.updateDesign(image, dsrs);
            });
        image.id = dsrs.id;
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
        this.DesignService.updateDesign(ds).subscribe(
            () => {
            },
            error => {
                console.error(error.json().message);
                this.initCampaign(this.Campaign.id, userid);
                return Observable.throw(error);
            }
        );
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
                    this._selectBase(this.Product.base);
                }
            });
    }

    public changeProduct(Product) {
        this.Product.id = Product.id;
        this.initCampaign(this.Campaign.id, userid);
    }

    private selectProduct(Product) {
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
