import {Component, OnInit} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';

import {Observable} from 'rxjs/Rx';

import {AppService} from './app.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    locations: any = [];
    location = 'en';
    constructor(private AppService: AppService, private translate: TranslateService) {
        translate.addLangs([this.location]);
        // const browserLang: string = translate.getBrowserLang();
        // translate.use(browserLang.match(/en/) ? browserLang : 'en');
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
}
