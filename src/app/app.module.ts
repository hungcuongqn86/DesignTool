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

import {Design, Designs, Product, Campaign, DesignService} from './design/design.service';

import {Ng2UploaderModule} from 'ng2-uploader';
import {TranslateModule, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
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
        ColorComponent
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
        routing
    ],
    providers: [
        appRoutingProviders,
        HttpClient,
        AppService,
        DesignService,
        Design,
        Designs,
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
