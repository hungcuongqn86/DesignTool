import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http} from '@angular/http';
import {AppService} from './app.service';
import {HttpClient} from './http-client';

import {AppComponent} from './app.component';
import {DesignComponent} from './design/design.component';
import {PricingComponent} from './pricing/pricing.component';
import {LaunchingComponent} from './launching/launching.component';
import {DebounceDirective} from './app.debounce.directive';

import {Design, Product, Campaign, DesignService} from './design.service';

import {Ng2UploaderModule} from 'ng2-uploader';
import {TranslateModule, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import {QuillModule} from 'ngx-quill';
import {BootstrapModalModule} from 'ng2-bootstrap-modal';
import {ProductComponent} from './design/product.component';
import {ColorComponent} from './design/color.component';

/* Routing Module */
import {routing, appRoutingProviders} from './app-routing.module';

export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, '/assets/i18n', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        DesignComponent,
        PricingComponent,
        LaunchingComponent,
        ProductComponent,
        ColorComponent,
        DebounceDirective
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        Ng2UploaderModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [Http]
        }),
        BootstrapModalModule,
        QuillModule,
        routing
    ],
    providers: [
        appRoutingProviders,
        HttpClient,
        AppService,
        DesignService,
        Design,
        Product,
        Campaign
    ],
    entryComponents: [
        ProductComponent,
        ColorComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
