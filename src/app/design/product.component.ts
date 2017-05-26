import {Component, OnInit} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import {Products, DesignService} from './design.service';

import {Observable} from 'rxjs/Rx';

export interface PromptModel {
    title;
}

@Component({
    templateUrl: './product.component.html',
    styleUrls: ['./design.component.css']
})
export class ProductComponent extends DialogComponent<PromptModel, string> implements PromptModel, OnInit {
    title;
    status = 'baseType';

    arrBaseTypes: any = [];
    baseType: any = [];
    arrBase: any = [];

    constructor(public Products: Products, dialogService: DialogService, private DesignService: DesignService) {
        super(dialogService);
    }

    ngOnInit() {
        const myobj = this;
        this.getBaseTypes();
    }

    public getBaseTypes() {
        this.DesignService.getBaseTypes().subscribe(
            data => {
                this.arrBaseTypes = data;
                this.baseType = [];
                this.status = 'baseType';
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public loadBase(sBaseType) {
        this.baseType = sBaseType;
        this.DesignService.getBases(sBaseType.id).subscribe(
            data => {
                this.arrBase = data;
                this.status = 'base';
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public selectProductBase(objBase) {
        this.result = objBase;
        this.close();
    }

    public mdClose() {
        this.close();
    }
}
