
import React, { useState, useEffect } from 'react';
import { Post, Platform, MediaItem } from '../types';
import { PLATFORM_CONFIG } from '../constants';
import MediaLibrary from './MediaLibrary';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
  post?: Post | null;
  initialDate?: Date;
  mediaItems: MediaItem[];
  onUploadMedia: (files: FileList) => void;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, onSave, post, initialDate, mediaItems, onUploadMedia }) => {
  const [formData, setFormData] = useState<Partial<Post>>({
    title: '',
    content: '',
    platform: Platform.INSTAGRAM,
    status: 'Draft',
    date: new Date(),
    imageUrl: ''
  });

  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData(post);
    } else {
      setFormData({
        title: '',
        content: '',
        platform: Platform.INSTAGRAM,
        status: 'Draft',
        date: initialDate || new Date(),
        imageUrl: '',
        id: crypto.randomUUID()
      });
    }
  }, [post, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Post);
    onClose();
  };

  const handleSelectMedia = (item: MediaItem) => {
    setFormData({ ...formData, imageUrl: item.url });
    setShowMediaLibrary(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {showMediaLibrary ? (
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden h-[80vh]">
          <div className="absolute top-4 left-4 z-10">
            <button onClick={() => setShowMediaLibrary(false)} className="bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-gray-800">
              ✕ إغلاق
            </button>
          </div>
          <MediaLibrary
            mediaItems={mediaItems}
            onUpload={onUploadMedia}
            onDelete={() => { }} // Read-only in selection mode basically, or handle delete if needed
            isSelectMode={true}
            onSelect={handleSelectMedia}
          />
        </div>
      ) : (
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xl font-bold text-gray-800">
              {post ? 'تحرير المنشور' : 'منشور جديد'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">العنوان</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="عنوان جذاب..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">المنصة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(Platform).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, platform: p })}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${formData.platform === p
                            ? `bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500`
                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                          }`}
                      >
                        <div className="scale-75">{PLATFORM_CONFIG[p]?.icon('w-6 h-6')}</div>
                        <span className="text-[10px] mt-1 font-medium">{p}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">التوقيت</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    value={formData.date ? new Date(formData.date.getTime() - (formData.date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                    onChange={e => setFormData({ ...formData, date: new Date(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  >
                    <option value="Draft">مسودة</option>
                    <option value="Scheduled">مجدول</option>
                    <option value="Published">منشور</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">المحتوى</label>
                  <textarea
                    required
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none font-sans"
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="اكتب محتوى المنشور هنا..."
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">الوسائط</label>
                    <button
                      type="button"
                      onClick={() => setShowMediaLibrary(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      اختيار من المكتبة
                    </button>
                  </div>
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative group border-2 border-dashed border-gray-300">
                    {formData.imageUrl ? (
                      <div className="relative w-full h-full">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 cursor-pointer" onClick={() => setShowMediaLibrary(true)}>
                        <span className="text-2xl mb-1">📷</span>
                        <span className="text-xs">اضغط هنا للاختيار</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    className="w-full mt-2 px-2 py-1 bg-white border border-gray-200 rounded text-xs outline-none focus:border-indigo-500"
                    placeholder="أو ضع رابط خارجي هنا..."
                    value={formData.imageUrl || ''}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02]"
              >
                {post ? 'حفظ التغييرات' : 'جدولة المنشور'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostModal;
