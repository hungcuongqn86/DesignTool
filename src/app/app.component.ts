import {Component, OnInit} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Router} from '@angular/router';
import {AuthComponent} from './auth/auth.component';
import {DialogService} from 'ng2-bootstrap-modal';
import {Observable} from 'rxjs/Rx';
import {DsLib} from './lib/lib';

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

    constructor(private DsLib: DsLib, public Campaign: Campaign, private router: Router, private AppService: AppService,
                private DesignService: DesignService,
                private translate: TranslateService,
                private dialogService: DialogService) {
        translate.addLangs([this.location]);
        translate.use(this.location);
    }

    ngOnInit() {
        this.getLocation();
        if (this.DsLib.checkLogin()) {
            this.getProfile();
        } else {
            this.logout();
        }
    }

    private getProfile() {
        this.DesignService.getProfile(this.DsLib.getToken()).subscribe(
            res => {
                this.profile = res;
            },
            error => {
                console.error(error.json().message);
                return Observable.throw(error);
            }
        );
    }

    private getLocation() {
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

    private updateCampaign(rout, local: boolean) {
        if (this.DsLib.checkLogin()) {
            this.Campaign.user_id = this.DsLib.getToken().user_id;
        }
        this.Campaign.desc = encodeURIComponent(this.Campaign.desc);
        this.DesignService.updateCampaign(this.Campaign).subscribe(
            () => {
                if (rout) {
                    if (local) {
                        this.router.navigate([rout]);
                    } else {
                        this.DsLib.removeCampaign();
                        // window.location.replace(rout);
                    }
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
            this.updateCampaign('/launching', true);
        }
        if (this.Campaign.step === 3) {
            if (this.DsLib.checkLogin()) {
                this.Campaign.state = 'launching';
                this.updateCampaign(this.DsLib.genCampaignDetailUrl(this.Campaign.url), false);
            } else {
                this.authDl();
            }
        }
    }

    public authDl() {
        this.dialogService.addDialog(AuthComponent, {
            title: 'Login'
        }, {closeByClickingOutside: true})
            .subscribe((res) => {
                if (res) {
                    this.profile = res;
                }
            });
    }

    public logout() {
        if (this.DsLib.checkLogin()) {
            this.DesignService.accLogout(this.DsLib.getToken()).subscribe(
                () => {
                    this.profile = null;
                    this.DsLib.removeToken();
                },
                error => {
                    console.error(error.json().message);
                    return Observable.throw(error);
                }
            );
        } else {
            this.profile = null;
            this.DsLib.removeToken();
        }
    }
}
