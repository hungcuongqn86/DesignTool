import {Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import {Product, DesignService} from './design.service';

import {Observable} from 'rxjs/Rx';

export interface PromptModel {
    oProduct: Product;
}

@Component({
    templateUrl: './color.component.html',
    styleUrls: ['./color.component.css']
})
export class ColorComponent extends DialogComponent<PromptModel, string> implements PromptModel, OnInit, AfterViewInit {
    oProduct: Product;
    @ViewChild('imgBase') imgBase: ElementRef;
    @ViewChild('backgroundBase') backgroundBase: ElementRef;

    constructor(dialogService: DialogService, public renderer: Renderer) {
        super(dialogService);
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        const sH = this.imgBase.nativeElement.offsetHeight + 'px';
        const sW = this.imgBase.nativeElement.offsetWidth + 'px';
        this.renderer.setElementStyle(this.backgroundBase.nativeElement, 'height', sH);
        this.renderer.setElementStyle(this.backgroundBase.nativeElement, 'width', sW);
    }

    public previewColor(color) {
        this.renderer.setElementStyle(this.backgroundBase.nativeElement, 'background-color', color);
    }

    public selectColor(color) {
        if (!this.oProduct.colors.includes(color)) {
            this.oProduct.colors.push(color);
        } else {
            const indexx = this.oProduct.colors.indexOf(color);
            if (this.oProduct.colors.length > 1) {
                this.oProduct.colors.splice(indexx, 1);
            }
        }
    }

    public selectProductBase(objBase) {
        this.result = objBase;
        this.close();
    }

    public mdClose() {
        this.close();
    }
}
