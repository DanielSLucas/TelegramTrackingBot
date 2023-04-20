import { config } from 'dotenv';
import cron from "node-cron";
import { Telegraf } from 'telegraf';
import { getMMTrackingMsg, getAllpostTrackingMsg } from './getTrackingMsg';

config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

console.log("Stating application", new Date());

cron.schedule('0 30 * * * *', async () => {
  console.log(`Pegando informações de rastreio do armário de cozinha 6 portas`)
  const msgMM = await getMMTrackingMsg(
    "armário de cozinha 6 portas", 
    "https://eagle.madeiramadeira.com.br/tracking/mm/pedido?order=Z32945446&collect=12819511"
  );

  bot.telegram.sendMessage(1093125492, msgMM, { parse_mode: 'Markdown' });

  console.log(`Pegando informações de rastreio do armário de aço 3 portas`);
  const msgAllpost = await getAllpostTrackingMsg(
    "armário de aço 3 portas", 
    "https://www.allpost.com.br/rastreio/8358/47a705eb9d01381cc0eb2879f4ae3691"
  );

  bot.telegram.sendMessage(1093125492, msgAllpost, { parse_mode: 'Markdown' });

  console.log(`Mensagens enviadas`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
