import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';
import cron from "node-cron";
import { Telegraf } from 'telegraf';

import { getMMTrackingMsg, getAllpostTrackingMsg } from './getTrackingMsg';
import { log, sendUpdatedTrackingMessage } from './utils';

config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

log("Stating application", new Date().toLocaleDateString())

const PRODUCTS_FILE_PATH = path.resolve(__dirname, "..", "products.json");

const sendMessage = (msg: string) => bot.telegram.sendMessage(1093125492, msg, { parse_mode: 'Markdown' });

cron.schedule('0 0,15,30,45 * * * *', async () => {
  log("Iniciando automação...");

  let products = JSON.parse(
    (await readFile(PRODUCTS_FILE_PATH)).toString()
  );

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    log(`Buscando informações de rastreio do(a) ${product.name}`);

    let trackingMsg = "";

    if (product.trackingServiceName === "Madeira Madeira") {
      trackingMsg = await getMMTrackingMsg(
        "armário de cozinha 6 portas", 
        "https://eagle.madeiramadeira.com.br/tracking/mm/pedido?order=Z32945446&collect=12819511"
      );
    } else if (product.trackingServiceName === "AllPost") {
      trackingMsg = await getAllpostTrackingMsg(
        "armário de aço 3 portas", 
        "https://www.allpost.com.br/rastreio/8358/47a705eb9d01381cc0eb2879f4ae3691"
      );
    }

    sendUpdatedTrackingMessage(
      trackingMsg, 
      product.lastUpdateDate, 
      (lastUpdateDate: string) => {
        products[i].lastUpdateDate = lastUpdateDate;
        sendMessage(trackingMsg)
      }
    );
  }

  await writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products, undefined, 2));

  log("Finalizando automação.")
});


["SIGINT", "SIGTERM"].forEach((event) => {
  process.on(event, () => {
    bot.stop(event);
    log("Finishing application", new Date().toLocaleDateString())
    process.exit(0);
  });
});
