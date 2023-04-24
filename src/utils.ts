const lastUpdateDateRegex = /(?<=\*Última\satualização\*:\s)(?<lastUpdateDate>.+)$/gm;
export const getLastUpdateDate = (msg: string) => {
  return msg.match(lastUpdateDateRegex)?.[0];
}

export const log = (...args: string[]) => console.log(`[${new Date().toLocaleTimeString()}] - ${args.join(" ")}`);

export function sendUpdatedTrackingMessage(
  msg: string, lastUpdateDateOfLastSentMsg: string, fn: (lastUpdateDate: string) => void
) {
  const lastUpdateDate = getLastUpdateDate(msg) || '';
  const msgHasUpdated = lastUpdateDateOfLastSentMsg !== lastUpdateDate;

  if (msgHasUpdated) {
    fn(lastUpdateDate);
    log("Rastreio com atualizações");
  } else {
    log("Rastreio sem atualizações")
  }
}
