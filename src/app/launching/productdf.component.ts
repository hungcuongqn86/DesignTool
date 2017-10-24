import {Component, OnInit} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import {Ds} from '../lib/ds';

export interface PromptModel {
    title;
    campaign;
    arrbasetypes;
}

@Component({
    templateUrl: './productdf.component.html',
    styleUrls: ['./productdf.component.css']
})
export class ProductdfComponent extends DialogComponent<PromptModel, string> implements PromptModel, OnInit {
    public title;
    public campaign: any;
    public arrbasetypes: any;
    public product: any;
    public face = 'front';
    public color: any = null;

    constructor(dialogService: DialogService) {
        super(dialogService);
    }

    ngOnInit() {
        this.product = this.getProductDefault();
        this.face = Ds.getFace(this.campaign);
    }

    private getProductDefault(): any {
        let check = this.campaign.products.findIndex(x => x.default === true);
        if (check < 0) {
            check = 0;
        }
        return this.campaign.products[check];
    }

    public getOldOpt(product): any {
        return Ds._getMainOpt(product.base.type.id, 'front', this.arrbasetypes, this.campaign);
    }

    private selectProduct(prod) {
        if (this.product.id !== prod.id) {
            this.product = prod;
        }
    }

    public changeColor(e, prod, itemColor) {
        e.stopPropagation();
        this.selectProduct(prod);
        this.color = itemColor;
        Object.keys(this.product.colors).map((index) => {
            if (this.product.colors[index].id === itemColor.id) {
                this.product.colors[index].default = true;
            } else {
                this.product.colors[index].default = false;
            }
        });
    }

    public setFace(face) {
        this.face = face;
        const prod: any = [];
        Object.keys(this.product).map((index) => {
            prod[index] = this.product[index];
        });
        if (this.face === 'front') {
            prod.back_view = false;
        } else {
            prod.back_view = true;
        }
        this.product = prod;
    }

    public mdClose() {
        this.close();
    }

    public confirm() {
        this.result = this.product;
        this.close();
    }
}
