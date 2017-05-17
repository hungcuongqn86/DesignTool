import { Ng2DesignToolPage } from './app.po';

describe('ng2-design-tool App', () => {
  let page: Ng2DesignToolPage;

  beforeEach(() => {
    page = new Ng2DesignToolPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
