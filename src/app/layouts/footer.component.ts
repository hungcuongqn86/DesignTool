import {Component} from '@angular/core';
import {AppService} from '../services/app.service';

@Component({
    selector: 'app-layouts-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})

export class FooterComponent {
    constructor(public AppService: AppService) {
    }
}
