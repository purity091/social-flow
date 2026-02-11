import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { StudioLink } from '../services/api';
import { Link, Palette } from 'lucide-react';

const DesignStudios: React.FC = () => {
    const [studios, setStudios] = useState<StudioLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'ready' | 'under_development'>('all');
    const [newStudio, setNewStudio] = useState({ 
        name: '', 
        url: '', 
        imageUrl: '', 
        imageSize: '', 
        usageTips: '',
        status: 'ready' as 'ready' | 'under_development'
    });

    // View & Edit states
    const [viewingStudio, setViewingStudio] = useState<StudioLink | null>(null);
    const [editingStudio, setEditingStudio] = useState<StudioLink | null>(null);
    const [editForm, setEditForm] = useState({ 
        name: '', 
        url: '', 
        imageUrl: '', 
        imageSize: '', 
        usageTips: '',
        status: 'ready' as 'ready' | 'under_development'
    });

    // Load studios from database
    useEffect(() => {
        const fetchStudios = async () => {
            try {
                const data = await api.getStudios();
                setStudios(data);
            } catch (error) {
                console.error('Failed to load studios:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudios();
    }, []);

    const handleAddStudio = async () => {
        if (!newStudio.name || !newStudio.url) return;

        setSaving(true);
        try {
            const saved = await api.createStudio({
                name: newStudio.name,
                url: newStudio.url,
                imageUrl: newStudio.imageUrl || '',
                imageSize: newStudio.imageSize || '',
                usageTips: newStudio.usageTips || '',
                status: newStudio.status
            });

            setStudios(prev => [saved, ...prev]);
            setNewStudio({ name: '', url: '', imageUrl: '', imageSize: '', usageTips: '', status: 'ready' });
            setShowAddModal(false);
        } catch (error) {
            console.error('Failed to save studio:', error);
            alert('فشل حفظ الرابط');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStudio = async (id: string) => {
        if (!window.confirm('حذف هذا الرابط؟')) return;

        try {
            await api.deleteStudio(id);
            setStudios(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Failed to delete studio:', error);
            alert('فشل الحذف');
        }
    };

    // Open edit modal
    const handleEditClick = (studio: StudioLink) => {
        setEditingStudio(studio);
        setEditForm({
            name: studio.name,
            url: studio.url,
            imageUrl: studio.imageUrl || '',
            imageSize: studio.imageSize || '',
            usageTips: studio.usageTips || '',
            status: studio.status
        });
    };

    // Save edited studio
    const handleSaveEdit = async () => {
        if (!editingStudio || !editForm.name || !editForm.url) return;

        setSaving(true);
        try {
            const updated: StudioLink = {
                ...editingStudio,
                name: editForm.name,
                url: editForm.url,
                imageUrl: editForm.imageUrl,
                imageSize: editForm.imageSize,
                usageTips: editForm.usageTips,
                status: editForm.status
            };
            await api.updateStudio(updated);
            setStudios(prev => prev.map(s => s.id === updated.id ? updated : s));
            setEditingStudio(null);
        } catch (error) {
            console.error('Failed to update studio:', error);
            alert('فشل تحديث الاستديو');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex items-center justify-center">
                <div className="text-gray-400 flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-2"></div>
                    جاري التحميل...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-l from-pink-50 to-purple-50">
                <div>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
                        <Link size={22} />
                        <span>روابط استديوهات التصميم</span>
                    </h2>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">احفظ روابط مواقع التصميم المفضلة لديك</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full sm:w-auto px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                    <span>+</span> إضافة رابط
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50">
                <button
                    className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
                        activeTab === 'all'
                            ? 'text-purple-700 border-b-2 border-purple-600 bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('all')}
                >
                    الكل
                </button>
                <button
                    className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
                        activeTab === 'ready'
                            ? 'text-green-700 border-b-2 border-green-600 bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('ready')}
                >
                    جاهز للاستخدام
                </button>
                <button
                    className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
                        activeTab === 'under_development'
                            ? 'text-amber-700 border-b-2 border-amber-600 bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('under_development')}
                >
                    تحت التطوير
                </button>
            </div>

            {/* Table */}
            <div className="p-3 md:p-6">
                {studios.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="text-right py-4 px-4 text-sm font-bold text-gray-600 w-24">الصورة</th>
                                    <th className="text-right py-4 px-4 text-sm font-bold text-gray-600">اسم الاستديو</th>
                                    <th className="text-right py-4 px-4 text-sm font-bold text-gray-600">الرابط</th>
                                    <th className="text-right py-4 px-4 text-sm font-bold text-gray-600 w-32">الحالة</th>
                                    <th className="text-right py-4 px-4 text-sm font-bold text-gray-600 w-32">حجم الصورة</th>
                                    <th className="text-right py-4 px-4 text-sm font-bold text-gray-600" style={{ minWidth: '250px' }}>نصائح الاستخدام</th>
                                    <th className="text-center py-4 px-4 text-sm font-bold text-gray-600 w-28">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studios
                                    .filter(studio => 
                                        activeTab === 'all' || 
                                        (activeTab === 'ready' && studio.status === 'ready') || 
                                        (activeTab === 'under_development' && studio.status === 'under_development')
                                    )
                                    .map((studio) => (
                                        <tr
                                            key={studio.id}
                                            className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors"
                                        >
                                            {/* Image Column */}
                                            <td className="py-4 px-4">
                                                {studio.imageUrl ? (
                                                    <div
                                                        className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all shadow-sm"
                                                        onClick={() => setSelectedImage(studio.imageUrl)}
                                                    >
                                                        <img
                                                            src={studio.imageUrl}
                                                            alt={studio.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
                                                        <Palette size={24} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </td>

                                            {/* Name Column */}
                                            <td className="py-4 px-4">
                                                <span className="font-bold text-gray-800 text-lg">{studio.name}</span>
                                            </td>

                                            {/* URL Column */}
                                            <td className="py-4 px-4">
                                                <a
                                                    href={studio.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-2"
                                                >
                                                    <span className="max-w-[300px] truncate">{studio.url}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                </a>
                                            </td>

                                            {/* Status Column */}
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                                    studio.status === 'ready' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {studio.status === 'ready' ? (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <path d="m5 12 5 5 10-10" />
                                                            </svg>
                                                            جاهز
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M12 2v20" />
                                                                <path d="M2 12h20" />
                                                            </svg>
                                                            تحت التطوير
                                                        </>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Image Size Column */}
                                            <td className="py-4 px-4">
                                                {studio.imageSize ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                            <line x1="3" y1="9" x2="21" y2="9" />
                                                            <line x1="9" y1="21" x2="9" y2="9" />
                                                        </svg>
                                                        {studio.imageSize}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </td>

                                            {/* Usage Tips Column */}
                                            <td className="py-4 px-4">
                                                {studio.usageTips ? (
                                                    <div className="max-w-md">
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-3" title={studio.usageTips}>
                                                            {studio.usageTips}
                                                        </p>
                                                        {studio.usageTips.length > 150 && (
                                                            <button
                                                                onClick={() => alert(studio.usageTips)}
                                                                className="text-purple-600 text-xs mt-1 hover:underline"
                                                            >
                                                                عرض المزيد...
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">لا توجد نصائح</span>
                                                )}
                                            </td>

                                            {/* Actions Column */}
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* View Button */}
                                                    <button
                                                        onClick={() => setViewingStudio(studio)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                    </button>
                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => handleEditClick(studio)}
                                                        className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    </button>
                                                    {/* Open Link Button */}
                                                    <a
                                                        href={studio.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                                        title="فتح الرابط"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                    </a>
                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleDeleteStudio(studio.id)}
                                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="حذف"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-400">
                        <div className="flex justify-center mb-4"><Link size={64} /></div>
                        <p className="text-lg mb-2">لا توجد روابط بعد</p>
                        <p className="text-sm">اضغط على "إضافة رابط" لحفظ استديوهات التصميم المفضلة</p>
                    </div>
                )}
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            className="absolute -top-12 left-0 text-white/70 hover:text-white text-sm flex items-center gap-2"
                            onClick={() => setSelectedImage(null)}
                        >
                            ✕ إغلاق
                        </button>
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Add Link Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Link size={24} /> <span>إضافة رابط جديد</span>
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الاستديو *</label>
                                <input
                                    type="text"
                                    value={newStudio.name}
                                    onChange={(e) => setNewStudio({ ...newStudio, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                    placeholder="مثال: Canva، Figma، Adobe..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">رابط الموقع *</label>
                                <input
                                    type="url"
                                    value={newStudio.url}
                                    onChange={(e) => setNewStudio({ ...newStudio, url: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                    placeholder="https://www.example.com"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">حالة الاستديو</label>
                                <select
                                    value={newStudio.status}
                                    onChange={(e) => setNewStudio({ ...newStudio, status: e.target.value as 'ready' | 'under_development' })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                >
                                    <option value="ready">جاهز للاستخدام</option>
                                    <option value="under_development">تحت التطوير</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">رابط صورة (اختياري)</label>
                                <input
                                    type="url"
                                    value={newStudio.imageUrl}
                                    onChange={(e) => setNewStudio({ ...newStudio, imageUrl: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                    placeholder="https://example.com/logo.png"
                                    dir="ltr"
                                />
                                <p className="text-xs text-gray-400 mt-1">يمكنك إضافة رابط لشعار أو صورة نموذجية</p>
                            </div>

                            {/* Image Size Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">تصنيف حجم الصورة</label>
                                <input
                                    type="text"
                                    value={newStudio.imageSize}
                                    onChange={(e) => setNewStudio({ ...newStudio, imageSize: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                    placeholder="مثال: 1080x1080، 1200x628، Story 9:16"
                                />
                                <p className="text-xs text-gray-400 mt-1">أبعاد التصميمات المتاحة في هذا الاستديو</p>
                            </div>

                            {/* Usage Tips Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">نصائح الاستخدام</label>
                                <textarea
                                    value={newStudio.usageTips}
                                    onChange={(e) => setNewStudio({ ...newStudio, usageTips: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none"
                                    placeholder="أضف نصائح مفصلة حول كيفية استخدام هذا الاستديو، مثل:\n- أفضل الاستخدامات\n- خطوات التصميم\n- ملاحظات مهمة..."
                                ></textarea>
                                <p className="text-xs text-gray-400 mt-1">شرح تفصيلي لطريقة الاستخدام والنصائح المهمة</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowAddModal(false); setNewStudio({ name: '', url: '', imageUrl: '', imageSize: '', usageTips: '', status: 'ready' }); }}
                                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAddStudio}
                                disabled={!newStudio.name || !newStudio.url || saving}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    'حفظ الرابط'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Studio Modal */}
            {viewingStudio && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-l from-blue-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                    <Palette size={24} />
                                    تفاصيل الاستديو
                                </h3>
                                <button
                                    onClick={() => setViewingStudio(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {/* Studio Image & Name */}
                            <div className="flex items-start gap-5 mb-6">
                                {viewingStudio.imageUrl ? (
                                    <div
                                        className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shadow-md cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all flex-shrink-0"
                                        onClick={() => setSelectedImage(viewingStudio.imageUrl)}
                                    >
                                        <img src={viewingStudio.imageUrl} alt={viewingStudio.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-400 flex-shrink-0 shadow-md">
                                        <Palette size={40} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-gray-800 mb-2">{viewingStudio.name}</h4>
                                    <a
                                        href={viewingStudio.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-2 text-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                        {viewingStudio.url}
                                    </a>
                                </div>
                            </div>

                            {/* Image Size */}
                            {viewingStudio.imageSize && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <line x1="3" y1="9" x2="21" y2="9" />
                                            <line x1="9" y1="21" x2="9" y2="9" />
                                        </svg>
                                        <h5 className="font-bold text-blue-800">حجم الصورة / الأبعاد</h5>
                                    </div>
                                    <p className="text-blue-700 text-lg font-medium">{viewingStudio.imageSize}</p>
                                </div>
                            )}

                            {/* Usage Tips */}
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                    <h5 className="font-bold text-purple-800">نصائح الاستخدام</h5>
                                </div>
                                {viewingStudio.usageTips ? (
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingStudio.usageTips}</p>
                                ) : (
                                    <p className="text-gray-400 italic">لا توجد نصائح مضافة لهذا الاستديو</p>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setViewingStudio(null)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                إغلاق
                            </button>
                            <button
                                onClick={() => { handleEditClick(viewingStudio); setViewingStudio(null); }}
                                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                تعديل
                            </button>
                            <a
                                href={viewingStudio.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                فتح الاستديو
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Studio Modal */}
            {editingStudio && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-l from-amber-50 to-orange-50">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                تعديل الاستديو
                            </h3>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الاستديو *</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                                    placeholder="مثال: Canva، Figma، Adobe..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">رابط الموقع *</label>
                                <input
                                    type="url"
                                    value={editForm.url}
                                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                                    placeholder="https://www.example.com"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">حالة الاستديو</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'ready' | 'under_development' })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                                >
                                    <option value="ready">جاهز للاستخدام</option>
                                    <option value="under_development">تحت التطوير</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">رابط صورة (اختياري)</label>
                                <input
                                    type="url"
                                    value={editForm.imageUrl}
                                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                                    placeholder="https://example.com/logo.png"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">تصنيف حجم الصورة</label>
                                <input
                                    type="text"
                                    value={editForm.imageSize}
                                    onChange={(e) => setEditForm({ ...editForm, imageSize: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                                    placeholder="مثال: 1080x1080، 1200x628، Story 9:16"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">نصائح الاستخدام</label>
                                <textarea
                                    value={editForm.usageTips}
                                    onChange={(e) => setEditForm({ ...editForm, usageTips: e.target.value })}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none resize-none"
                                    placeholder="أضف نصائح مفصلة حول كيفية استخدام هذا الاستديو..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setEditingStudio(null)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={!editForm.name || !editForm.url || saving}
                                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                                        حفظ التعديلات
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignStudios;
