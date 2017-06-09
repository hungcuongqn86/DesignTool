import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Campaign, DesignService} from '../design.service';
import {Observable} from 'rxjs/Rx';
import {DsLib} from '../lib/lib';

@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
    total: number;

    constructor(public DsLib: DsLib, private router: Router, private DesignService: DesignService, public Campaign: Campaign) {
        this.Campaign.step = 2;
        this.Campaign.id = this.DsLib.getCampaignId();
        this.getCampaign();
    }

    ngOnInit() {
    }

    private getCampaign() {
        this.DesignService.getCampaign(this.Campaign.id).subscribe(
            res => {
                if (res.state === 'launching') {
                    this.DsLib.removeCampaign();
                    this.router.navigate(['/design']);
                }
                Object.keys(res).map((index) => {
                    this.Campaign[index] = res[index];
                });
                this.Campaign.desc = decodeURIComponent(decodeURIComponent(this.Campaign.desc));
                this.caculater();
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
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
