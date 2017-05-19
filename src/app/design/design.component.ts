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

    constructor(private DesignService: DesignService) {
    }

    ngOnInit() {
        this.getBaseTypes();
        this.draw = SVG('drawing');
        this.productColor = this.draw.rect().fill('#fff');
        this.productImg = this.draw.image();
        this.printable = this.draw.polyline().fill('none').stroke({width: 1});
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
        const arrPoint: any = [];
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
        const image = this.draw.image('https://d1b2zzpxewkr9z.cloudfront.net/vectors/Animals%2FSafari%2FElephant%202.svg');
        image.size(100, 100);
        image.opacity(0.5);
        image.click(function () {
            this.selectize();
            image.resize();
            image.draggable({
                minX: 0
                , minY: 0
                , maxX: 500
                , maxY: 530
            });
        });

        this.draw.click(function () {
            // image.selectize(false);
        });

        // const box = draw.viewbox();
        // const box = draw.viewbox({ x: 0, y: 0, width: 297, height: 210 });
        // const zoom = box.zoom;
    }
}
