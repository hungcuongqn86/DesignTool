import {Component, OnInit} from '@angular/core';
import {Cookie} from 'ng2-cookies';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';
import {Campaign, DesignService} from '../design.service';

import {Observable} from 'rxjs/Rx';

export interface PromptModel {
    title;
}

const imgDir = 'http://cdn.30usd.com/images/';
const campaignCookie = 'campaign_id';

@Component({
    templateUrl: './productdf.component.html',
    styleUrls: ['./launching.component.css']
})
export class ProductdfComponent extends DialogComponent<PromptModel, string> implements PromptModel, OnInit {
    title;
    status = 'baseType';

    arrBaseTypes: any = [];
    baseType: any = [];
    arrBase: any = [];

    constructor(public Campaign: Campaign, dialogService: DialogService, private DesignService: DesignService) {
        super(dialogService);

        this.Campaign.id = 'z8YcVNt1mvGeFbDK';
        if (Cookie.check(campaignCookie)) {
            this.Campaign.id = Cookie.get(campaignCookie);
        } else {
            // this.router.navigate(['/design']);
        }
        this.getCampaign();
    }

    ngOnInit() {

    }

    private getCampaign() {
        this.DesignService.getCampaign(this.Campaign.id).subscribe(
            res => {
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });
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

    public mdClose() {
        this.close();
    }
}
