import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from "puppeteer";

export class WebScrapper {
  private _browser: Browser | null = null;
  private _page: Page | null = null;  

  async setupBrowser(options?: PuppeteerLaunchOptions) {
    this._browser = await puppeteer.launch(options);    
  }

  get browser () {
    if (!this._browser) {
      throw new Error("You need to call setupBrowser() first");
    };
    return this._browser as Browser;
  }

  async setupPage() {
    this._page = await this.browser.newPage();
  }

  get page () {
    if (!this._page) {
      throw new Error("You need to call setupPage() first");
    }
    return this._page as Page;
  }

  async open(url: string) {
    try {
      await this.page.goto(url);

      return this;
    } catch {
      throw new Error("Fail to open url");
    }
  }

  async getEstimatedDate() {
    return this.page.evaluate(() => {
      const divPrevisao = document.querySelector(".previsao");

      if(!divPrevisao) {
        throw new Error("Failed to find div.previsao");
      }

      const divPrevisaoText = (divPrevisao as Element & { innerText: string }).innerText;

      const date = divPrevisaoText.match(/\d{2}\/\d{2}\/\d{4}/)?.[0];

      return date as string;
    });
  }

  async getCurrentStatus() {
    return this.page.evaluate(() => {
      const statuses = document.querySelectorAll(".divflex.st.fundoVerde .textst");

      if(!statuses || !statuses.length) {
        throw new Error("Failed to find statuses");
      }

      const lastStatusTag = statuses[statuses.length - 1];

      const status = (lastStatusTag as Element & { innerText: string }).innerText.replace("\n", " ");

      return status;
    });
  }

  async getSteps(): Promise<{ name: string, notStarted: boolean }[]> {
    return this.page.evaluate(() => {    
      const statuses = document.querySelectorAll(".divflex.st .textst")        
  
      if (!statuses || !statuses.length) {
        throw new Error("Failed to find statuses");
      }
  
      const steps = Array.from(statuses).map(
        element => {
          const el = element as Element & { innerText: string };

          const name = el.innerText.replace("\n", " ");
          const notStarted = !el.parentElement?.className.includes("fundoVerde") || false;

          return {
            name,
            notStarted
          }
        }
      );
  
      return steps;
    });
  }

  async getLastUpdate(): Promise<{ date: string, description: string }> {
    return this.page.evaluate(() => {
      const firstTableRow = document.querySelector("table tbody tr");

      if(!firstTableRow) {
        throw new Error("Failed to last update");
      }

      const columns = Array.from(firstTableRow.children) as (Element & { innerText: string })[];

      const date = columns[0].innerText.replace("\n", " ");
      const description = columns[1].innerText;

      return {
        date,
        description
      };
    });
  }

  async closeBrowser() {
    await this.browser.close()
  }
}
