
import React from 'react';
import { Calendar, FileText, BarChart2, Image, Palette, TrendingUp } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'calendar', label: 'التقويم', labelFull: 'التقويم الشهري', icon: <Calendar size={20} /> },
    { id: 'posts', label: 'المنشورات', labelFull: 'المنشورات', icon: <FileText size={20} /> },
    { id: 'gantt', label: 'غانت', labelFull: 'مخطط غانت', icon: <BarChart2 size={20} /> },
    { id: 'media', label: 'الوسائط', labelFull: 'مكتبة الوسائط', icon: <Image size={20} /> },
    { id: 'studios', label: 'التصميم', labelFull: 'استديوهات التصميم', icon: <Palette size={20} /> },
    { id: 'investor', label: 'المستثمر', labelFull: 'منصة المستثمر', icon: <TrendingUp size={20} /> },
  ];

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:flex w-64 bg-white h-screen border-l border-gray-200 flex-col fixed right-0 top-0 z-30">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <span>SocialFlow</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">AI</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span>{item.labelFull}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="bg-indigo-600 rounded-xl p-4 text-white">
            <p className="text-xs opacity-80 mb-2">خطة عام 2024</p>
            <div className="h-2 bg-indigo-400 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/3"></div>
            </div>
            <p className="text-xs mt-2 font-medium">تم إنجاز 32% من الخطة</p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - visible only on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <nav className="flex justify-around items-stretch">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 flex-1 transition-all active:scale-95 relative ${activeTab === item.id
                  ? 'text-indigo-600'
                  : 'text-gray-400'
                }`}
            >
              {activeTab === item.id && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />
              )}
              <div className={`mb-0.5 transition-transform ${activeTab === item.id ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
