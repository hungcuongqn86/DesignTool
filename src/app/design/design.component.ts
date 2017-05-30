import {Component, OnInit, ViewChild} from '@angular/core';
import {NgModel} from '@angular/forms';
import {Design, Designs, Product, Campaign, DesignService} from './design.service';
import {ProductComponent} from './product.component';
import {ColorComponent} from './color.component';
import {DialogService} from 'ng2-bootstrap-modal';
import {Cookie} from 'ng2-cookies';

import {Observable} from 'rxjs/Rx';

declare const SVG: any;
declare const key: any;

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
    productColor: any;
    productImg: any;
    printable: any;
    selectItem: any;
    filetype = '';

    constructor(public Campaign: Campaign, public Designs: Designs,
                private DesignService: DesignService, private dialogService: DialogService) {
        // const check: boolean = Cookie.check(campaignCookie);
        const check = true;
        if (!check) {
            this.DesignService.createCampaign(userid).subscribe(
                res => {
                    // this.campaign = res;
                },
                error => {
                    console.error(error.json().message);
                    return Observable.throw(error);
                }
            );
        } else {
            // const id = Cookie.get(campaignCookie);
            const id = 'RcSX3ZZfo96uRJ2F';
            this.DesignService.getCampaign(id).subscribe(
                res => {
                    // this.campaign = res;
                    console.log(res);
                },
                error => {
                    console.error(error.json().message);
                    return Observable.throw(error);
                }
            );
        }
        this.Product = new Product();
    }

    ngOnInit() {
        const myobj = this;
        this.draw = SVG('drawing');
        this.productColor = this.draw.rect().fill(colors.white.value);
        this.productImg = this.draw.image().click(function () {
            myobj.resetSelect();
        });
        this.printable = this.draw.polyline().fill('none').stroke({color: 'rgba(0, 0, 0, 0.3)', width: 1});
        this.getBaseTypes();
        key('delete', function () {
            myobj.deleteImg();
        });
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
        this.addImg(this.filetype, btoa(binaryString));
        this.form['controls']['filePicker'].reset();
    }

    private getBaseTypes() {
        this.DesignService.getBaseTypes().subscribe(
            data => {
                this.arrBaseTypes = data;
                if (this.arrBaseTypes.length) {
                    const arrBaseType: any = this.arrBaseTypes[0].base_types;
                    if (arrBaseType.length) {
                        this.fDesign.sBaseType = arrBaseType[0].id;
                        this.selectBaseType();
                    }
                }
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public selectBaseType() {
        this.setBaseTypeGroup();
        this.getBases();
    }

    private setBaseTypeGroup() {
        for (let i = 0; i < this.arrBaseTypes.length; i++) {
            const arrBaseType: any = this.arrBaseTypes[i].base_types;
            for (let j = 0; j < arrBaseType.length; j++) {
                if (arrBaseType[j].id === this.fDesign.sBaseType) {
                    this.BaseTypeGroup = this.arrBaseTypes[i];
                    return true;
                }
            }
        }
    }

    private getBaseTypeGroup() {
        for (let i = 0; i < this.arrBaseTypes.length; i++) {
            const arrBaseType: any = this.arrBaseTypes[i].base_types;
            for (let j = 0; j < arrBaseType.length; j++) {
                if (arrBaseType[j].id === this.Product.base.type.id) {
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
                if (this.arrBase.length > 0) {
                    const baseid = this.arrBase[0].id;
                    this.selectBase(baseid);
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

    private _selectBase(base: any) {
        this.Product.base = base;
        this.Product.group = this.BaseTypeGroup.id;
        this.setSize();
        this.setFace(this.face);
        if (this.color) {
            if (this.Product.base.colors) {
                const index = this.Product.base.colors.indexOf(this.color);
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
    }

    private setSize() {
        this.draw.size(this.Product.base.image.width, this.Product.base.image.height);
        this.productColor.size(this.Product.base.image.width, this.Product.base.image.height);
    }

    public setFace(face) {
        this.face = face;
        if (face === 'front') {
            this.productImg.load(this.Product.base.image.front);
        } else {
            this.productImg.load(this.Product.base.image.back);
        }
        this.setPrintable();
        this.resetSelect();
        this.setDesigns();
    }

    private setDesigns() {
        Object.keys(this.Designs.data).map((index) => {
            if (this.Designs.data[index].face === this.face) {
                if (this.Designs.data[index].group === this.BaseTypeGroup.id) {
                    this.Designs.data[index].img.show();
                } else {
                    this.Designs.data[index].img.hide();
                }
            } else {
                this.Designs.data[index].img.hide();
            }
        });
    }

    private resetSelect() {
        this.selectItem = null;
        Object.keys(this.Designs.data).map((index) => {
            this.Designs.data[index].img.selectize(false, {deepSelect: true});
        });
    }

    private setPrintable() {
        this.printable.clear();
        this.printable.plot(this.Product.getPrintablePoint(this.face));
        this.setPosition(this.Product.getOpt(this.face));
    }

    private setPosition(opt: any) {
        const myobj = this;
        this.selectItem = null;
        for (let i = 0; i < this.Designs.data.length; i++) {
            if ((this.Designs.data[i].face === this.face) && (this.Designs.data[i].group === this.BaseTypeGroup.id)) {
                const img = this.Designs.data[i].img;
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
                this.Designs.data[i].img = img;
            }
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

    public addImg(filetype, binaryString: any) {
        const myobj = this;
        const printw = this.Product.getWidth(this.face);
        const printh = this.Product.getHeight(this.face);
        const opt = this.Product.getOpt(this.face);
        const image = this.draw.image('data:' + filetype + ';base64,' + binaryString)
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
            .move(this.Product.getLeft(this.face), this.Product.getTop(this.face));


        image.printableConf = opt;
        image.click(function () {
            myobj.resetSelect();
            this.selectize().resize({
                constraint: opt
            }).draggable(opt);
            myobj.selectItem = this;
        });

        const img = new Design();
        img.img = image;
        img.face = this.face;
        img.group = this.BaseTypeGroup.id;
        this.Designs.add(img);
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
        const img = new Design();
        img.img = leyer;
        img.face = this.face;
        img.group = this.Product.group;
        img.img.selectize(false, {deepSelect: true}).remove();
        this.Designs.deleteImg(img);
        this.selectItem = null;
    }

    public _addProduct() {
        const newProduct = new Product();
        newProduct.base = this.Product.base;
        newProduct.group = this.Product.group;
        if (this.color) {
            if (newProduct.base.colors) {
                const index = newProduct.base.colors.indexOf(this.color);
                if (index < 0) {
                    if (newProduct.base.colors.length) {
                        newProduct.colors.push(newProduct.base.colors[0]);
                    }
                } else {
                    newProduct.colors.push(this.color);
                }
            }
        } else {
            if (newProduct.base.colors) {
                newProduct.colors.push(newProduct.base.colors[0]);
            }
        }
        this.Campaign.add(newProduct);
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
                    this.Product.group = this.BaseTypeGroup.id;
                    this._addProduct();
                    this._selectBase(this.Product.base);
                }
            });
    }

    public selectProduct(id) {
        for (let index = 0; index < this.Campaign.products.length; index++) {
            if (this.Campaign.products[index].base.id === id) {
                this.Campaign.index = index;
                this.Product.base = this.Campaign.products[index].base;
                this.BaseTypeGroup = this.getBaseTypeGroup();
                this._selectBase(this.Product.base);
                return true;
            }
        }
    }

    public deleteProduct(id) {
        if (this.Campaign.products.length > 1) {
            this.Campaign.deletePro(id);
            let checkHas = false;
            for (let index = 0; index < this.Campaign.products.length; index++) {
                if (this.Campaign.products[index].base.id === this.Product.base.id) {
                    checkHas = true;
                }
            }
            if (!checkHas) {
                const newProduct = new Product();
                newProduct.base = this.Campaign.products[0].base;
                newProduct.group = this.Campaign.products[0].group;
                newProduct.colors = this.Campaign.products[0].colors;
                this.Product = newProduct;
                this.Campaign.index = 0;
                this.BaseTypeGroup = this.getBaseTypeGroup();
                this._selectBase(this.Product.base);
            }
        } else {
            this.Campaign.deletePro(id);
            this.Campaign.index = 0;
            this.resetDs();
        }
    }

    private resetDs() {
        Object.keys(this.Designs.data).map((index) => {
            this.Designs.data[index].img.selectize(false, {deepSelect: true}).remove();
        });
        this.Designs.data = [];
        this.Product.colors = [];
        this.color = null;
        this.fDesign.sBaseType = this.arrBaseTypes[0].base_types[0].id;
        this.selectBaseType();
    }

    public addColor(oProduct: Product) {
        this.dialogService.addDialog(ColorComponent, {
            oProduct: oProduct
        });
    }
}
