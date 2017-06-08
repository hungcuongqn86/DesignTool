import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Cookie} from 'ng2-cookies';
import {DesignService} from '../design.service';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import * as config from '../lib/const';
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
                const cookval = JSON.stringify({
                    id: res.id,
                    user_id: res.user_id
                });
                const cookieName = btoa(config.cookie_tokens);
                Cookie.set(cookieName, btoa(cookval));
                const tk = Cookie.get(cookieName);
                console.log(this.DsLib.getToken());
                // console.log(cookval, btoa(cookval), atob(btoa(cookval)));
                //
                // if (Cookie.check(cookie_tokens)) {
                //     /*created
                //      :
                //      "20170608T111834Z"
                //      expire
                //      :
                //      "20170608T114834Z"
                //      id
                //      :
                //      "t0BMt2juB5ABOBHb"
                //      state
                //      :
                //      "approved"
                //      user_id
                //      :
                //      "OHSJU3wejSLkoNva"
                //      value
                //      :
                //      "0306431572f42cd8d0f3a8d2b21b165ce2525e2a11cf539117c7d27ca104982b"*/
                //     // Cookie.set(cookie_tokens,res.)
                // }
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public mdClose() {
        this.close();
    }

    public confirm(product) {
        this.result = product;
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
