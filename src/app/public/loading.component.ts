import {Component, OnInit} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
export interface PromptModel {
    status: string;
    progress: any;
}

@Component({
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.css']
})
export class LoadingxComponent extends DialogComponent<PromptModel, string> implements PromptModel, OnInit {
    status: string;
    progress: any = {'progress': 0};

    constructor(dialogService: DialogService) {
        super(dialogService);
    }

    ngOnInit() {

    }

    public mdClose() {
        this.close();
    }
}
