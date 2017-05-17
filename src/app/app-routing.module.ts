import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DesignComponent} from './design/design.component';
import {PricingComponent} from './pricing/pricing.component';
import {LaunchingComponent} from './launching/launching.component';

const appRoutes: Routes = [
    {path: '', redirectTo: 'design', pathMatch: 'full'},
    {path: 'design', component: DesignComponent},
    {path: 'pricing', component: PricingComponent},
    {path: 'launching', component: LaunchingComponent},
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
