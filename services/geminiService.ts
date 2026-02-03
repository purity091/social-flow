
import { GoogleGenAI, Type } from "@google/genai";
import { Platform } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSocialMediaAdvice(platform: Platform, niche: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `أنت خبير في وسائل التواصل الاجتماعي. قدم نصائح استراتيجية لمنصة ${platform} لمجال "${niche}". 
    يجب أن يتضمن الرد:
    1. أفضل أوقات النشر.
    2. نصائح لزيادة التفاعل.
    3. أفكار محتوى مبتكرة.
    الرد يجب أن يكون باللغة العربية بصيغة JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestTimes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          contentIdeas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          }
        },
        required: ["bestTimes", "tips", "contentIdeas"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateYearlyCampaignSuggestions(niche: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `اقترح 5 حملات تسويقية رئيسية على مدار العام لمجال "${niche}". 
    حدد اسم الحملة، الوصف، الشهر المقترح، واللون المميز (كود HEX).
    الرد بصيغة JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            month: { type: Type.INTEGER },
            color: { type: Type.STRING }
          },
          required: ["name", "description", "month", "color"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateBulkPosts(params: {
  niche: string,
  platform: Platform,
  count: number,
  startDate: string,
  endDate: string
}) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `بصفتك خبيراً، قم بإنشاء برنامج محتوى يحتوي على ${params.count} منشور لمنصة ${params.platform} في مجال ${params.niche}.
    الفترة الزمنية من ${params.startDate} إلى ${params.endDate}.
    وزع التواريخ بشكل متساوي واحترافي.
    أجب بصيغة JSON كمصفوفة من الكائنات تحتوي على (title, content, date).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            date: { type: Type.STRING, description: "ISO Date String" }
          },
          required: ["title", "content", "date"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}
