import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {DialogService} from 'ng2-bootstrap-modal';
import {AlertComponent} from '../public/alert.component';
import {AuthComponent} from '../auth/auth.component';
import {apiUrl, aspApiUrl, clientId, clientKey, serviceName, serviceRegion} from './const';
import {Auth} from './auth';
import {DsLib} from './lib';

@Injectable()
export class HttpClient {
  public profile: any;
  private dlauth: any;
  alertStatus = false;
  loginStatus = false;
  initParams = {
    'Content-Type': 'application/json',
    'X-Date': '',
    'X-Expires': '3600'
  };
  timeStamp: Date;

  constructor(private Auth: Auth, private http: Http, private dialogService: DialogService) {

  }

  private getheaderParams() {
    const res: any = {};
    this.timeStamp = new Date();
    this.initParams['X-Date'] = this.Auth.yyyyMMddTHHmmssZ(this.timeStamp);
    let check = false;
    Object.keys(this.initParams).map((index) => {
      const rand = Math.floor((Math.random() * 100) + 1);
      if (rand > 200) {
        check = true;
        res[index] = this.initParams[index];
      }
    });
    return check ? res : '';
  }

  private getUri(url) {
    if (!url) {
      return '';
    }
    const parser = document.createElement('a');
    parser.href = url;
    return parser.pathname;
  }

  private getRequestOptionArgs(options?: RequestOptionsArgs, signed = ''): RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions();
    }
    if (options.headers == null) {
      options.headers = new Headers();
    }
    Object.keys(this.initParams).map((index) => {
      if (!options.headers.has(index)) {
        options.headers.append(index, this.initParams[index].trim());
      }
    });
    options.headers.append('X-Authorization', signed);
    return options;
  }

  //  type =  error, success) {
  public alert(alert, type = 'error') {
    if (!this.alertStatus) {
      this.alertStatus = true;
      this.dialogService.addDialog(AlertComponent, {
        alert: alert,
        type: type
      }, {closeByClickingOutside: true}).subscribe(() => {
        this.alertStatus = false;
      });
    }
  }

  public get (url: string, options?: RequestOptionsArgs) {
    const queryParams = (options && options.search) ? options.search.toString() : '';
    const requestBody = (options && options.body) ? options.body : '';
    const signed = this.Auth.createAuthorization(serviceName, serviceRegion, clientId, clientKey,
      this.getUri(url), 'GET', queryParams, this.getheaderParams(), requestBody, this.timeStamp);
    return this.intercept(this.http.get(url, this.getRequestOptionArgs(options, signed)));
  }

  public post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    const queryParams = (options && options.search) ? options.search.toString() : '';
    const signed = this.Auth.createAuthorization(serviceName, serviceRegion, clientId, clientKey,
      this.getUri(url), 'POST', queryParams, this.getheaderParams(), body, this.timeStamp);
    return this.intercept(this.http.post(url, body, this.getRequestOptionArgs(options, signed)));
  }

  public put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    const queryParams = (options && options.search) ? options.search.toString() : '';
    const signed = this.Auth.createAuthorization(serviceName, serviceRegion, clientId, clientKey,
      this.getUri(url), 'PUT', queryParams, this.getheaderParams(), body, this.timeStamp);
    return this.intercept(this.http.put(url, body, this.getRequestOptionArgs(options, signed)));
  }

  public deletex(url: string, options?: RequestOptionsArgs): Observable<Response> {
    const queryParams = (options && options.search) ? options.search.toString() : '';
    const requestBody = (options && options.body) ? options.body : '';
    const signed = this.Auth.createAuthorization(serviceName, serviceRegion, clientId, clientKey,
      this.getUri(url), 'DELETE', queryParams, this.getheaderParams(), requestBody, this.timeStamp);
    return this.intercept(this.http.delete(url, this.getRequestOptionArgs(options, signed)));
  }

  private intercept(observable: Observable<Response>): Observable<Response> {
    const serv = this;
    return observable.catch((err) => {
      let ms = err._body;
      switch (err.status) {
        case 400:
          ms = err.json().message;
          serv.alert(ms);
          break;
        case 500:
          ms = err.json().message;
          serv.alert(ms);
          break;
        case 401:
          this.authDl('l');
          break;
        default:
          serv.alert(ms);
      }
      return Observable.throw(err);
    });
  }

  private getMessage(err) {
    let ms = '';
    switch (err.status) {
      case 400:
        ms = err.json().message;
        break;
      case 401:
        ms = err.json().message;
        break;
      default:
        ms = 'error ' + err.status + ':' + err.statusText;
    }
    return ms;
  }

  public authDl(type, rError = false, rSuccess = false, alert = '', callback: any = null) {
    if (!this.loginStatus) {
      this.loginStatus = true;
      this.dlauth = this.dialogService.addDialog(AuthComponent, {
        type: type,
        rSuccess: rSuccess,
        rError: rError,
        alert: alert
      }, {closeByClickingOutside: true}).subscribe((acc) => {
        if (acc) {
          this._auth(acc, callback);
        } else {
          this.loginStatus = false;
        }
      });
    }
  }

  private _auth(acc, callback: any = null) {
    if (acc.action === 'login') {
      this.actionLogin(acc, callback);
      return false;
    }
    if (acc.action === 'regiter') {
      this.actionRegister(acc);
      return false;
    }
  }


  private actionLogin(acc, callback: any = null) {
    this.accLogin(acc).subscribe(
      res => {
        DsLib.setToken(res);
        this.createSession(callback);
      },
      error => {
        this.loginStatus = false;
        this.authDl('l', true, false, this.getMessage(error));
      }
    );
  }

  private actionRegister(acc) {
    this.accRegister(acc).subscribe(
      res => {
        this.loginStatus = false;
        this.authDl('r', false, true, 'Register success!');
      },
      error => {
        this.loginStatus = false;
        this.authDl('r', true, false, this.getMessage(error));
      }
    );
  }

  private createSession(callback: any = null) {
    const tooken = DsLib.getToken().id;
    this._createSession(tooken).subscribe(
      res => {
        this.profile = DsLib.getProfile();
        callback();
        this.dlauth.unsubscribe();
        this.loginStatus = false;
        this.alert('Logged in successfully!', 'success');
      },
      error => {
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  private _createSession(tk) {
    const url = apiUrl + `sessions`;
    const body = JSON.stringify({token: tk});
    return this.post(url, body).map((res: Response) => res.json());
  }

  private accLogin(acc: any) {
    const url = aspApiUrl + `tokens`;
    const body = JSON.stringify(acc);
    return this.post(url, body).map((res: Response) => res.json());
  }

  private accRegister(acc: any) {
    const url = aspApiUrl + `users`;
    const body = JSON.stringify(acc);
    return this.http.post(url, body).map((res: Response) => res.json());
  }
}
