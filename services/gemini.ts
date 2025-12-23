
import { GoogleGenAI, Modality } from "@google/genai";
import { SimulationResult, SimulationParams } from "../types";
import { CITY_AQI_DATA } from "../constants";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export const analyzeMedicalData = async (
  params: SimulationParams,
  results: SimulationResult
): Promise<string> => {
  const ai = getAIClient();
  const cityInfo = CITY_AQI_DATA.find(c => c.name === params.cityName);
  
  const prompt = `
    Multi-Organ Pathophysiology Report for ${params.cityName}:
    - Environmental Factors: Dust (${cityInfo?.dust} μg/m³), Chemicals (${cityInfo?.chemicals} μg/m³), AQI (${params.aqi}).
    - Systemic Biological Risk: Hematocrit (${params.hct}%), Cholesterol (${params.cholesterol} mg/dL).
    - Pulmonary Performance: Lung Stress (${((1 - results.aqiImpact) * 100).toFixed(1)}%), Metabolic RQ (${(results.co2Prod/results.o2Cons).toFixed(2)}).
    - Cardiac State: Heart Rate (${params.hr} BPM), Wall Shear Stress (${results.wallStress.toFixed(2)} Pa), Risk Index (${results.riskIndex.toFixed(2)}).

    As a senior specialist in Environmental Cardiology, explain the interaction between these specific urban pollutants and the patient's biological markers. 
    Analyze how the 'Pollutant Load' is currently impacting the Lung-Heart axis in ${params.cityName}. 
    Focus on the synergistic risk of disease development (e.g., atherosclerosis or pulmonary hypertension) based on these vectors.
    Keep the report under 100 words, highly technical, and clinical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class cardiologist and environmental toxicologist specializing in the urban Heart-Lung health axis.",
        temperature: 0.7,
      }
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error generating clinical report. Please check API connectivity.";
  }
};

export const generateVoiceBriefing = async (text: string): Promise<void> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Clinical update: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      await playRawPCM(base64Audio);
    }
  } catch (error) {
    console.error("TTS Generation Error:", error);
  }
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const playRawPCM = async (base64: string) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(decode(base64), audioContext, 24000, 1);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};
