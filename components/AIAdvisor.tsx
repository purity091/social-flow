
import React, { useState } from 'react';
import { getSocialMediaAdvice } from '../services/geminiService';
import { Platform, AIAdvice } from '../types';
import { PLATFORM_CONFIG } from '../constants';

const AIAdvisor: React.FC = () => {
  const [niche, setNiche] = useState('التجارة الإلكترونية');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<Record<Platform, AIAdvice | null>>({
    [Platform.INSTAGRAM]: null,
    [Platform.LINKEDIN]: null,
    [Platform.X]: null,
    [Platform.TIKTOK]: null,
    [Platform.FACEBOOK]: null,
  });

  const fetchAdvice = async (platform: Platform) => {
    setLoading(true);
    try {
      const data = await getSocialMediaAdvice(platform, niche);
      setAdvice(prev => ({ ...prev, [platform]: data }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">مستشار المحتوى الذكي</h2>
          <p className="opacity-90 max-w-lg">احصل على استراتيجيات مخصصة لكل منصة بناءً على مجالك باستخدام قوة Gemini AI.</p>
          
          <div className="mt-6 flex gap-3 max-w-md">
            <input 
              type="text" 
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="أدخل مجالك (مثلاً: مطاعم، تقنية...)"
              className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors">تحديث</button>
          </div>
        </div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(Platform).map(platform => {
          const platformAdvice = advice[platform];
          const config = PLATFORM_CONFIG[platform];

          return (
            <div key={platform} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${config.color} text-white`}>
                    {config.icon('w-6 h-6')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{platform}</h3>
                    <p className="text-xs text-gray-500">نصائح خبير للمحتوى</p>
                  </div>
                </div>
                {!platformAdvice && (
                  <button 
                    disabled={loading}
                    onClick={() => fetchAdvice(platform)}
                    className="text-indigo-600 text-sm font-bold hover:underline"
                  >
                    {loading ? 'جاري التحليل...' : 'توليد الاستراتيجية'}
                  </button>
                )}
              </div>

              {platformAdvice ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span>⏰</span> أفضل أوقات النشر
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {platformAdvice.bestTimes.map((time, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span>💡</span> نصائح التفاعل
                    </h4>
                    <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                      {platformAdvice.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                  <div className={`mt-4 p-4 rounded-xl ${config.color} bg-opacity-5 border border-dashed ${config.textColor} border-opacity-30`}>
                     <h4 className="text-xs font-bold mb-2">أفكار محتوى مقترحة:</h4>
                     <p className="text-xs leading-relaxed">{platformAdvice.contentIdeas[0]}</p>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                  <span className="text-2xl mb-2">✨</span>
                  <p className="text-xs text-gray-400">اضغط لتوليد نصائح ذكية لـ {platform}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIAdvisor;
