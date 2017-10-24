import {Component} from '@angular/core';
import {DesignService} from '../design.service';
import {AppService} from '../services/app.service';
import {DsLib} from '../lib/lib';

@Component({
  selector: 'app-layouts-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent {
  constructor(public DesignService: DesignService, public AppService: AppService) {
    this.getLocation();
  }

  private getLocation() {
    this.DesignService.getConfig('product.fulfillment.location').subscribe(
      data => {
        this.DesignService.locations = data.split(',');
      }
    );
  }

  public authDl(type) {
    this.DesignService.http.authDl(type, false, false, '', () => this.loginCallback());
  };

  private loginCallback() {
    this.DesignService.loginCallback();
  }

  public logout() {
    this.DesignService.startLoad();
    this.DesignService.http.profile = null;
    DsLib.removeToken();
    this.removeSession();
  }

  private removeSession() {
    const ss = DsLib.getSession();
    this.DesignService.removeSession(ss).subscribe(
      () => {
        this.DesignService.endLoad();
      },
      error => {
        this.DesignService.endLoad();
      }
    );
  }

  public linkToManage(rout) {
    const link = '.' + this.AppService.svConfig['system.manage.site.uri.prefix'] + '/' + rout;
    window.location.replace(link);
  }
}
