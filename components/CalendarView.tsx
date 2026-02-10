
import React, { useState } from 'react';
import { Post, Platform } from '../types';
import { getPlatformConfig } from '../constants';
import { Plus, ChevronLeft, ChevronRight, Calendar, Edit3, Clock, FileText } from 'lucide-react';

interface CalendarViewProps {
  posts: Post[];
  onAddPost: (date: Date) => void;
  onEditPost: (post: Post) => void;
}

const dayNamesAR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const CalendarView: React.FC<CalendarViewProps> = ({ posts, onAddPost, onEditPost }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Intl.DateTimeFormat('ar-SA', { month: 'long' }).format(currentDate);

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Build all days data for mobile view
  const allDaysData = [];
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const dayPosts = posts.filter(p => p.date.toDateString() === date.toDateString());
    const isToday = date.toDateString() === new Date().toDateString();
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    allDaysData.push({ day: d, date, dayPosts, isToday, isPast, dayName: dayNamesAR[date.getDay()] });
  }

  // ─── Desktop Grid View ─────────────────────────────────────────
  const renderDesktopGrid = () => {
    const gridDays = [];

    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
      gridDays.push(<div key={`empty-${i}`} className="min-h-[120px] bg-gray-50/50 border-b border-l border-gray-100"></div>);
    }

    // Days with content
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const dayPosts = posts.filter(p => p.date.toDateString() === date.toDateString());
      const isToday = date.toDateString() === new Date().toDateString();

      gridDays.push(
        <div
          key={d}
          onClick={(e) => {
            if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.add-btn')) {
              onAddPost(date);
            }
          }}
          className={`min-h-[120px] p-2 border-b border-l border-gray-100 bg-white transition-all relative group hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] flex flex-col
              ${isToday ? 'bg-indigo-50/30' : ''}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors
              ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 group-hover:text-gray-900 group-hover:bg-gray-100'}`}>
              {d}
            </span>
            <button className="add-btn opacity-0 group-hover:opacity-100 text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-all">
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>

          <div className="space-y-1.5 flex-1 pr-0.5">
            {dayPosts.map(post => (
              <div
                key={post.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPost(post);
                }}
                className={`
                  text-[11px] px-2 py-1.5 rounded-lg truncate flex items-center gap-2 cursor-pointer
                  shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 border border-transparent hover:border-white/20
                  ${getPlatformConfig(post.platform).color} text-white
                  ${post.status === 'Draft' ? 'opacity-80 border-dashed border-white/50 bg-opacity-70' : ''}
                `}
              >
                <div className="shrink-0">{getPlatformConfig(post.platform).icon('w-3.5 h-3.5')}</div>
                <span className="truncate font-medium">{post.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border-r border-gray-100 bg-gray-50/30">
        {dayNamesAR.map(day => (
          <div key={day} className="py-4 text-center text-xs font-extrabold text-gray-400 border-b border-l border-gray-100 uppercase tracking-wider">
            {day}
          </div>
        ))}
        {gridDays}
      </div>
    );
  };

  // ─── Mobile Vertical List View ─────────────────────────────────
  const renderMobileList = () => {
    // Filter to show: today, days with posts, and future days (limit past empty days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="divide-y divide-gray-100">
        {allDaysData.map(({ day, date, dayPosts, isToday, isPast, dayName }) => {
          const hasContent = dayPosts.length > 0;
          const isFriday = date.getDay() === 5;
          const isSaturday = date.getDay() === 6;
          const isWeekend = isFriday || isSaturday;

          return (
            <div
              key={day}
              className={`transition-all ${isToday
                  ? 'bg-indigo-50/60'
                  : isPast && !hasContent
                    ? 'bg-gray-50/40'
                    : 'bg-white'
                }`}
            >
              {/* Day Header Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Day Number Circle */}
                <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all ${isToday
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : isWeekend
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                  <span className="text-base font-bold leading-none">{day}</span>
                  <span className={`text-[8px] font-semibold leading-none mt-0.5 ${isToday ? 'text-indigo-200' : isWeekend ? 'text-emerald-500' : 'text-gray-400'
                    }`}>{dayName.slice(0, 3)}</span>
                </div>

                {/* Day Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isToday ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {dayName}
                    </span>
                    {isToday && (
                      <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                        اليوم
                      </span>
                    )}
                    {hasContent && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isToday ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {dayPosts.length} {dayPosts.length === 1 ? 'منشور' : 'منشورات'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Add Post Button */}
                <button
                  onClick={() => onAddPost(date)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 ${isToday
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Posts Cards */}
              {hasContent && (
                <div className="px-4 pb-3 space-y-2">
                  {dayPosts.map(post => {
                    const config = getPlatformConfig(post.platform);
                    return (
                      <div
                        key={post.id}
                        onClick={() => onEditPost(post)}
                        className={`rounded-xl overflow-hidden active:scale-[0.98] transition-all cursor-pointer border ${post.status === 'Draft'
                            ? 'border-dashed border-gray-300 bg-gray-50'
                            : 'border-gray-100 bg-white shadow-sm'
                          }`}
                      >
                        <div className="flex items-stretch">
                          {/* Platform Color Bar */}
                          <div className={`w-1.5 ${config.color} shrink-0`} />

                          <div className="flex-1 p-3 min-w-0">
                            {/* Top Row: Platform + Status */}
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-lg ${config.color} text-white flex items-center justify-center`}>
                                  {config.icon('w-3.5 h-3.5')}
                                </div>
                                <span className="text-xs font-bold text-gray-800">{post.platform}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${post.status === 'Published'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : post.status === 'Scheduled'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}>
                                  {post.status === 'Published' ? 'منشور' : post.status === 'Scheduled' ? 'مجدول' : 'مسودة'}
                                </span>
                                <Edit3 size={13} className="text-gray-400" />
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-sm font-bold text-gray-900 leading-snug mb-1 line-clamp-1">
                              {post.title}
                            </h4>

                            {/* Content Preview */}
                            {post.content && (
                              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                                {post.content}
                              </p>
                            )}

                            {/* Footer: Time + Program */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Clock size={10} />
                                <span className="text-[10px] font-medium">
                                  {post.date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {post.programName && (
                                <div className="flex items-center gap-1 text-indigo-400">
                                  <FileText size={10} />
                                  <span className="text-[10px] font-medium truncate max-w-[120px]">{post.programName}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Image Thumbnail if exists */}
                          {post.imageUrl && (
                            <div className="w-16 shrink-0 bg-gray-100 overflow-hidden">
                              <img
                                src={post.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Header (shared) ───────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-900/5">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 md:hidden">
            <Calendar size={20} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 leading-none">{monthName}</h2>
            <span className="text-xs md:text-sm text-gray-400 font-medium mt-0.5 md:mt-1">{year}</span>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button onClick={prevMonth} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
              <ChevronRight size={18} />
            </button>
            <button onClick={goToday} className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-md transition-colors">اليوم</button>
            <button onClick={nextMonth} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* Platform Legend - hidden on mobile to save space */}
        <div className="hidden md:flex flex-wrap gap-4 justify-end">
          {Object.values(Platform).map(p => (
            <div key={p} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
              <div className={`w-2 h-2 rounded-full ${getPlatformConfig(p).color} ring-2 ring-white`}></div>
              <span className="text-[10px] font-semibold text-gray-600">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid | Mobile: Vertical List */}
      <div className="hidden md:block">
        {renderDesktopGrid()}
      </div>
      <div className="md:hidden">
        {renderMobileList()}
      </div>
    </div>
  );
};

export default CalendarView;
