import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import {captcha_key} from '../lib/const';

export interface PromptModel {
  type;
  rSuccess;
  rError;
  alert;
}

declare const $: any;

@Component({
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent extends DialogComponent<PromptModel, string> implements PromptModel, OnInit, AfterViewInit {
  type;
  rSuccess;
  rError;
  alert;
  fRegiter: any = JSON.parse('{"source": "general","email":"","password":"","confirm_password":"","action":"regiter"}');
  fLogin: any = {source: 'general', email: '', password: '', captcha: '', action: 'login'};
  captcha_key = captcha_key;

  constructor(dialogService: DialogService) {
    super(dialogService);
  }

  ngOnInit() {

  }

  public handleCorrectCaptcha = (data) => this.fLogin.captcha = data;

  public actionRegister() {
    this.result = this.fRegiter;
    this.close();
  }

  public actionLogin() {
    this.result = this.fLogin;
    this.close();
  }

  public clearAlert() {
    this.rSuccess = false;
    this.rError = false;
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
    if (this.type === 'l') {
      $('#login-form-link').trigger('click');
    }
    if (this.type === 'r') {
      $('#register-form-link').trigger('click');
    }
  }
}
