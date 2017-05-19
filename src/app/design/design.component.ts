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

    constructor(private DesignService: DesignService) {
    }

    ngOnInit() {
        this.getBaseTypes();
        this.draw = SVG('drawing').size(530, 630);
        this.productColor = this.draw.rect(530, 630).fill('#ffffff');
        this.productImg = this.draw.image();
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
                    // if (this.oDesign.sId === '') {
                    const baseid = this.arrBase[0].id;
                    this.selectBase(baseid);
                    // }
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
        this.setFace(this.oDesign.sFace);
    }

    public setFace(face) {
        this.oDesign.sFace = face;
        if (this.oDesign.sFace === 'front') {
            this.productImg.load(this.oDesign.sImageFront);
        } else {
            this.productImg.load(this.oDesign.sImageBack);
        }
    }

    public setColor(sColor) {
        this.productColor.fill(sColor);
    }

    public addImg() {
        const image = this.draw.image('https://cdn.img42.com/4b6f5e63ac50c95fe147052d8a4db676.jpeg');
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
