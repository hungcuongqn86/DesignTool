import {Component, OnInit} from '@angular/core';
import {DesignService} from './design.service';

import {Observable} from 'rxjs/Rx';

declare const SVG: any;

@Component({
    selector: 'app-design',
    templateUrl: './design.component.html',
    styleUrls: ['./design.component.css']
})
export class DesignComponent implements OnInit {
    arrBaseTypes: any = [];
    arrBase: any = [];
    fDesign: any = JSON.parse('{"sBaseType":""}');
    oDesign: any = JSON.parse('{"sId":"","sFace":"front","sImageFront":"","sImageBack":""}');
    draw: any;
    productColor: any;
    productImg: any;
    printable: any;
    printableConf: any;
    width: number;
    height: number;
    nested: any;
    arrNested: any = [];

    constructor(private DesignService: DesignService) {
    }

    ngOnInit() {
        const myobj = this;
        this.getBaseTypes();
        this.draw = SVG('drawing');
        this.productColor = this.draw.rect().fill('#fff');
        this.productImg = this.draw.image().click(function () {
            myobj.imgClick();
        });
        this.printable = this.draw.polyline().fill('none').stroke({color: 'rgba(0, 0, 0, 0.3)', width: 1});
        this.nested = this.draw.nested();
    }

    private imgClick() {
        this.resetSelect();
    }

    private resetSelect() {
        for (let i = 0; i < this.arrNested.length; i++) {
            this.arrNested[i].selectize(false, {deepSelect: true});
        }
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
        this.oDesign.sId = base.id;
        this.oDesign.sImageFront = base.image.front;
        this.oDesign.sImageBack = base.image.back;
        this.printableConf = base.printable;
        this.width = base.image.width;
        this.height = base.image.height;

        this.setSize();
        this.setFace(this.oDesign.sFace);
        this.setPrintable();
    }

    private setSize() {
        this.draw.size(this.width, this.height);
        this.productColor.size(this.width, this.height);
    }

    public setFace(face) {
        this.oDesign.sFace = face;
        if (this.oDesign.sFace === 'front') {
            this.productImg.load(this.oDesign.sImageFront);
        } else {
            this.productImg.load(this.oDesign.sImageBack);
        }
        this.setPrintable();
    }

    private setPrintable() {
        this.printable.clear();
        if (this.oDesign.sFace === 'front') {
            this.printable.plot([[this.printableConf.front_left, this.printableConf.front_top],
                [this.printableConf.front_left, Number(this.printableConf.front_top) + Number(this.printableConf.front_height)],
                [Number(this.printableConf.front_left) + Number(this.printableConf.front_width),
                    Number(this.printableConf.front_top) + Number(this.printableConf.front_height)],
                [Number(this.printableConf.front_left) + Number(this.printableConf.front_width)
                    , Number(this.printableConf.front_top)],
                [this.printableConf.front_left, this.printableConf.front_top]
            ]);
        } else {
            this.printable.plot([[this.printableConf.back_left, this.printableConf.back_top],
                [this.printableConf.back_left, Number(this.printableConf.back_top) + Number(this.printableConf.back_height)],
                [Number(this.printableConf.back_left) + Number(this.printableConf.back_width),
                    Number(this.printableConf.back_top) + Number(this.printableConf.back_height)],
                [Number(this.printableConf.back_left) + Number(this.printableConf.back_width)
                    , Number(this.printableConf.back_top)],
                [this.printableConf.back_left, this.printableConf.back_top]
            ]);
        }
    }

    public setColor(sColor) {
        this.productColor.fill(sColor);
    }

    public addImg() {
        const myobj = this;
        const printw = this.printableConf.front_width;
        const printh = this.printableConf.front_height;
        const image = this.nested.image('https://d1b2zzpxewkr9z.cloudfront.net/vectors/Animals%2FSafari%2FElephant%202.svg')
            .loaded(function (loader) {
                if (printw < loader.width) {
                    const px = loader.width / printw;
                    const mheight = loader.height / px;
                    if (mheight <= printh) {
                        this.size(printw, mheight);
                    }
                } else {
                    if (printh < loader.height) {
                        const px = loader.height / printh;
                        const mwidth = loader.width / px;
                        if (mwidth <= printw) {
                            this.size(mwidth, printh);
                        }
                    }
                }
            });

        if (this.oDesign.sFace === 'front') {
            image.move(this.printableConf.front_left, this.printableConf.front_top);
        } else {
            image.move(this.printableConf.back_left, this.printableConf.back_top);
        }

        const opt = {
            minX: this.printableConf.front_left
            , minY: this.printableConf.front_top
            , maxX: Number(this.printableConf.front_left) + Number(this.printableConf.front_width)
            , maxY: Number(this.printableConf.front_top) + Number(this.printableConf.front_height)
        };

        image.click(function () {
            myobj.resetSelect();
            this.selectize().resize({
                constraint: opt
            }).draggable(opt);
        });

        this.arrNested.push(image);

        this.draw.click(function () {
            // image.selectize(false);
        });
    }
}
