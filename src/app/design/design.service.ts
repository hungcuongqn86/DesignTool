import {Injectable} from '@angular/core';
import {Response, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {HttpClient} from '../http-client';

@Injectable()
export class DesignService {
    private apiUrl = './v1/';  // URL to web api

    constructor(private http: HttpClient) {
    }

    getBaseTypes(): any {
        const url = this.apiUrl + `base_groups`;
        return this.http.get(url).map((res: Response) => res.json().base_groups);
    }

    getBases(type_id): any {
        const url = this.apiUrl + `bases`;
        const params: URLSearchParams = new URLSearchParams();
        params.set('type_id', type_id);
        return this.http.get(url, {search: params}).map((res: Response) => res.json().bases);
    }
}
