import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Http, HttpModule} from '@angular/http';
import {HttpClient} from './lib/http';

import {AppComponent} from './app.component';
import {HeaderComponent} from './layouts/header.component';
import {FooterComponent} from './layouts/footer.component';
import {DesignComponent} from './design/design.component';
import {PricingComponent} from './pricing/pricing.component';
import {LaunchingComponent} from './launching/launching.component';
import {DebounceDirective} from './public/debounce.directive';
import {ProductDirective} from './public/product.directive';
import {ViewpriceDirective} from './public/viewprice.directive';

import {Campaign, Design, DesignService, Product} from './design.service';
import {AppService} from './services/app.service';
import {UploadService} from './services/upload.service';
import {AppGuard} from './app.guard.service';
import {Ds} from './lib/ds';
import {DsLib} from './lib/lib';
import {Auth} from './lib/auth';

import {TranslateLoader, TranslateModule, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import {QuillModule} from 'ngx-quill';
import {ReCaptchaModule} from 'angular2-recaptcha';
import {Select2Module} from 'ng2-select2';
import {TooltipModule} from 'ng2-tooltip';
import {BootstrapModalModule} from 'ng2-bootstrap-modal';
import {ProgressBarModule} from 'ngx-progress-bar';
import {LgcolorModule} from 'ngx-selectcolor';
import {CharLeftDirective} from 'ngx-charleft';
import {ProductComponent} from './design/product.component';
import {ProductdfComponent} from './launching/productdf.component';
import {ColorComponent} from './design/color.component';
import {AlertComponent} from './public/alert.component';
import {ConfirmComponent} from './public/confirm.component';
import {LoadingxComponent} from './public/loading.component';
import {AuthComponent} from './auth/auth.component';
/* Routing Module */
import {appRoutingProviders, routing} from './app-routing.module';

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, '/assets/i18n', '.json?v=1.0.1');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DesignComponent,
    PricingComponent,
    LaunchingComponent,
    ProductComponent,
    ProductdfComponent,
    ColorComponent,
    AlertComponent,
    ConfirmComponent,
    LoadingxComponent,
    AuthComponent,
    DebounceDirective,
    CharLeftDirective,
    ProductDirective,
    ViewpriceDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    }),
    BootstrapModalModule,
    ProgressBarModule,
    QuillModule,
    Select2Module,
    ReCaptchaModule,
    TooltipModule,
    LgcolorModule,
    routing
  ],
  providers: [
    appRoutingProviders,
    HttpClient,
    AppService,
    DesignService,
    UploadService,
    Design,
    Product,
    Campaign,
    AppGuard,
    Ds,
    DsLib,
    Auth
  ],
  entryComponents: [
    ProductComponent,
    ProductdfComponent,
    ColorComponent,
    AlertComponent,
    ConfirmComponent,
    LoadingxComponent,
    AuthComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
