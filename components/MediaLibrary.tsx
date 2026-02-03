
import React, { useRef } from 'react';
import { MediaItem } from '../types';

interface MediaLibraryProps {
    mediaItems: MediaItem[];
    onUpload: (files: FileList) => void;
    onDelete: (id: string) => void;
    onSelect?: (item: MediaItem) => void;
    isSelectMode?: boolean;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ mediaItems, onUpload, onDelete, onSelect, isSelectMode = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span>🖼️</span>
                        <span>مكتبة الوسائط</span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">إدارة جميع الصور والملفات الخاصة بحملاتك</p>
                </div>
                <div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        <span>رفع صور جديدة</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                        accept="image/*"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {mediaItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                        <div className="text-4xl mb-4 opacity-50">📂</div>
                        <p>المكتبة فارغة، قم برفع بعض الصور للبدء</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {mediaItems.map(item => (
                            <div
                                key={item.id}
                                className={`group relative aspect-square bg-white rounded-xl overflow-hidden border transition-all cursor-pointer ${isSelectMode ? 'hover:ring-4 hover:ring-indigo-400 hover:scale-95' : 'hover:shadow-lg'
                                    }`}
                                onClick={() => isSelectMode && onSelect?.(item)}
                            >
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />

                                {/* Overlay with details */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                                    <p className="text-xs font-medium truncate mb-1">{item.name}</p>
                                    <p className="text-[10px] opacity-70 mb-2">{item.date.toLocaleDateString()}</p>

                                    {!isSelectMode && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                                                title="حذف"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }}
                                                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors"
                                                title="عراض كامل"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibrary;
