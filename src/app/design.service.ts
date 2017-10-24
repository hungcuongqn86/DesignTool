import {Injectable} from '@angular/core';
import {Response, URLSearchParams} from '@angular/http';
import {HttpClient} from './lib/http';
import {DialogService} from 'ng2-bootstrap-modal';
import {LoadingxComponent} from './public/loading.component';
import {apiUrl, sFaceDf} from './lib/const';
import {Observable} from 'rxjs/Rx';
import {DsLib} from './lib/lib';

@Injectable()
export class Design {
  public id;
  public campaign_id;
  public product_id;
  public type = sFaceDf;
  public img: any;
  public image: any = {'position': '', 'url': '', 'width': '', 'height': ''};

  constructor() {
  }
}

@Injectable()
export class Product {
  public id;
  public position;
  public base: any = {'id': ''};
  public colors: any = [];
  public designs: Array<any> = [];
  public default = false;
  public back_view = false;
  public price: number;

  constructor() {
  }

  public getHeight(sFace) {
    if (sFace === sFaceDf) {
      return this.base.printable.front_height;
    } else {
      return this.base.printable.back_height;
    }
  }

  public getWidth(sFace) {
    if (sFace === sFaceDf) {
      return this.base.printable.front_width;
    } else {
      return this.base.printable.back_width;
    }
  }

  public getPrintablePoint(sFace) {
    if (sFace === sFaceDf) {
      return [[Number(this.base.printable.front_left), Number(this.base.printable.front_top)],
        [Number(this.base.printable.front_left), Number(this.base.printable.front_top) + Number(this.base.printable.front_height)],
        [Number(this.base.printable.front_left) + Number(this.base.printable.front_width),
          Number(this.base.printable.front_top) + Number(this.base.printable.front_height)],
        [Number(this.base.printable.front_left) + Number(this.base.printable.front_width)
          , Number(this.base.printable.front_top)],
        [Number(this.base.printable.front_left), Number(this.base.printable.front_top)]
      ];
    } else {
      return [[Number(this.base.printable.back_left), Number(this.base.printable.back_top)],
        [Number(this.base.printable.back_left), Number(this.base.printable.back_top) + Number(this.base.printable.back_height)],
        [Number(this.base.printable.back_left) + Number(this.base.printable.back_width),
          Number(this.base.printable.back_top) + Number(this.base.printable.back_height)],
        [Number(this.base.printable.back_left) + Number(this.base.printable.back_width)
          , Number(this.base.printable.back_top)],
        [Number(this.base.printable.back_left), Number(this.base.printable.back_top)]
      ];
    }
  }
}

@Injectable()
export class Campaign {
  public id;
  public title;
  public desc;
  public step = 1;
  public private;
  public domain_id;
  public url;
  public fb_pixel;
  public categories;
  public stores;
  public products: Array<Product> = [];
  public state;
  public user_id;
  public length;

  constructor() {
  }

  public add(Product: Product) {
    this.products.push(Product);
  }

