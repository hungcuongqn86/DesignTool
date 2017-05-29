import {Component, OnInit, ViewChild} from '@angular/core';
import {NgModel} from '@angular/forms';
import {Design, Product, Products, DesignService} from './design.service';
import {ProductComponent} from './product.component';
import {ColorComponent} from './color.component';
import {DialogService} from 'ng2-bootstrap-modal';

import {Observable} from 'rxjs/Rx';

declare const SVG: any;
declare const key: any;

@Component({
    selector: 'app-design',
    templateUrl: './design.component.html',
    styleUrls: ['./design.component.css']
})
export class DesignComponent implements OnInit {
    @ViewChild('form1') form: NgModel;
    Design: Design;
    Product: Product;
    arrBaseTypes: any = [];
    arrBase: any = [];
    fDesign: any = JSON.parse('{"sBaseType":"","file":""}');
    draw: any;
    productColor: any;
    productImg: any;
    printable: any;
    selectItem: any;
    filetype = '';

    constructor(public Products: Products,
                private DesignService: DesignService, private dialogService: DialogService) {
        this.Product = new Product();
    }

    ngOnInit() {
        const myobj = this;
        this.draw = SVG('drawing');
        this.productColor = this.draw.rect().fill('#fff');
        this.productImg = this.draw.image().click(function () {
            myobj.imgClick();
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

    private imgClick() {
        this.resetSelect();
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
        this.getBases();
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
        this.setSize();
        this.setFace(this.Product.face);
        if (this.Product.color) {
            const index = this.Product.base.colors.indexOf(this.Product.color);
            if (index < 0) {
                if (this.Product.base.colors.length) {
                    this.Product.color = this.Product.base.colors[0];
                } else {
                    this.Product.color = '#fff';
                }
                this.setColor(this.Product.color);
            }
        } else {
            if (this.Product.base.colors.length) {
                this.Product.color = this.Product.base.colors[0];
            } else {
                this.Product.color = '#fff';
            }
            this.setColor(this.Product.color);
        }
    }

    private setSize() {
        this.draw.size(this.Product.base.image.width, this.Product.base.image.height);
        this.productColor.size(this.Product.base.image.width, this.Product.base.image.height);
    }

    public setFace(face) {
        this.Product.face = face;
        if (face === 'front') {
            this.productImg.load(this.Product.base.image.front);
        } else {
            this.productImg.load(this.Product.base.image.back);
        }
        this.setPrintable();
        this.resetSelect();
        this.setImgFace();
    }

    private setImgFace() {
        Object.keys(this.Product.designs).map((index) => {
            if (this.Product.designs[index].face === this.Product.face) {
                this.Product.designs[index].img.show();
            } else {
                this.Product.designs[index].img.hide();
            }
        });
    }

    private resetSelect() {
        this.selectItem = null;
        Object.keys(this.Product.designs).map((index) => {
            this.Product.designs[index].img.selectize(false, {deepSelect: true});
        });
    }

    private setPrintable() {
        this.printable.clear();
        this.printable.plot(this.Product.getPrintablePoint(this.Product.face));
        this.setPosition(this.Product.getOpt(this.Product.face));
    }

    private setPosition(opt: any) {
        const myobj = this;
        this.selectItem = null;
        for (let i = 0; i < this.Product.designs.length; i++) {
            if (this.Product.designs[i].face === this.Product.face) {
                const img = this.Product.designs[i].img;
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
                this.Product.designs[i].img = img;
            }
        }
    }

    public setColor(sColor) {
        this.Product.color = sColor;
        this.productColor.fill(sColor.value);
    }

    public addImg(filetype, binaryString: any) {
        const myobj = this;
        const printw = this.Product.getWidth(this.Product.face);
        const printh = this.Product.getHeight(this.Product.face);
        const opt = this.Product.getOpt(this.Product.face);
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
            .move(this.Product.getLeft(this.Product.face), this.Product.getTop(this.Product.face));


        image.printableConf = opt;
        image.click(function () {
            myobj.resetSelect();
            this.selectize().resize({
                constraint: opt
            }).draggable(opt);
            myobj.selectItem = this;
        });

        this.Design = new Design();
        this.Design.face = this.Product.face;
        this.Design.img = image;
        this.Product.addDesign(this.Design);
    }

    public selectLayer(leyer: any) {
        const opt = this.Product.getOpt(this.Product.face);
        this.resetSelect();
        leyer.selectize().resize({
            constraint: opt
        }).draggable(opt);
        this.selectItem = leyer;
    }

    public deleteImg() {
        if (this.selectItem) {
            this.Design = new Design();
            this.Design.img = this.selectItem;
            this.Design.face = this.Product.face;
            this.Design.img.selectize(false, {deepSelect: true}).remove();
            this.Product.deleteDesign(this.Design);
            this.selectItem = null;
        }
    }

    public deleteLayer(leyer: any) {
        this.Design = new Design();
        this.Design.img = leyer;
        this.Design.face = this.Product.face;
        this.Design.img.selectize(false, {deepSelect: true}).remove();
        this.Product.deleteDesign(this.Design);
        this.selectItem = null;
    }

    public _addProduct() {
        const newProduct = new Product();
        newProduct.base = this.Product.base;
        newProduct.designs = this.Product.designs;
        this.Products.add(newProduct);
    }

    public addProduct() {
        this.dialogService.addDialog(ProductComponent, {
            title: 'Select product'
        })
            .subscribe((product) => {
                if (product) {
                    this.Product.base = product;
                    this._addProduct();
                    this.setFace(this.Product.face);
                }
            });
    }

    public selectProduct(id) {
        for (let index = 0; index < this.Products.data.length; index++) {
            if (this.Products.data[index].base.id === id) {
                this.Products.index = index;
                this.Product.base = this.Products.data[index].base;
                this.setFace(this.Product.face);
                return true;
            }
        }
    }

    public deleteProduct(id) {
        if (this.Products.data.length > 1) {
            this.Products.deletePro(id);
            let checkHas = false;
            for (let index = 0; index < this.Products.data.length; index++) {
                if (this.Products.data[index].base.id === this.Product.base.id) {
                    checkHas = true;
                }
            }
            if (!checkHas) {
                this.Product = this.Products.data[0];
                this.Products.index = 0;
                this.setFace(this.Product.face);
            }
        } else {
            this.Products.deletePro(id);
            this.Products.index = 0;
            this.resetDs();
        }
    }

    private resetDs() {
        Object.keys(this.Product.designs).map((index) => {
            this.Product.designs[index].img.selectize(false, {deepSelect: true}).remove();
        });
        this.Product.designs = [];
        this.Product.colors = [];
        this.Product.color = '#fff';
        this.fDesign.sBaseType = this.arrBaseTypes[0].base_types[0].id;
        this.selectBaseType();
    }

    public addColor(oProduct: Product) {
        this.dialogService.addDialog(ColorComponent, {
            oProduct: oProduct
        });
    }
}
