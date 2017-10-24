import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AppGuard} from './app.guard.service';
import {DesignComponent} from './design/design.component';
import {PricingComponent} from './pricing/pricing.component';
import {LaunchingComponent} from './launching/launching.component';

const appRoutes: Routes = [
    {path: '', redirectTo: 'design', pathMatch: 'full'},
    {path: 'design', component: DesignComponent, canActivate: [AppGuard]},
    {path: 'design/:id', component: DesignComponent, canActivate: [AppGuard]},
    {
        path: 'pricing', component: PricingComponent, canActivate: [AppGuard]
    },
    {
        path: 'launching', component: LaunchingComponent, canActivate: [AppGuard]
    },
	{path: '**', redirectTo: 'design', pathMatch: 'full'}
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
