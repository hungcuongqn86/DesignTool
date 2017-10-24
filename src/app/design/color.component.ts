import {Component, OnInit} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';

export interface PromptModel {
  oProduct: any;
  mainOpt: any;
  face;
}

@Component({
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.css']
})
export class ColorComponent extends DialogComponent<PromptModel, string> implements PromptModel, OnInit {
  oProduct: any;
  mainOpt: any = [];
  face = 'front';
  color: any = null;
  colors: any = [];
  check = false;

  constructor(dialogService: DialogService) {
    super(dialogService);
  }

  ngOnInit() {
    Object.keys(this.oProduct.colors).map((index) => {
      this.colors[index] = this.oProduct.colors[index];
    });
  }

  public checkColor(color: any) {
    for (let i = 0; i < this.colors.length; i++) {
      if (this.colors[i].id === color.id) {
        return i;
      }
    }
    return -1;
  }

  public selectColor(color) {
    this.check = true;
    const check = this.checkColor(color);
    if (check < 0) {
      this.colors.push(color);
      this.color = color;
    } else {
      if (this.colors.length > 1) {
        this.colors.splice(check, 1);
      }
    }
  }

  public previewColor = color => this.color = color;

  public getContrastYIQ(hex) {
    const ishex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);
    if (!ishex) {
      return '#000000';
    }
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
    }
    // invert color components
    const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
      g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
      b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + this.padZero(r) + this.padZero(g) + this.padZero(b);
  }

  private padZero(str, len = 2) {
    const zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
  }

  public mdClose = () => this.close();

  public confirm() {
    this.result = this.check ? this.colors : null;
    this.close();
  }
}
