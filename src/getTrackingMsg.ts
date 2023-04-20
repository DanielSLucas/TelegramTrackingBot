import { buildTrackingLinkMessage } from "./TrackingMessageBuilder";
import { WebScrapper } from "./WebScrapper";

interface MMTrakingResponse {
  current_step: number;
  estimated_date: string;
  steps: {
    date_last_ocurrency: string;
    progress: number;
    title: string;
  }[];
}

export async function getMMTrackingMsg(productName: string, trackingUrl: string) {
  const formatDate = (date: string) => new Date(date).toLocaleString();

  try {
    const {
      estimated_date,
      current_step: currentStepNum,
      steps
    }: MMTrakingResponse = await fetch(trackingUrl)
      .then(res => res.json());
    
    const deliverSteps = steps.map(step => {
      return {
        name: `${step.title} ${step.progress}%`,
        notStarted: step.progress === 0,
        date_last_ocurrency: step.date_last_ocurrency
      }
    })

    const currentStep = deliverSteps[currentStepNum - 1];
    const lastUpdateDate = currentStep.date_last_ocurrency ? formatDate(currentStep.date_last_ocurrency) : '';

    const msg = buildTrackingLinkMessage({
      trackingServiceName: "Madeira Madeira",
      productName,
      currentStatus: currentStep.name,
      estimatedDate: formatDate(estimated_date),
      steps: deliverSteps,
      lastUpdateDate,
      lastUpdateDescription: currentStep.name,
      trackingUrl: "https://eagle.madeiramadeira.com.br/tracking/Z32945446/12819511"
    });
  
    return msg;
  } catch (error) {
    console.log(error);
    return `Erro ao buscar os dados de tracking de ${trackingUrl}`;
  }
}

export async function getAllpostTrackingMsg(productName: string, trackingUrl: string) {
  try {
    const webScrapper = new WebScrapper();

    await webScrapper.setupBrowser();
    await webScrapper.setupPage();
  
    await webScrapper.open(trackingUrl);
    
    const estimatedDate = await webScrapper.getEstimatedDate();
    const currentStatus = await webScrapper.getCurrentStatus();
    const steps = await webScrapper.getSteps();
    const lastUpdate = await webScrapper.getLastUpdate();
  
    await webScrapper.closeBrowser();
  
    const msg = buildTrackingLinkMessage({
      trackingServiceName: "allpost",
      productName,
      currentStatus,
      estimatedDate,
      steps,
      lastUpdateDate: lastUpdate.date,
      lastUpdateDescription: lastUpdate.description,
      trackingUrl: trackingUrl
    });

    return msg;
  } catch (error) {
    console.log(error);
    return `Erro ao buscar os dados de tracking de ${trackingUrl}`;
  }
}