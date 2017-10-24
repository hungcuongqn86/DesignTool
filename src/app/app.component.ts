import {Component} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {AppService} from './services/app.service';
import {DesignService} from './design.service';
import {location} from './lib/const';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    constructor(public DesignService: DesignService,
                private AppService: AppService,
                private translate: TranslateService) {
        translate.addLangs([location]);
        translate.use(location);
        Object.keys(this.AppService.svConfig).map((index) => {
            this.DesignService.getConfig(index).subscribe(
                data => {
                    this.AppService.svConfig[index] = data;
                }
            );
        });
    }
}
