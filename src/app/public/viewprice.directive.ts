import {Directive, ElementRef, Input, OnChanges} from '@angular/core';

@Directive({selector: '[appViewprice]'})
export class ViewpriceDirective implements OnChanges {
  @Input('appViewprice')
  public appViewprice = 0;

  constructor(private el: ElementRef) {
  }

  ngOnChanges(changes) {
    if (changes.appViewprice) {
      this.el.nativeElement.innerHTML = '';
      const pricefirst = Math.floor(this.appViewprice);
      const pricesecondcal = (this.appViewprice - pricefirst) * 100;
      const pricesecond = Math.floor(pricesecondcal);
      const fSpan = document.createElement('span');
      fSpan.innerHTML = '$' + pricefirst.toString();
      this.el.nativeElement.appendChild(fSpan);
      const sSpan = document.createElement('span');
      if (pricesecond > 0) {
        sSpan.innerHTML = pricesecond.toString();
      }
      this.el.nativeElement.appendChild(sSpan);
    }
  }
}
