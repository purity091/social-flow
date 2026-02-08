
import React, { useState } from 'react';
import { Platform, Post } from '../types';
import { Zap } from 'lucide-react';

interface BulkGeneratorProps {
  onPostsGenerated: (posts: Post[]) => void;
}

const BulkGenerator: React.FC<BulkGeneratorProps> = ({ onPostsGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [niche, setNiche] = useState('التجارة الإلكترونية');
  const [platform, setPlatform] = useState<Platform>(Platform.INSTAGRAM);
  const [count, setCount] = useState(30);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const handleGenerate = async () => {
    setLoading(true);
    const timestamp = Date.now();
    const programId = `prog-${timestamp}`;
    const programName = `برنامج ${niche} - ${new Date().toLocaleDateString('ar-SA')}`;

    try {
      // Generate dummy posts locally (Pattern Generation)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDuration = end.getTime() - start.getTime();
      const interval = totalDuration / Math.max(1, count - 1);

      const rawPosts = Array.from({ length: count }, (_, i) => {
        const date = new Date(start.getTime() + (i * interval));
        return {
          title: `منشور ${i + 1} - ${niche}`,
          content: `[محتوى هيكلي] الهدف من هذا المنشور هو: تعزيز التفاعل في مجال ${niche}.`,
          date: date.toISOString()
        };
      });

      // Simulate a short delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const formattedPosts: Post[] = rawPosts.map((p: any, i: number) => ({
        id: `bulk-${timestamp}-${i}`,
        title: p.title,
        content: p.content,
        date: new Date(p.date),
        platform: platform,
        status: 'Draft',
        programId: programId,
        programName: programName
      }));
      onPostsGenerated(formattedPosts);
      alert(`تم بنجاح توليد ${formattedPosts.length} منشور وتوزيعهم على الجدول الزمني.`);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء التوليد، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">

        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
          <Zap size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مولد البرامج الهيكلية</h2>
          <p className="text-gray-500 text-sm">أنشئ خطة محتوى زمنية (1-180 منشور) لتوزيعها على الجدول</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">اسم البرنامج / الحملة</label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="مثال: حملة الصيف، تسويق منتجات..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">المنصة</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {Object.values(Platform).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">عدد المنشورات ({count})</label>
          <input
            type="range"
            min="1"
            max="180"
            step="1"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-4"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">تاريخ البدء</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">تاريخ الانتهاء</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-end flex-col justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all ${loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
          >
            {loading ? 'جاري المعالجة...' : 'توليد الجدول الزمني'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkGenerator;
