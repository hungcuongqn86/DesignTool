import {Component, OnInit, AfterViewInit} from '@angular/core';
import {DesignService} from '../design.service';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import {DsLib} from '../lib/lib';
import {Observable} from 'rxjs/Rx';

export interface PromptModel {
    title;
}

declare const $: any;

@Component({
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css']
})
export class AuthComponent extends DialogComponent<PromptModel, string> implements PromptModel, OnInit, AfterViewInit {
    title;
    fRegiter: any = JSON.parse('{"source": "general","email":"","password":"","confirm_password":""}');
    fLogin: any = JSON.parse('{"source": "general","email": "","password":""}');

    constructor(private DsLib: DsLib, dialogService: DialogService, private DesignService: DesignService) {
        super(dialogService);
    }

    ngOnInit() {

    }

    public actionRegister() {
        this.DesignService.accRegister(this.fRegiter).subscribe(
            res => {

                console.log(res);
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public actionLogin() {
        this.DesignService.accLogin(this.fLogin).subscribe(
            res => {
                this.DsLib.setToken(res);
                this.getProfile();
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    private getProfile() {
        this.DesignService.getProfile(this.DsLib.getToken()).subscribe(
            res => {
                this.confirm(res);
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public confirm(profile) {
        this.result = profile;
        this.close();
    }

    ngAfterViewInit() {
        $('#login-form-link').click(function (e) {
            $('#login-form').delay(100).fadeIn(100);
            $('#register-form').fadeOut(100);
            $('#register-form-link').removeClass('active');
            $(this).addClass('active');
            e.preventDefault();
        });
        $('#register-form-link').click(function (e) {
            $('#register-form').delay(100).fadeIn(100);
            $('#login-form').fadeOut(100);
            $('#login-form-link').removeClass('active');
            $(this).addClass('active');
            e.preventDefault();
        });
    }
}
