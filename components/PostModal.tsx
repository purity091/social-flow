
import React, { useState, useEffect } from 'react';
import { Post, Platform } from '../types';
import { getPlatformConfig } from '../constants';
import { FileImage } from 'lucide-react';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
  post?: Post | null;
  initialDate?: Date;
  // kept for API compatibility — no longer used internally
  mediaItems?: any[];
  mediaFolders?: any[];
  onUploadMedia?: (...args: any[]) => any;
  onCreateFolder?: (...args: any[]) => any;
  onDeleteFolder?: (...args: any[]) => any;
  onRenameFolder?: (...args: any[]) => any;
  onMoveItem?: (...args: any[]) => any;
}

const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  post,
  initialDate,
}) => {
  const [formData, setFormData] = useState<Partial<Post>>({
    title: '',
    content: '',
    platform: Platform.INSTAGRAM,
    status: 'Draft',
    date: new Date(),
    imageUrl: ''
  });

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-none md:rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-full md:max-h-[90vh]">
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
            {/* Left column */}
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
                      <div className="scale-75">{getPlatformConfig(p).icon('w-6 h-6')}</div>
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

            {/* Right column */}
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

              {/* Image name — text only, no URL/preview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileImage size={16} className="text-gray-400" />
                  اسم ملف الصورة
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="مثال: post-cover.jpg"
                  value={formData.imageUrl || ''}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  أدخل اسم الملف فقط كمرجع — لن يتم عرض الصورة في المنصة
                </p>
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
    </div>
  );
};

export default PostModal;