  public deletePro(id) {
    if (this.products.length <= 1) {
      return false;
    }
    for (let index = 0; index < this.products.length; index++) {
      if (this.products[index].base.id === id) {
        this.products.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  public hasBase(id) {
    for (let index = 0; index < this.products.length; index++) {
      if (this.products[index].base.id === id) {
        return index;
      }
    }
    return -1;
  }
}

@Injectable()
export class DesignService {
  public canActive: Array<string> = ['', 'design'];
  private loadingStatus = false;
  private dlLoad;
  public validate1 = false;
  public validate2 = true;
  public locations = [];
  public arrStores: Array<any>;

  constructor(public http: HttpClient, public dialogService: DialogService) {
  }

  public checkAccess(fallback: any, passback: any, tk: string, checkRoute, checkLogin) {
    if (checkRoute) {
      if (checkLogin) {
        passback();
        return Observable.of(true);
      } else {
        const url = apiUrl + `sessions`;
        const body = JSON.stringify({token: tk});
        return this.http.post(url, body)
          .map((res: Response) => {
            passback();
            return true;
          }).catch(() => {
            fallback();
            return Observable.of(false);
          });
      }
    } else {
      return Observable.of(false);
    }
  }

  public loginCallback() {
    this.getStores();
  }

  private getStores() {
    this.getStorefronts({title: '', page_size: 1000, page: 1}).subscribe(
      res => {
        this.arrStores = DsLib.convert2select(res.stores, 'title');
      }
    );
  }

  public startLoad(title = 'Loading...') {
    if (this.loadingStatus) {
      return false;
    }
    this.loadingStatus = true;
    this.dlLoad = this.dialogService.addDialog(LoadingxComponent, {
      status: title
    }).subscribe(() => {
    });
  }

  public endLoad() {
    this.dlLoad.unsubscribe();
    this.loadingStatus = false;
  }

  initCampaign(id, userid): any {
    if (id !== '') {
      return this.getCampaign(id);
    } else {
      return this.createCampaign(userid);
    }
  }

  updateCampaign(campaign: Campaign) {
    const url = apiUrl + `campaigns/` + campaign.id;
    const body = JSON.stringify(campaign);
    return this.http.put(url, body).map((res: Response) => res.json());
  }

  private createCampaign(userid): any {
    const url = apiUrl + `campaigns`;
    const body = JSON.stringify({user_id: userid});
    return this.http.post(url, body).map((res: Response) => res.json());
  }

  getCampaign(id): any {
    const url = apiUrl + `campaigns/` + id;
    return this.http.get(url).map((res: Response) => res.json());
  }

  getBaseTypes(): any {
    const url = apiUrl + `base_groups`;
    return this.http.get(url).map((res: Response) => res.json().base_groups);
  }

  getBases(type_id): any {
    const url = apiUrl + `bases`;
    const params: URLSearchParams = new URLSearchParams();
    params.set('type_id', type_id);
    return this.http.get(url, {search: params}).map((res: Response) => res.json().bases);
  }

  addDesign(Design: Design) {
    const url = apiUrl + `designs`;
    const body = JSON.stringify(Design);
    return this.http.post(url, body).map((res: Response) => res.json());
  }

  updateDesign(Design: Design) {
    const url = apiUrl + `designs/` + Design.id;
    const body = JSON.stringify(Design);
    return this.http.put(url, body).map((res: Response) => res.json());
  }

  deleteDesign(Design: Design, prodId) {
    const url = apiUrl + `designs/` + Design.id;
    const params: URLSearchParams = new URLSearchParams();
    params.set('product_id', prodId);
    return this.http.deletex(url, {search: params}).map((res: Response) => res.json());
  }

  getDomains(): any {
    const url = apiUrl + `domains`;
    return this.http.get(url).map((res: Response) => res.json());
  }

  getCategories(visible) {
    const url = apiUrl + `categories`;
    const params: URLSearchParams = new URLSearchParams();
    params.set('visible', visible);
    return this.http.get(url).map((res: Response) => res.json());
  }

  public getStorefronts(sparams) {
    const url = apiUrl + 'stores';
    const params: URLSearchParams = new URLSearchParams();
    Object.keys(sparams).map((key) => {
      params.set(key, sparams[key]);
    });
    return this.http.get(url, {search: params}).map((res: Response) => res.json());
  }

  suggestion(suggestion: string): any {
    const url = apiUrl + `uri`;
    const params: URLSearchParams = new URLSearchParams();
    params.set('suggestion', suggestion);
    return this.http.get(url, {search: params}).map((res: Response) => res.json());
  }

  checkSuggestion(uri: string, id): any {
    const url = apiUrl + `uri`;
    const params: URLSearchParams = new URLSearchParams();
    params.set('check', uri);
    params.set('reference', id);
    return this.http.get(url, {search: params}).map((res: Response) => res.json());
  }

  removeSession(id) {
    const url = apiUrl + `sessions/${id}`;
    return this.http.deletex(url).map((res: Response) => res.json());
  }

  getConfig(key) {
    const url = apiUrl + 'preferences';
    const params: URLSearchParams = new URLSearchParams();
    params.set('key', key);
    return this.http.get(url, {search: params}).map((res: Response) => res.json().value);
  }
}
