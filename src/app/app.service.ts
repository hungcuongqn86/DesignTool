import {Injectable} from '@angular/core';
import {URLSearchParams, Response, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {HttpClient} from './http-client';

@Injectable()
export class AppService {
    private apiUrl = './v1/';  // URL to web api

    constructor(private http: HttpClient) {
    }

    getLocation(): any {
        const url = this.apiUrl + 'preferences';
        const params: URLSearchParams = new URLSearchParams();
        params.set('key', 'product.fulfillment.location');
        return this.http.get(url, {search: params}).map((res: Response) => res.json().value);
    }
}
