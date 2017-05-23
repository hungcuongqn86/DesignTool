import {Component, OnInit} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import {DesignService} from './design.service';

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
    status = 'base';

    arrBaseTypes: any = [];
    arrBase: any = [];

    constructor(dialogService: DialogService, private DesignService: DesignService) {
        super(dialogService);
    }

    ngOnInit() {
        const myobj = this;
        this.getBaseTypes();
    }

    private getBaseTypes() {
        this.DesignService.getBaseTypes().subscribe(
            data => {
                this.arrBaseTypes = data;
                console.log(this.arrBaseTypes);
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public loadBase(sBaseType) {
        this.DesignService.getBases(sBaseType).subscribe(
            data => {
                this.arrBase = data;
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public apply() {
        this.result = 'SUCCESS';
        this.close();
    }

    public mdClose() {
        this.close();
    }
}
