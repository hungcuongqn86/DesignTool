export class Ds {
  static _getMainOpt(type, face, arrBaseTypes, campaign) {
    let res = {status: false, minX: 0, minY: 0, maxX: 0, maxY: 0};
    const typeGroup = Ds.getBaseGroup(arrBaseTypes, type);
    for (const item of campaign.products) {
      if (item.base.type) {
        const typeGroupIndex = Ds.getBaseGroup(arrBaseTypes, item.base.type.id);
        const check = item.designs.findIndex(x => ((x.main === true) && (typeGroupIndex === typeGroup)));
        if (check >= 0) {
          res = Ds.getOpt(face, item);
          res.status = true;
          return res;
        }
      }
    }
    return res;
  }

  static getOpt(face, product) {
    const leftkey = face + '_left', topkey = face + '_top', widthkey = face + '_width',
      heightkey = face + '_height';
    const res = {status: false, minX: 0, minY: 0, maxX: 0, maxY: 0};
    res.minX = Number(product.base.printable[leftkey]);
    res.minY = Number(product.base.printable[topkey]);
    res.maxX = Number(product.base.printable[leftkey]) +
      Number(product.base.printable[widthkey]);
    res.maxY = Number(product.base.printable[topkey]) +
      Number(product.base.printable[heightkey]);
    res.status = true;
    return res;
  }

  static getBaseGroup(arrBaseTypes, baseType): string {
    for (const item of arrBaseTypes) {
      const check = item.base_types.findIndex(x => x.id === baseType);
      if (check >= 0) {
        return item.id;
      }
    }
    return '';
  }

  static getFace(campaign): any {
    const check = campaign.products.findIndex(x => x.default === true);
    if (check >= 0) {
      if (campaign.products[check].back_view) {
        return 'back';
      }
    }
    return 'front';
  }

  constructor() {
  }
}
