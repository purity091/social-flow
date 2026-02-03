
import React, { useState, useMemo } from 'react';
import { Campaign, GanttViewMode } from '../types';

interface GanttChartProps {
  campaigns: Campaign[];
}

const monthsAR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const GanttChart: React.FC<GanttChartProps> = ({ campaigns }) => {
  const [viewMode, setViewMode] = useState<GanttViewMode>('month');
  const [baseDate, setBaseDate] = useState(new Date());

  // حساب النطاق الزمني للعرض الحالي
  const viewRange = useMemo(() => {
    const start = new Date(baseDate.getFullYear(), viewMode === 'year' ? 0 : baseDate.getMonth(), 1);
    let end: Date;
    
    if (viewMode === 'year') {
      end = new Date(baseDate.getFullYear(), 11, 31, 23, 59, 59);
    } else if (viewMode === 'month') {
      end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59);
    } else {
      // Day view - show 7 days starting from baseDate
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 7);
    }
    return { start, end };
  }, [baseDate, viewMode]);

  const navigate = (direction: number) => {
    const next = new Date(baseDate);
    if (viewMode === 'year') next.setFullYear(baseDate.getFullYear() + direction);
    else if (viewMode === 'month') next.setMonth(baseDate.getMonth() + direction);
    else next.setDate(baseDate.getDate() + direction * 7);
    setBaseDate(next);
  };

  const calculateStyle = (campStart: Date, campEnd: Date) => {
    const viewStart = viewRange.start.getTime();
    const viewEnd = viewRange.end.getTime();
    const totalDuration = viewEnd - viewStart;

    const start = Math.max(campStart.getTime(), viewStart);
    const end = Math.min(campEnd.getTime(), viewEnd);

    if (start > viewEnd || end < viewStart) return null;

    const left = ((start - viewStart) / totalDuration) * 100;
    const width = ((end - start) / totalDuration) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const renderTimelineHeader = () => {
    if (viewMode === 'year') {
      return monthsAR.map((m, i) => (
        <div key={i} className="flex-1 text-center py-4 text-[10px] font-bold text-gray-400 border-l border-gray-50 last:border-l-0">
          {m}
        </div>
      ));
    }
    if (viewMode === 'month') {
      const days = viewRange.end.getDate();
      return Array.from({ length: days }, (_, i) => (
        <div key={i} className="flex-1 min-w-[30px] text-center py-4 text-[9px] font-medium text-gray-400 border-l border-gray-50">
          {i + 1}
        </div>
      ));
    }
    // Week view (Day mode)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(viewRange.start);
      d.setDate(d.getDate() + i);
      return (
        <div key={i} className="flex-1 text-center py-4 text-[10px] font-bold text-gray-400 border-l border-gray-50">
          {d.toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric' })}
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">مخطط غانت الزمني</h2>
          <p className="text-sm text-gray-500 mt-1">
            {viewMode === 'year' && `عام ${baseDate.getFullYear()}`}
            {viewMode === 'month' && `${monthsAR[baseDate.getMonth()]} ${baseDate.getFullYear()}`}
            {viewMode === 'day' && `أسبوع من ${viewRange.start.toLocaleDateString('ar-SA')}`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button onClick={() => navigate(-1)} className="px-3 py-1 hover:bg-gray-50 text-indigo-600 font-bold border-l">→</button>
            <button onClick={() => navigate(1)} className="px-3 py-1 hover:bg-gray-50 text-indigo-600 font-bold">←</button>
          </div>
          
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            {(['day', 'month', 'year'] as GanttViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === mode 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {mode === 'day' ? 'أسبوع' : mode === 'month' ? 'شهر' : 'سنة'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="flex border-b border-gray-100 bg-gray-50/30">
            <div className="w-56 p-4 font-bold text-gray-600 border-l border-gray-100 shrink-0">النشاط / الحملة</div>
            <div className="flex-1 flex">{renderTimelineHeader()}</div>
          </div>

          <div className="relative gantt-grid min-h-[400px]">
            {campaigns.map((campaign) => {
              const style = calculateStyle(campaign.startDate, campaign.endDate);
              if (!style) return null;

              return (
                <div key={campaign.id} className="flex border-b border-gray-50 group hover:bg-gray-50/50 transition-colors">
                  <div className="w-56 p-4 border-l border-gray-100 shrink-0 bg-white z-10">
                    <span className="font-semibold text-gray-700 block text-sm truncate">{campaign.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 truncate">{campaign.description}</span>
                  </div>
                  <div className="flex-1 relative h-16 flex items-center">
                    <div 
                      className="absolute h-8 rounded-lg shadow-sm flex items-center px-3 text-white text-[10px] font-bold transition-all hover:brightness-110 overflow-hidden whitespace-nowrap z-0"
                      style={{ 
                        ...style,
                        backgroundColor: campaign.color || '#4f46e5'
                      }}
                      title={`${campaign.name}: ${campaign.startDate.toLocaleDateString('ar-SA')} - ${campaign.endDate.toLocaleDateString('ar-SA')}`}
                    >
                      <span className="truncate">{campaign.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Current Day Indicator */}
            {viewMode !== 'year' && (
              <div 
                className="absolute top-0 bottom-0 w-px bg-red-400 z-20 pointer-events-none"
                style={{ 
                  left: `${((new Date().getTime() - viewRange.start.getTime()) / (viewRange.end.getTime() - viewRange.start.getTime())) * 100}%`,
                  display: new Date() >= viewRange.start && new Date() <= viewRange.end ? 'block' : 'none'
                }}
              >
                <div className="bg-red-400 text-white text-[8px] px-1 rounded-sm absolute -top-1 -translate-x-1/2">الآن</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
