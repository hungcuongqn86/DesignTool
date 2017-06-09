import {Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import {Product} from '../design.service';
import {DsLib} from '../lib/lib';
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

    constructor(public DsLib: DsLib, dialogService: DialogService, public renderer: Renderer) {
        super(dialogService);
    }

    ngOnInit() {

    }

    public checkColor(color: any) {
        for (let i = 0; i < this.oProduct.colors.length; i++) {
            if (this.oProduct.colors[i].id === color.id) {
                return i;
            }
        }
        return -1;
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
        const check = this.checkColor(color);
        if (check < 0) {
            this.oProduct.colors.push(color);
        } else {
            if (this.oProduct.colors.length > 1) {
                this.oProduct.colors.splice(check, 1);
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
