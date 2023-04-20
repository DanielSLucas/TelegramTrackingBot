interface Step {
  name: string;
  notStarted: boolean;
}

export class TrackingMessageBuilder {
  private message: string[] = [];

  trackingServiceName(name: string) {
    this.addToMessage(`*Tracking ${name}*`);
    return this;
  }

  productName(name: string) {
    this.addToMessage(`*Product*: ${name}.`);
    return this;
  }

  currentStatus(status: string) {
    this.addToMessage(`*Status*: ${status}.`);
    return this;
  }

  estimatedDeliveryDate(date: string) {
    this.addToMessage(`*Previsão de entrega*: ${date}.`);
    return this;
  }

  deliverSteps(steps: Step[]) {
    for (const step of steps) {
      this.addToMessage(
        `- ${step.name} ${step.notStarted ? '➖' : '✅'}`
      );
    }

    return this;
  }

  lastUpdateDate(date: string) {
    this.addToMessage(`*Última atualização*: ${date}.`);
    return this;
  }

  lastUpdateDescription(description: string) {
    this.addToMessage(`${description}`);
    return this;
  }

  trackingLink(link: string) {
    this.addToMessage(`[Link de rastreio](${link})`);
    return this;
  }

  emptyLine() {
    this.addToMessage(" ");
    return this;
  }

  private addToMessage(text: string) {
    this.message.push(text);
  }

  build() {
    return this.message.join('\n');
  }
}

interface TrackingLinkMessageData {
  trackingServiceName: string;
  productName: string;
  currentStatus: string;
  estimatedDate: string;
  steps: Step[];
  lastUpdateDate: string;
  lastUpdateDescription: string;
  trackingUrl: string;
}

export function buildTrackingLinkMessage({
  trackingServiceName,
  productName,
  currentStatus,
  estimatedDate,
  steps,
  lastUpdateDate,
  lastUpdateDescription,
  trackingUrl,
}: TrackingLinkMessageData) {
  return new TrackingMessageBuilder()
    .trackingServiceName(trackingServiceName)
    .emptyLine()
    .productName(productName)
    .emptyLine()
    .currentStatus(currentStatus)
    .estimatedDeliveryDate(estimatedDate)
    .emptyLine()
    .deliverSteps(steps)
    .emptyLine()
    .lastUpdateDate(lastUpdateDate)
    .lastUpdateDescription(lastUpdateDescription)
    .emptyLine()
    .trackingLink(trackingUrl)
    .build()
}