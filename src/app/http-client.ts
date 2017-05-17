import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptionsArgs, Request, RequestOptions, Response} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/Observable';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class HttpClient {
    constructor(private http: Http) {
    }

    public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.request(url, options));
    }

    public get(url: string, options?: RequestOptionsArgs, bypass?: any) {
        return this.intercept(this.http.get(url, options), bypass);
    }

    public post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.post(url, body, this.getRequestOptionArgs(options)));
    }

    public put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.put(url, body, this.getRequestOptionArgs(options)));
    }

    public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.delete(url, this.getRequestOptionArgs(options)));
    }

    public patch(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.patch(url, body, options));
    }

    public head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.head(url, options));
    }

    private getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        options.headers.append('Content-Type', 'application/json');
        return options;
    }

    private intercept(observable: Observable<Response>, bypass?: any): Observable<Response> {
        return observable.catch((err, source) => {
            if (err.status === 401) {
                const data = JSON.parse(err._body);
                return Observable.empty();
            } else {
                return Observable.throw(err);
            }
        });
    }
}
