
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'calendar', label: 'التقويم الشهري', icon: '📅' },
    { id: 'posts', label: 'المنشورات', icon: '📝' },
    { id: 'gantt', label: 'مخطط غانت', icon: '📊' },
    { id: 'media', label: 'مكتبة الوسائط', icon: '🖼️' },
    { id: 'studios', label: 'استديوهات التصميم', icon: '🎨' },
  ];

  return (
    <div className="w-64 bg-white h-screen border-l border-gray-200 flex flex-col fixed right-0 top-0">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <span>SocialFlow</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">AI</span>
        </h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
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
  );
};

export default Sidebar;
