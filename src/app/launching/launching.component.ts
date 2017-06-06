import {Component, OnInit} from '@angular/core';
import {Campaign, DesignService} from '../design.service';
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
    placeholder = 'Description ...';
    arrDomains: any = [];
    uri: any = JSON.parse('{"url":""}');

    constructor(private DesignService: DesignService, public Campaign: Campaign) {
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
    }

    private getCampaign() {
        this.DesignService.getCampaign(this.Campaign.id).subscribe(
            res => {
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });
                const checkS = this.Campaign.url.slice(-1);
                if (checkS !== '/') {
                    this.Campaign.url += '/';
                }
                console.log(this.Campaign);
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
        this.Campaign.url = val;
    }

    public suggestion() {
        if (this.Campaign.title !== '') {
            this.DesignService.suggestion(this.Campaign.title).subscribe(
                res => {
                    if (res.available) {
                        this.uri = res;
                    }
                },
                error => {
                    console.error(error.json().message);
                    return Observable.throw(error);
                }
            );
        } else {
            this.uri = JSON.parse('{"url":""}');
        }
    }
}
