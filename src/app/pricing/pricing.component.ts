import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Campaign, DesignService} from '../design.service';
import {Cookie} from 'ng2-cookies';
import {Observable} from 'rxjs/Rx';

const imgDir = 'http://cdn.30usd.com/images/';
const campaignCookie = 'campaign_id';
const userid = 'cuongnh';

@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
    total: number;

    constructor(private router: Router, private DesignService: DesignService, public Campaign: Campaign) {
        this.Campaign.step = 2;

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
                this.caculater();
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

    public caculater() {
        let totalPrice = 0;
        Object.keys(this.Campaign.products).map((index) => {
            this.Campaign.products[index].Profit = (Number(this.Campaign.products[index].price)
            - Number(this.Campaign.products[index].base.cost)).toFixed(2);
            const tProfit = Number((this.Campaign.products[index].sale_expected * this.Campaign.products[index].Profit).toFixed(2));
            this.Campaign.products[index].tProfit = tProfit;
            totalPrice = totalPrice + tProfit;
        });
        this.total = Number(totalPrice.toFixed(2));
    }
}
