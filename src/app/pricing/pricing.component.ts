import {Component, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Campaign, DesignService} from '../design.service';
import {AppService} from '../services/app.service';
import {Observable} from 'rxjs/Rx';
import {Ds} from '../lib/ds';
import {DsLib} from '../lib/lib';

@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit, OnDestroy {
    @ViewChild('form') form: any;
    arrBaseTypes: any = [];
    total: number;
    private subs: any;

    constructor(private router: Router,
                private AppService: AppService,
                public DesignService: DesignService, public Campaign: Campaign) {
        this.DesignService.canActive = ['', 'design'];
        this.Campaign.step = 2;
        this.Campaign.id = DsLib.getCampaignId();
        if (this.Campaign.id === '') {
            DsLib.removeCampaign(this.AppService.svConfig['system.ecomerce.domain.name']);
            this.router.navigate(['/design']);
        }
    }

    ngOnInit() {
        this.getBaseTypes();
        this.getCampaign();
        this.setValidate();
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

    private unsubscribe() {
        if (this.subs) {
            this.subs.unsubscribe();
        }
    }

    private getCampaign() {
        this.DesignService.startLoad();
        this.subs = this.DesignService.getCampaign(this.Campaign.id).subscribe(
            res => {
                if (res.state === 'launching') {
                    DsLib.removeCampaign(this.AppService.svConfig['system.ecomerce.domain.name']);
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

    public getOldOpt(product): any {
        return Ds._getMainOpt(product.base.type.id, 'front', this.arrBaseTypes, this.Campaign);
    }

    private getBaseTypes() {
        const sub = this.DesignService.getBaseTypes().subscribe(
            data => {
                this.arrBaseTypes = data;
                sub.unsubscribe();
            },
            error => {
                sub.unsubscribe();
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
        this.DesignService.endLoad();
    }

    public setValidate() {
        Object.keys(this.form.form.controls).map((index) => {
            const el = document.getElementById(index);
            if (!this.form.form.controls[index].valid) {
                el.parentElement.classList ? el.parentElement.classList.add('has-error') : el.parentElement.className += ' has-error';
            } else {
                el.parentElement.classList.remove('has-error');
            }
        });
        this.DesignService.validate2 = this.form.form.valid;
    }

    public clickContinue() {
        this.DesignService.canActive = ['launching'];
        this.updateCampaign();
    }

    private updateCampaign() {
        if (DsLib.checkLogin()) {
            this.Campaign.user_id = DsLib.getToken().user_id;
        }
        const cpU = new Campaign();
        Object.keys(this.Campaign).map((index) => {
            cpU[index] = this.Campaign[index];
        });
        this.DesignService.updateCampaign(cpU).subscribe(
            () => {
                this.router.navigate(['/launching']);
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }
}
