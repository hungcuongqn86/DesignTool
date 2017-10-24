import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {DesignService} from './design.service';
import {DsLib} from './lib/lib';

@Injectable()
export class AppGuard implements CanActivate {
  lost = 0;

  constructor(private DesignService: DesignService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot) {
    const step = route.url[0].path;
    let checkRoute = false;
    let checkLogin = false;
    if (this.DesignService.canActive.includes(step)) {
      checkRoute = true;
    }

    // Check session
    if (DsLib.checkSession()) {
      this.lost = 0;
      checkLogin = true;
    }

    let tooken = '';
    if (DsLib.checkLogin()) {
      tooken = DsLib.getToken().id;
    }

    return this.DesignService.checkAccess(() => this.canAccessScreen(), () => this.pass(), tooken, checkRoute, checkLogin);
  }

  private canAccessScreen() {
    DsLib.removeToken();
    this.lost = this.lost + 1;
    if (this.lost < 3) {
      this.router.navigate(['/']);
    }
  }

  private pass() {
    this.lost = 0;
    this.DesignService.http.profile = DsLib.getProfile();
  }
}
