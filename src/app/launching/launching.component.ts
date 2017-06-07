import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Campaign, DesignService} from '../design.service';
import {Select2OptionData} from 'ng2-select2';
import {DialogService} from 'ng2-bootstrap-modal';
import {ProductdfComponent} from './productdf.component';
import {Cookie} from 'ng2-cookies';
import {Observable} from 'rxjs/Rx';

const imgDir = 'http://cdn.30usd.com/images/';
const campaignCookie = 'campaign_id';
const userid = 'cuongnh';

@Component({
    selector: 'app-launching',
    templateUrl: './launching.component.html',
    styleUrls: ['./launching.component.css']
})
export class LaunchingComponent implements OnInit {
    quillOption = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{'size': ['small', false, 'large', 'huge']}],
            [{'color': []}, {'background': []}],
            [{'align': []}],
            ['link', 'image']
        ]
    };
    placeholder = '...';
    options: Select2Options;
    arrDomains: any = [];
    arrCategories: Array<Select2OptionData> = [];
    arrCatValue: string[];
    uri: any = JSON.parse('{"url":""}');
    url: string;

    constructor(private router: Router, private DesignService: DesignService,
                public Campaign: Campaign, private dialogService: DialogService) {
        this.Campaign.step = 3;

        this.Campaign.id = 'z8YcVNt1mvGeFbDK';
        if (Cookie.check(campaignCookie)) {
            this.Campaign.id = Cookie.get(campaignCookie);
        } else {
            // this.router.navigate(['/design']);
        }
        this.getCampaign();
    }

    ngOnInit() {
        this.getDomains();
        this.options = {
            multiple: true
        };
    }

    private getCampaign() {
        this.DesignService.getCampaign(this.Campaign.id).subscribe(
            res => {
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });
                const checkS = this.Campaign.url.slice(-1);
                if (checkS !== '/') {
                    this.url = this.Campaign.url + '/';
                }
                this.getCategories();
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public getBaseImgUrl(sFace, base: any) {
        return imgDir + base + '_' + sFace + '.png';
    }

    public setVisibility(val) {
        this.Campaign.private = val;
    }

    private getDomains() {
        this.DesignService.getDomains().subscribe(
            res => {
                this.arrDomains = res.domains;
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public setDomain(val) {
        const checkS = val.slice(-1);
        if (checkS !== '/') {
            val += '/';
        }
        this.url = val;
        this.Campaign.url = this.url + this.uri.uri;
    }

    public suggestion() {
        if (this.Campaign.title !== '') {
            this.DesignService.suggestion(this.Campaign.title).subscribe(
                res => {
                    if (res.available) {
                        this.uri = res;
                        this.Campaign.url = this.url + this.uri.uri;
                    }
                },
                error => {
                    console.error(error.json().message);
                    return Observable.throw(error);
                }
            );
        } else {
            this.uri = JSON.parse('{"url":""}');
            this.Campaign.url = this.url + this.uri.uri;
        }
    }

    public checkSuggestion() {
        if (this.uri !== '') {
            this.DesignService.checkSuggestion(this.uri).subscribe(
                res => {
                    console.log(res.uri);
                },
                error => {
                    console.error(error.json().message);
                    return Observable.throw(error);
                }
            );
        }
    }

    private getCategories() {
        this.DesignService.getCategories(1).subscribe(
            res => {
                this.arrCategories = this.convertCat(res.categories);
                this.arrCatValue = this.Campaign.categories.split(',');
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    private convertCat(arrCat) {
        Object.keys(arrCat).map((index) => {
            arrCat[index]['text'] = arrCat[index].name;
        });
        return arrCat;
    }

    public categoriesSelect(data: { value: string[] }) {
        this.Campaign.categories = data.value.join(',');
    }

    public changeProduct() {
        this.dialogService.addDialog(ProductdfComponent, {
            title: 'Select product'
        })
            .subscribe((product) => {
                this.mergProduct(product);
            });
    }

    private mergProduct(product: any) {
        if (product) {
            Object.keys(this.Campaign.products).map((index) => {
                if (this.Campaign.products[index].id === product.id) {
                    this.Campaign.products[index].default = true;
                    this.Campaign.products[index].back_view = product.back_view;
                    this.Campaign.products[index].colors = product.colors;
                } else {
                    this.Campaign.products[index].default = false;
                }
            });
        }
    }
}
