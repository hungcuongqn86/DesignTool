import {Component, OnInit} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Router} from '@angular/router';
import {AuthComponent} from './auth/auth.component';
import {DialogService} from 'ng2-bootstrap-modal';
import {Observable} from 'rxjs/Rx';

import {AppService} from './app.service';
import {Campaign, DesignService} from './design.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    locations: any = [];
    location = 'en';
    profile: any;

    constructor(public Campaign: Campaign, private router: Router, private AppService: AppService,
                private DesignService: DesignService,
                private translate: TranslateService,
                private dialogService: DialogService) {
        translate.addLangs([this.location]);
        translate.use(this.location);
    }

    ngOnInit() {
        this.getLocation();
    }

    getLocation() {
        this.AppService.getLocation().subscribe(
            data => {
                this.locations = data.split(',');
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    private updateCampaign(rout) {
        this.DesignService.updateCampaign(this.Campaign).subscribe(
            () => {
                if (rout) {
                    this.router.navigate([rout]);
                }
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    public clickContinue() {
        if (this.Campaign.step === 1) {
            this.router.navigate(['/pricing']);
        }
        if (this.Campaign.step === 2) {
            this.updateCampaign('/launching');
        }
        if (this.Campaign.step === 3) {
            // this.updateCampaign('/launching');
            this.authDl();
        }
    }

    public authDl() {
        this.dialogService.addDialog(AuthComponent, {
            title: 'Select product'
        }, {closeByClickingOutside: true})
            .subscribe((res) => {
                this.profile = res;
            });
    }

    public logout() {
        console.log(11111);
    }
}
