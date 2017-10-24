import {Injectable} from '@angular/core';

@Injectable()
export class AppService {
    public svConfig = {
        'system.ecomerce.domain.name': null,
        'system.manage.domain.name': null,
        'system.manage.site.uri.prefix': null,
        'campaign.detail.uri.prefix': null,
        'product.fulfillment.location': null,
        'product.two.sides.printing.price': null,
        'product.one.side.printing.price': null
    };

    constructor() {
    }
}
