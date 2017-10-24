import {Component} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';

export interface ConfirmModel {
    title: string;
    message: string;
}

@Component({
    selector: 'app-confirm',
    template: `
        <div class="modal-dialog modal-warning">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" (click)="cancel()">&times;</button>
                    <h4 class="modal-title">{{title || 'Confirm'}}</h4>
                </div>
                <div class="modal-body">
                    <p>{{message || 'Are you sure?'}}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="la-btn sm-bnt blank-btn pull-left" data-dismiss="modal" (click)="cancel()">
                        Cancel
                    </button>
                    <button type="button" class="la-btn sm-bnt mask-btn pull-right" (click)="confirm()">OK</button>
                </div>
            </div>
        </div>`
})
export class ConfirmComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
    title: string;
    message: string;

    constructor(dialogService: DialogService) {
        super(dialogService);
    }

    confirm() {
        this.result = true;
        this.close();
    }

    cancel() {
        this.result = false;
        this.close();
    }
}
