
import React, { useState } from 'react';
import { Post, Platform } from '../types';
import { getPlatformConfig } from '../constants';

interface CalendarViewProps {
  posts: Post[];
  onAddPost: (date: Date) => void;
  onEditPost: (post: Post) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ posts, onAddPost, onEditPost }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Intl.DateTimeFormat('ar-SA', { month: 'long' }).format(currentDate);

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[140px] bg-gray-50/50 border-b border-l border-gray-100"></div>);
  }

  // Days with content
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const dayPosts = posts.filter(p => p.date.toDateString() === date.toDateString());
    const isToday = date.toDateString() === new Date().toDateString();

    days.push(
      <div
        key={d}
        onClick={(e) => {
          // Only trigger add if clicking the cell background
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.add-btn')) {
            onAddPost(date);
          }
        }}
        className={`min-h-[140px] p-2 border-b border-l border-gray-100 bg-white transition-all relative group hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]
            ${isToday ? 'bg-indigo-50/30' : ''}`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors
            ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 group-hover:text-gray-900 group-hover:bg-gray-100'}`}>
            {d}
          </span>
          <button className="add-btn opacity-0 group-hover:opacity-100 text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar pr-0.5">
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

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-900/5">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 leading-none">{monthName}</h2>
            <span className="text-sm text-gray-400 font-medium mt-1">{year}</span>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-md transition-colors">اليوم</button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {Object.values(Platform).map(p => (
            <div key={p} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
              <div className={`w-2 h-2 rounded-full ${getPlatformConfig(p).color} ring-2 ring-white`}></div>
              <span className="text-[10px] font-semibold text-gray-600">{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 border-r border-gray-100 bg-gray-50/30">
        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
          <div key={day} className="py-4 text-center text-xs font-extrabold text-gray-400 border-b border-l border-gray-100 uppercase tracking-wider">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
};

export default CalendarView;
