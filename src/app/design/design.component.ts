import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {NgModel} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {Campaign, Design, DesignService, Product} from '../design.service';
import {UploadService} from '../services/upload.service';
import {AppService} from '../services/app.service';
import {ProductComponent} from './product.component';
import {ColorComponent} from './color.component';
import {ConfirmComponent} from '../public/confirm.component';
import {DialogService} from 'ng2-bootstrap-modal';
import {colorInColumn, sFaceDf} from '../lib/const';
import {Ds} from '../lib/ds';
import {DsLib} from '../lib/lib';

declare const SVG: any;

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.css']
})
export class DesignComponent implements OnInit, OnDestroy {
  @ViewChild('form1') form: NgModel;
  face = sFaceDf;
  color = null;
  Product: Product;
  arrBaseTypes: any = [];
  arrBase: any = [];
  fDesign: any = {'sBaseType': '', 'sBaseTypeName': ''};
  draw: any;
  nested: any;
  imageCr: any;
  productColor: any;
  productImg: any;
  printable: any;
  line: any;
  selectItem: any;
  dsrsSave: any;
  basecost = 0;
  sellShow: boolean = true;

  loadconflic = false;
  moreColor = false;

  private subs: any;
  private DialogSubs: any;

  constructor(private location: Location, public Campaign: Campaign,
              public DesignService: DesignService, private dialogService: DialogService,
              private UploadService: UploadService,
              private AppService: AppService,
              private router: Router) {
    this.DesignService.canActive = [''];
    this.Campaign.step = 1;
    this.Product = new Product();
    this.initCampaign(DsLib.getCampaignId());
  }

