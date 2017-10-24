import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Campaign, DesignService} from '../design.service';
import {AppService} from '../services/app.service';
import {Select2OptionData} from 'ng2-select2';
import {DialogService} from 'ng2-bootstrap-modal';
import {ProductdfComponent} from './productdf.component';
import {Observable} from 'rxjs/Rx';
import {Ds} from '../lib/ds';
import {DsLib} from '../lib/lib';
import {QuillEditorComponent} from 'ngx-quill/src/quill-editor.component';

@Component({
  selector: 'app-launching',
  templateUrl: './launching.component.html',
  styleUrls: ['./launching.component.css']
})
export class LaunchingComponent implements OnInit {
  @ViewChild('form') form: any;
  @ViewChild('editor') editor: QuillEditorComponent;

  quillOption = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{'size': ['small', false, 'large', 'huge']}],
      [{'color': []}, {'background': []}],
      [{'align': []}],
      ['link', 'image']
    ]
  };
  placeholder = '...';
  options: Select2Options;
  arrDomains: any = [];
  public arrCategories: Array<Select2OptionData> = [];
  public arrCatValue: string[];
  uri: any = JSON.parse('{"uri":"","available": true}');
  url: string;

  timeLength: Array<any>;
  timeEnd: any = [];

  arrBaseTypes: any = [];
  public product: any;
  public face = 'front';
  public color: any = null;

  constructor(private router: Router, private DesignService: DesignService,
              private AppService: AppService,
              public Campaign: Campaign, private dialogService: DialogService) {
    this.DesignService.canActive = ['', 'design', 'pricing'];
    this.Campaign.step = 3;
    this.Campaign.id = DsLib.getCampaignId();
    if (this.Campaign.id === '') {
      this.router.navigate(['/design']);
    }
  }

  ngOnInit() {
    this.getBaseTypes();
    this.getCampaign();
    this.timeLength = DsLib.getTimeLength();
    if (!this.timeEnd.number) {
      this.setTimeLength(this.timeLength[0]);
    }
    this.options = {
      multiple: true
    };
  }

  private getProductDefault(): any {
    const check = this.Campaign.products.findIndex(x => x.default === true) >= 0 ?
      this.Campaign.products.findIndex(x => x.default === true) : 0;
    const prod: any = [];
    Object.keys(this.Campaign.products[check]).map((index) => {
      prod[index] = this.Campaign.products[check][index];
    });
    return prod;
  }

  public getOldOpt = (product) => Ds._getMainOpt(product.base.type.id, 'front', this.arrBaseTypes, this.Campaign);

  private getBaseTypes() {
    const sub = this.DesignService.getBaseTypes().subscribe(
      data => {
        this.arrBaseTypes = data;
        sub.unsubscribe();
      },
      error => {
        sub.unsubscribe();
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  public seDescription() {
    const toolbar = this.editor.quillEditor.getModule('toolbar');
    const objTooltip = this.editor.quillEditor.theme.tooltip;
    objTooltip.save = function () {
      const value = this.textbox.value;
      switch (this.root.getAttribute('data-mode')) {
        case 'link': {
          const scrollTop = this.quill.root.scrollTop;
          if (this.linkRange) {
            this.quill.formatText(this.linkRange, 'link', value);
            delete this.linkRange;
          } else {
            this.restoreFocus();
            this.quill.format('link', value);
          }
          this.quill.root.scrollTop = scrollTop;
          break;
        }
        case 'image': {
          this.quill.format('image', value);
          break;
        }
        default:
      }
      this.textbox.value = '';
      this.hide();
    };
    toolbar.addHandler('image', function (value) {
      if (value) {
        this.quill.theme.tooltip.edit('image', '');
      } else {
        this.quill.format('image', '');
      }
    });
  }

  private getCampaign() {
    this.DesignService.startLoad();
    this.DesignService.getCampaign(this.Campaign.id).subscribe(
      res => {
        if (res.state === 'launching') {
          DsLib.removeCampaign(this.AppService.svConfig['system.ecomerce.domain.name']);
          this.router.navigate(['/design']);
        }
        Object.keys(res).map((index) => {
          this.Campaign[index] = res[index];
        });
        this.Campaign.desc = decodeURIComponent(decodeURIComponent(this.Campaign.desc));
        this.getDomains();
        this.getCategories();
        this.getStores();
        this.product = this.getProductDefault();
        this.face = Ds.getFace(this.Campaign);
        this.DesignService.endLoad();
      },
      error => {
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  public setVisibility = (val) => this.Campaign.private = val;

  private getDomains() {
    this.DesignService.getDomains().subscribe(
      res => {
        this.arrDomains = res.domains;
        if (this.arrDomains.length) {
          if (this.Campaign.domain_id === '') {
            this.setDomain(this.arrDomains[0]);
          } else {
            Object.keys(this.arrDomains).map((index) => {
              if (this.arrDomains[index].id = this.Campaign.domain_id) {
                this.setDomain(this.arrDomains[index]);
              }
            });
          }
        }
      },
      error => {
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  public setDomain(domail) {
    this.Campaign.domain_id = domail.id;
    this.url = domail.name;
  }

  public suggestion() {
    if (this.Campaign.title !== '') {
      this.DesignService.suggestion(this.Campaign.title).subscribe(
        res => {
          this.uri = res;
          this.Campaign.url = this.uri.uri;
        },
        error => {
          console.error(error.json().message);
          return Observable.throw(error);
        }
      );
    } else {
      this.uri = JSON.parse('{"uri":"","available": true}');
    }
  }

  public checkSuggestion() {
    if (this.Campaign.url !== '') {
      this.DesignService.checkSuggestion(this.Campaign.url, this.Campaign.id).subscribe(
        res => {
          this.uri = res;
        },
        error => {
          console.error(error.json().message);
          return Observable.throw(error);
        }
      );
    } else {
      this.uri = JSON.parse('{"uri":"","available": true}');
    }
  }

  private getCategories() {
    this.DesignService.getCategories(1).subscribe(
      res => {
        this.arrCategories = DsLib.convert2select(res.categories, 'name');
        if (this.Campaign && this.Campaign.categories) {
          this.arrCatValue = this.Campaign.categories.split(',');
        }
      },
      error => {
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  private getStores() {
    this.DesignService.getStorefronts({title: '', page_size: 1000, page: 1}).subscribe(
      res => {
        this.DesignService.arrStores = DsLib.convert2select(res.stores, 'title');
      }
    );
  }

  public touchedCat = () => this.form.form.controls.sel_categories.markAsTouched();
  public touchedStores = () => this.form.form.controls.sel_stores.markAsTouched();
  public categoriesSelect = (data: { value: string[] }) => this.Campaign.categories = data.value.join(',');
  public storesSelect = (data: { value: string[] }) => this.Campaign.stores = data.value.join(',');

  public changeProduct() {
    this.dialogService.addDialog(ProductdfComponent, {
      title: 'Select product',
      campaign: this.Campaign,
      arrbasetypes: this.arrBaseTypes
    })
      .subscribe((product) => {
        this.mergProduct(product);
      });
  }

  private mergProduct(product: any) {
    if (product) {
      Object.keys(this.Campaign.products).map((index) => {
        if (this.Campaign.products[index].id === product.id) {
          this.Campaign.products[index].default = true;
          this.Campaign.products[index].back_view = product.back_view;
          this.Campaign.products[index].colors = product.colors;
        } else {
          this.Campaign.products[index].default = false;
        }
      });
      this.face = product.back_view ? 'back' : 'front';
      this.product = this.getProductDefault();
      const indexColor = this.product.colors.findIndex(x => x.default === true) >= 0 ?
        this.product.colors.findIndex(x => x.default === true) : 0;
      this.color = this.product.colors[indexColor];
    }
  }

  public setTimeLength(timeItem: any) {
    this.timeEnd = timeItem;
    this.Campaign.length = this.timeEnd.number;
  }

  public clickContinue = () => this.updateCampaign();

  private updateCampaign() {
    this.DesignService.startLoad();
    this.Campaign.state = 'launching';
    const cpU = new Campaign();
    Object.keys(this.Campaign).map((index) => {
      cpU[index] = this.Campaign[index];
    });
    cpU.desc = encodeURIComponent(cpU.desc);
    this.DesignService.updateCampaign(cpU).subscribe(
      () => {
        DsLib.removeCampaign(this.AppService.svConfig['system.ecomerce.domain.name']);
        const rout = 'http://' + this.AppService.svConfig['system.ecomerce.domain.name']
          + this.AppService.svConfig['campaign.detail.uri.prefix']
          + '/' + this.Campaign.url.split('/').join('');
        window.location.replace(rout);
      },
      error => {
        this.DesignService.endLoad();
      }
    );
  }
}