  ngOnInit() {
    const myobj = this;
    this.draw = SVG('drawing');
    this.productColor = this.draw.rect().fill(DsLib.getColorDefault());
    this.productImg = this.draw.image().click(function () {
      myobj.resetSelect();
    });
    this.printable = this.draw.polyline().fill('none').stroke({color: 'rgba(0, 0, 0, 0.3)', width: 1});
    this.nested = this.draw.nested();
    this.line = this.draw.line(0, 0, 0, 0).stroke({color: 'rgb(35, 173, 228)', width: 1}).opacity(0);
    this.getBaseTypes();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  private unsubscribe() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  private initCampaign(id) {
    let self = this;
    this.DesignService.startLoad();
    let userId = '';
    if (DsLib.checkLogin()) {
      userId = DsLib.getToken().user_id;
    }
    this.subs = this.DesignService.initCampaign(id, userId).subscribe(
      res => {
        this.unsubscribe();
        if (res.state === 'launching') {
          DsLib.removeCampaign(this.AppService.svConfig['system.ecomerce.domain.name']);
          this.initCampaign('');
        }
        // check validate for btn sell this
        this.setBtnSellShow(res.products);

        Object.keys(res).map((index) => {
          this.Campaign[index] = res[index];
        });
        this.location.go(`/design/${this.Campaign.id}}`);
        if (this.Campaign.products.length) {
          const checkExit = this.Campaign.products.findIndex(x => x.id === this.Product.id);
          if (checkExit < 0) {
            Object.keys(this.Campaign.products[0]).map((index) => {
              this.Product[index] = this.Campaign.products[0][index];
            });
          } else {
            Object.keys(this.Campaign.products[checkExit]).map((index) => {
              this.Product[index] = this.Campaign.products[checkExit][index];
            });
          }
          this.selectProduct(this.Product);
        } else {
          this.loadconflic = true;
        }
      },
      error => {
        this.unsubscribe();
        this.DesignService.endLoad();
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  private getCampaign() {
    this.DesignService.getCampaign(this.Campaign.id).subscribe(
      res => {
        Object.keys(res).map((index) => {
          this.Campaign[index] = res[index];
        });
        this.DesignService.endLoad();
      },
      error => {
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  private reActionUpdateDesign() {
    this.dsrsSave.product_id = this.Product.id;
    this.DesignService.updateDesign(this.dsrsSave).subscribe(
      () => {
        this.getCampaign();
      },
      error => {
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
    this.dsrsSave = null;
  }

  private updateCampaign() {
    let self = this;
    this.subs = this.DesignService.updateCampaign(this.Campaign).subscribe(
      res => {
        // check validate for btn sell this
        this.setBtnSellShow(res.products);

        Object.keys(res).map((index) => {
          this.Campaign[index] = res[index];
        });

        const productIndex = this.Campaign.hasBase(this.Product.base.id);
        if (productIndex >= 0) {
          Object.keys(this.Campaign.products[productIndex]).map((index) => {
            this.Product[index] = this.Campaign.products[productIndex][index];
          });
        }
        this.unsubscribe();
        if (this.dsrsSave) {
          this.reActionUpdateDesign();
        } else {
          this.selectProduct(this.Product);
        }
      },
      error => {
        this.unsubscribe();
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  private getBaseTypes() {
    const sub = this.DesignService.getBaseTypes().subscribe(
      data => {
        this.arrBaseTypes = data;
        if (this.arrBaseTypes.length) {
          if (this.loadconflic) {
            if (this.Product.base.type.id) {
              this.selectBaseType(this.Product.base.type.id);
            } else {
              this.selectBaseType(this.arrBaseTypes[0].base_types[0].id);
            }
          } else {
            this.loadconflic = true;
          }
        }
        sub.unsubscribe();
      },
      error => {
        sub.unsubscribe();
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  public handleFileSelect(evt) {
    this.UploadService.startLoad();
    const files = evt.target.files;
    if (files) {
      this.subs = this.UploadService.makeFileRequest(files).subscribe(
        (data) => {
          this.addDesign(data);
          this.UploadService.endLoad();
          this.unsubscribe();
          this.form['controls']['filePicker'].reset();
          this.sellShow = true;
        },
        error => {
          const jerror = JSON.parse(error);
          if (jerror.message) {
            this.DesignService.http.alert(jerror.message);
          }
          this.unsubscribe();
          this.UploadService.endLoad();
          this.form['controls']['filePicker'].reset();
        }
      );
    }
  }

  private addDesign(fileData) {
    this.DesignService.startLoad();
    const newDesign = new Design();
    newDesign.product_id = this.Product.id;
    newDesign.type = this.face;
    newDesign.image.position = this.Product.designs.length + 1;
    newDesign.image.url = fileData.url;
    newDesign.image.width = fileData.width.toString();
    newDesign.image.height = fileData.height.toString();
    this.DesignService.addDesign(newDesign).subscribe(
      (data) => {
        const img = data;
        img.campaign_id = this.Campaign.id;
        img.product_id = this.Product.id;
        img.image.printable_top = 0;
        img.image.printable_left = 0;
        img.image.printable_width = this.Product.getWidth(this.face);
        img.image.printable_height = (img.image.printable_width * img.image.height / img.image.width).toFixed(2);
        if (img.image.printable_height > this.Product.getHeight(this.face)) {
          img.image.printable_height = this.Product.getHeight(this.face);
          img.image.printable_width = (img.image.printable_height * img.image.width / img.image.height).toFixed(2);
        }
        this.subs = this.DesignService.updateDesign(img).subscribe(
          () => {
            this.unsubscribe();
            this.initCampaign(this.Campaign.id);
          },
          error => {
            this.unsubscribe();
            this.DesignService.endLoad();
            this.initCampaign(this.Campaign.id);
          }
        );
      },
      error => {
        this.DesignService.endLoad();
      }
    );
  }

  public selectBaseType(id) {
    this.fDesign.sBaseType = id;
    this.fDesign.sBaseTypeName = this.getBaseTypeName(id);
    this.getBases();
  }

  private getBaseTypeName(id): string {
    for (const BaseTypes of this.arrBaseTypes) {
      for (const BaseType of BaseTypes.base_types) {
        if (BaseType.id === id) {
          return BaseType.name;
        }
      }
    }
    return '';
  }

  private getBases() {
    this.DesignService.startLoad();
    this.subs = this.DesignService.getBases(this.fDesign.sBaseType).subscribe(
      data => {
        this.arrBase = data;
        if ((this.Product.base) && (this.Product.base.id !== '')) {
          this.selectBase(this.Product.base.id);
        } else {
          if (this.arrBase.length > 0) {
            this.selectBase(this.arrBase[0].id);
          }
        }
        this.unsubscribe();
      },
      error => {
        this.unsubscribe();
        this.DesignService.endLoad();
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  public selectBase(id) {
    this.DesignService.startLoad();
    for (const item of this.arrBase) {
      const value = item.id;
      if (value === id) {
        this._selectBase(item);
        return false;
      }
    }
    this.DesignService.endLoad();
    return false;
  }

  private getColor(color: any, arrcolors: any) {
    if (color) {
      if (arrcolors.length) {
        const index = arrcolors.findIndex(x => x.id === color.id);
        if (index < 0) {
          return arrcolors[0];
        } else {
          return color;
        }
      } else {
        return null;
      }
    } else {
      if (arrcolors.length) {
        return arrcolors[0];
      } else {
        return null;
      }
    }
  }

  public _selectBase(base: any) {
    const productIndex = this.Campaign.hasBase(base.id);
    if (productIndex >= 0) {
      if ((this.Product.base.id !== this.Campaign.products[productIndex].base.id)) {
        Object.keys(this.Campaign.products[productIndex]).map((index) => {
          this.Product[index] = this.Campaign.products[productIndex][index];
        });
        this.selectProduct(this.Product);
        return false;
      }
    } else {
      if ((this.Product) && (this.Product.base) && (this.Product.base.id !== '')) {
        if (Ds.getBaseGroup(this.arrBaseTypes, this.Product.base.type.id) !== Ds.getBaseGroup(this.arrBaseTypes, base.type.id)) {
          this.Product.designs = this.getDesign(base.type.id);
        }
      }
      this.Product.colors = [];
      this.basecost = DsLib.getPrice(this.Product.designs, base, this.AppService.svConfig);
    }
    this.Product.base = base;
    this.setFace(this.face);
    this.color = this.getColor(this.color, this.Product.colors);
    if (!this.color) {
      if (this.Product.base.colors) {
        this.color = this.getColor(this.color, this.Product.base.colors);
      }
    }
    this.setColor(this.color);
    this.setSize();
  }

  private getDesign(typeid): any {
    const typeGroup = Ds.getBaseGroup(this.arrBaseTypes, typeid);
    for (let index = 0; index < this.Campaign.products.length; index++) {
      if (Ds.getBaseGroup(this.arrBaseTypes, this.Campaign.products[index].base.type.id) === typeGroup) {
        return this.Campaign.products[index].designs;
      }
    }
    return [];
  }

  private setSize() {
    this.draw.size(this.Product.base.image.width, this.Product.base.image.height);
    this.productImg.size(this.Product.base.image.width, this.Product.base.image.height);
    this.productColor.size(this.Product.base.image.width, this.Product.base.image.height);
  }

  public setFace(face) {
    this.face = face;
    const imgurl = DsLib.getBaseImgUrl(this.face, this.Product.base);
    const myjs = this;
    DsLib.imageExists(imgurl, function (exists) {
      if (exists) {
        myjs.productImg.load(imgurl);
        myjs.genDesign();
        myjs.setPrintable();
      } else {
        if (sFaceDf !== face) {
          myjs.setFace(sFaceDf);
        } else {
          myjs.DesignService.http.alert('image not found!');
          myjs.DesignService.endLoad();
        }
      }
    });
  }

  private resetSelect() {
    const nestedElement = this.nested.children();
    Object.keys(nestedElement).map((index) => {
      if (nestedElement[index].type === 'image') {
        nestedElement[index].selectize(false, {deepSelect: true});
      }
    });
    this.selectItem = null;
  }

  private setPrintable() {
    this.printable.clear();
    this.printable.plot(this.Product.getPrintablePoint(this.face));
    const opt = Ds.getOpt(this.face, this.Product);
    const lX = opt.minX + ((opt.maxX - opt.minX) / 2);
    this.line.plot(lX, 0, lX, this.Product.base.image.height);
    this.DesignService.endLoad();
  }

  private resizeImg(img: any, dsrsold: any) {
    const optnew = Ds.getOpt(this.face, this.Product);
    const optold = Ds._getMainOpt(this.Product.base.type.id, this.face, this.arrBaseTypes, this.Campaign);
    let dsrs: any;
    for (let index = 0; index < this.Campaign.products.length; index++) {
      const check = this.Campaign.products[index].designs.findIndex(x => x.id === dsrsold.id);
      if (check >= 0) {
        dsrs = this.Campaign.products[index].designs.filter(function (itm) {
          return itm.id === dsrsold.id;
        })[0];
        break;
      }
    }
    if (!dsrs) {
      return false;
    }
    const tlX: number = (optnew.maxX - optnew.minX) / (optold.maxX - optold.minX);
    const tlY: number = (optnew.maxY - optnew.minY) / (optold.maxY - optold.minY);
    const mx: number = dsrs.image.printable_left * tlX;
    const my: number = dsrs.image.printable_top * tlY;
    let mW = dsrs.image.printable_width * tlX;
    let mH = 0;
    if (optnew.minX + mx + mW <= optnew.maxX) {
      mH = mW * dsrs.image.height / dsrs.image.width;
    } else {
      mW = optnew.maxX - (optnew.minX + mx);
      mH = mW * dsrs.image.height / dsrs.image.width;
    }

    if (optnew.minY + my + mH > optnew.maxY) {
      mH = optnew.maxY - (optnew.minY + my);
      mW = mH * dsrs.image.width / dsrs.image.height;
    }
    img.move(optnew.minX + mx, optnew.minY + my).size(mW, mH);
  }

  public getOldOpt = product => product.base.type ?
    Ds._getMainOpt(product.base.type.id, this.face, this.arrBaseTypes, this.Campaign) : null;

  public setColor(sColor: any) {
    if (sColor) {
      this.color = sColor;
      this.productColor.fill(sColor.value);
    } else {
      this.productColor.fill(DsLib.getColorDefault());
    }
  }

  public changeColor = (sColor: any) => this.color = sColor;

  private setValidate() {
    const nestedElement = this.nested.children();
    this.DesignService.validate1 = (nestedElement.length > 0);
  }

  public addImg(dsrs: any) {
    const myobj = this;
    this.nested.image(dsrs.image.url)
      .loaded(function () {
        this.id = dsrs.id;
        myobj.resizeImg(this, dsrs);
        myobj.setValidate();
      })
      .click(function () {
        myobj.resetSelect();
        const opt = Ds.getOpt(myobj.face, myobj.Product);
        this.selectize().resize({
          constraint: opt
        }).draggable(opt);
        myobj.selectItem = this;
      })
      .on('delete', function () {
        myobj.deleteImg();
      })
      .on('dragstart', function () {
        myobj.line.animate(100, '-', 0).attr({opacity: 1});
        myobj.imageCr = this.x().toFixed(2) + '-' + this.y().toFixed(2);
      })
      .on('dragend', function () {
        myobj.line.animate(100, '-', 0).attr({opacity: 0});
        if (this.x().toFixed(2) + '-' + this.y().toFixed(2) !== myobj.imageCr) {
          myobj.updateDesign(this, dsrs);
        }
      })
      .on('resizing', function () {
        myobj.imageCr = this.height().toFixed(2) + '-' + this.width().toFixed(2);
      })
      .on('resizedone', function () {
        if (this.height().toFixed(2) + '-' + this.width().toFixed(2) === myobj.imageCr) {
          myobj.updateDesign(this, dsrs);
        }
      });
  }

  private updateDesign(image: any, dsrs: any) {
    this.DesignService.startLoad();
    const ds = new Design();
    delete ds.image.data;
    delete ds.image.mime_type;
    ds.id = dsrs.id;
    ds.campaign_id = this.Campaign.id;
    ds.product_id = this.Product.id;
    ds.type = dsrs.type;
    ds.image.id = dsrs.image.id;
    ds.image.position = dsrs.image.position;
    ds.image.width = dsrs.image.width;
    ds.image.height = dsrs.image.height;
    ds.image.printable_top = (image.y() - this.printable.y()).toFixed(2);
    ds.image.printable_left = (image.x() - this.printable.x()).toFixed(2);
    ds.image.printable_width = image.width().toFixed(2);
    ds.image.printable_height = image.height().toFixed(2);
    if (this.Campaign.hasBase(this.Product.base.id) >= 0) {
      this.subs = this.DesignService.updateDesign(ds).subscribe(
        () => {
          this.unsubscribe();
          this.getCampaign();
        },
        error => {
          this.unsubscribe();
          console.error(error.json().message);
          this.initCampaign(this.Campaign.id);
          return Observable.throw(error);
        }
      );
    } else {
      delete ds.product_id;
      this.dsrsSave = ds;
      this.DesignService.endLoad();
    }
  }

  public selectLayer(leyer: any) {
    const opt = Ds.getOpt(this.face, this.Product);
    this.resetSelect();
    leyer.selectize().resize({
      constraint: opt
    }).draggable(opt);
    this.selectItem = leyer;
  }

  public deleteImg() {
    if (this.selectItem) {
      this.deleteLayer(this.selectItem);
    }
  }

  public deleteLayer(leyer: any) {
    this.DesignService.deleteDesign(leyer, this.Product.id).subscribe(
      () => {
        this.initCampaign(this.Campaign.id);
      },
      error => {
        console.error(error.json().message);
        return Observable.throw(error);
      }
    );
  }

  public _addProduct() {
    const newProduct = new Product();
    newProduct.base.id = this.Product.base.id;
    let color: any;
    if (this.color) {
      if (this.Product.base.colors) {
        const index = this.Product.base.colors.findIndex(x => x.id === this.color.id);
        if (index < 0) {
          if (this.Product.base.colors.length) {
            color = this.Product.base.colors[0];
          }
        } else {
          color = this.color;
        }
      }
    } else {
      if (newProduct.base.colors) {
        color = this.Product.base.colors[0];
      }
    }
    newProduct.position = this.Campaign.products.length + 1;
    if (color) {
      newProduct.colors.push({id: color.id});
    }
    this.Campaign.add(newProduct);
    this.updateCampaign();
    this.setColor(color);
  }

  public addProduct() {
    this.DialogSubs = this.dialogService.addDialog(ProductComponent, {
      title: 'Select product'
    }, {closeByClickingOutside: true})
      .subscribe((product) => {
        if (product) {
          this.Product.base = product;
          this._addProduct();
        }
        this.DialogSubs.unsubscribe();
      });
  }

  public selectProduct(Product) {
    this.DesignService.startLoad();
    this.Product.id = Product.id;
    this.Product.base = Product.base;
    this.Product.colors = Product.colors;
    this.Product.designs = Product.designs;
    this.basecost = Product.base.cost;
    if (this.loadconflic) {
      this.selectBaseType(this.Product.base.type.id);
    } else {
      this.loadconflic = true;
    }
  }

  private genDesign() {
    this.nested.clear();
    if (this.Product.designs.length > 0) {
      Object.keys(this.Product.designs).map((index) => {
        if (this.Product.designs[index].type === this.face) {
          this.addImg(this.Product.designs[index]);
        }
      });
    } else {
      this.setValidate();
    }
  }

  public deleteProduct(id) {
    this.DialogSubs = this.DesignService.dialogService.addDialog(ConfirmComponent, {
      title: 'Confirm delete product',
      message: 'You sure want to delete this record!'
    })
      .subscribe((isConfirmed) => {
        if (isConfirmed) {
          if (this.Campaign.deletePro(id)) {
            if (this.Campaign.products.findIndex(x => x.default === true) < 0) {
              this.Campaign.products[0].default = true;
            }
            // If delete product main
            let prodIndex = this.Campaign.products.findIndex(x => x.base.id === this.Product.base.id);
            if (prodIndex < 0) {
              prodIndex = 0;
            }
            const optold = Ds._getMainOpt(this.Product.base.type.id, this.face, this.arrBaseTypes, this.Campaign);
            if (!optold.status) {
              const typeGroup = Ds.getBaseGroup(this.arrBaseTypes, this.Product.base.type.id);
              for (let i = 0; i < this.Campaign.products.length; i++) {
                if (this.Campaign.products[i].base.type) {
                  const typeGroupIndex = Ds.getBaseGroup(this.arrBaseTypes, this.Campaign.products[i].base.type.id);
                  if (typeGroup === typeGroupIndex) {
                    Object.keys(this.Campaign.products[i].designs).map((index) => {
                      this.Campaign.products[i].designs[index].main = true;
                    });
                    break;
                  }
                }
              }
            }
            this.Product.id = this.Campaign.products[prodIndex].id;
            this.Product.base = this.Campaign.products[prodIndex].base;
            this.sellShow = true;
            this.updateCampaign();
          }
        }
        this.DialogSubs.unsubscribe();
      });
    setTimeout(() => {
      this.DialogSubs.unsubscribe();
    }, 10000);
  }

  public setBtnSellShow(products: Product[]) {
    let self = this;
    products.map((product) => {
      if( product.designs.length == 0 ) {
        self.sellShow = false;
        return;
      }
    });
  }

  public addColor(oProduct: Product) {
    this.DialogSubs = this.dialogService.addDialog(ColorComponent, {
      oProduct: oProduct,
      mainOpt: Ds._getMainOpt(oProduct.base.type.id, this.face, this.arrBaseTypes, this.Campaign),
      face: 'front'
    }, {closeByClickingOutside: true}).subscribe((colors) => {
      if (colors) {
        oProduct.colors = colors;
        this.updateCampaign();
      }
      this.DialogSubs.unsubscribe();
    });
  }

  public expColors = (val: boolean) => this.moreColor = val;

  public clickContinue() {
    this.DesignService.canActive = ['pricing'];
    this.router.navigate(['/pricing']);
  }

  public genColumnColor(colors: Array<any>, moreColors: boolean): Array<any> {
    const res: Array<any> = [];
    if (colors.length > colorInColumn) {
      let arrColor = [];
      let dem = 0;
      for (let i = 0; i < colors.length; i++) {
        arrColor.push(colors[i]);
        if (i === (colorInColumn - 2)) {
          arrColor.push('more');
          res.push(arrColor);
          arrColor = [];
          dem = 0;
          if (!moreColors) {
            return res;
          }
        } else {
          if (dem === (colorInColumn - 1)) {
            res.push(arrColor);
            arrColor = [];
            dem = 0;
          } else {
            dem = dem + 1;
          }
        }
      }
      res.push(arrColor);
    } else {
      res.push(colors);
    }
    return res;
  }
}
