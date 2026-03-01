import React, { useState, useMemo } from 'react';
import { Post } from '../types';
import { Trash2, CalendarCheck, CheckSquare, Square, Filter } from 'lucide-react';
import * as api from '../services/api';

interface BulkControlTabProps {
    posts: Post[];
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const BulkControlTab: React.FC<BulkControlTabProps> = ({ posts, setPosts }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isProcessing, setIsProcessing] = useState(false);

    const filteredPosts = useMemo(() => {
        if (statusFilter === 'all') return posts;
        return posts.filter(post => post.status === statusFilter);
    }, [posts, statusFilter]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredPosts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredPosts.map(p => p.id)));
        }
    };

    const selectedCount = selectedIds.size;

    const handleBulkDelete = async () => {
        if (selectedCount === 0) return;
        if (!window.confirm(`هل أنت متأكد من حذف ${selectedCount} منشور؟`)) return;

        setIsProcessing(true);
        try {
            const idsToDelete = Array.from(selectedIds) as string[];
            let deletedIds: string[] = [];

            for (const id of idsToDelete) {
                try {
                    await api.deletePost(id);
                    deletedIds.push(id);
                } catch (err) {
                    console.error(`Failed to delete post ${id}:`, err instanceof Error ? err.message : String(err));
                }
            }

            setPosts(prev => prev.filter(p => !deletedIds.includes(p.id)));
            setSelectedIds(new Set());
            alert(`تم حذف ${deletedIds.length} منشور بنجاح.`);
        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء الحذف.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkStatusChange = async (newStatus: 'Draft' | 'Scheduled' | 'Published') => {
        if (selectedCount === 0) return;
        if (!window.confirm(`هل أنت متأكد من تغيير حالة ${selectedCount} منشور إلى "${newStatus}"؟`)) return;

        setIsProcessing(true);
        try {
            const idsToUpdate = Array.from(selectedIds) as string[];
            const updatedPostsList: Post[] = [];

            for (const id of idsToUpdate) {
                const post = posts.find(p => p.id === id);
                if (post) {
                    try {
                        const updatedPost = { ...post, status: newStatus };
                        await api.updatePost(updatedPost);
                        updatedPostsList.push(updatedPost);
                    } catch (err) {
                        console.error(`Failed to update post ${id}:`, err instanceof Error ? err.message : String(err));
                    }
                }
            }

            setPosts(prev => prev.map(p => {
                const updated = updatedPostsList.find(up => up.id === p.id);
                return updated ? updated : p;
            }));
            setSelectedIds(new Set());
            alert(`تم تغيير حالة ${updatedPostsList.length} منشور بنجاح.`);
        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء تغيير الحالة.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CheckSquare className="text-indigo-600" />
                        التحكم الجماعي بالمنشورات
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">قم بتحديد المنشورات لتغيير حالتها أو حذفها دفعة واحدة</p>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setSelectedIds(new Set());
                        }}
                        className="bg-transparent text-sm font-medium text-gray-700 outline-none"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="Draft">مسودة</option>
                        <option value="Scheduled">مجدول</option>
                        <option value="Published">منشور</option>
                    </select>
                </div>
            </div>

            {/* Control Panel */}
            <div className={`flex flex-col md:flex-row items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6 transition-opacity ${selectedCount > 0 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="font-medium text-indigo-700 mb-3 md:mb-0">
                    تم تحديد: <span className="font-bold text-lg bg-indigo-100 px-2 py-0.5 rounded-lg">{selectedCount}</span> منشور
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleBulkStatusChange('Scheduled')}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        <CalendarCheck size={18} />
                        <span>تحويل إلى مجدول</span>
                    </button>
                    <button
                        onClick={() => handleBulkStatusChange('Draft')}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <Square size={18} />
                        <span>تحويل إلى مسودة</span>
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        <Trash2 size={18} />
                        <span>حذف المحدد</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 w-12 text-center">
                                <button
                                    onClick={toggleAll}
                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {selectedIds.size > 0 && selectedIds.size === filteredPosts.length ?
                                        <CheckSquare size={20} className="text-indigo-600" /> :
                                        <Square size={20} />
                                    }
                                </button>
                            </th>
                            <th className="p-4 font-semibold text-gray-700">المحتوى</th>
                            <th className="p-4 font-semibold text-gray-700">المنصة</th>
                            <th className="p-4 font-semibold text-gray-700">التاريخ</th>
                            <th className="p-4 font-semibold text-gray-700">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    لا توجد منشورات لعرضها
                                </td>
                            </tr>
                        ) : (
                            filteredPosts.map(post => {
                                const isSelected = selectedIds.has(post.id);
                                return (
                                    <tr
                                        key={post.id}
                                        className={`border-b border-gray-100 transition-colors cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-indigo-50/30' : ''}`}
                                        onClick={() => toggleSelection(post.id)}
                                    >
                                        <td className="p-4 text-center">
                                            <div className="text-gray-400">
                                                {isSelected ?
                                                    <CheckSquare size={20} className="text-indigo-600" /> :
                                                    <Square size={20} />
                                                }
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900 truncate max-w-[200px] md:max-w-md">{post.title || 'بدون عنوان'}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-[200px] md:max-w-md">{post.content || ''}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                                {post.platform}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dir-ltr text-right">
                                            {new Date(post.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${post.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-700' :
                                                post.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {post.status === 'Draft' ? 'مسودة' : post.status === 'Scheduled' ? 'مجدول' : post.status === 'Published' ? 'منشور' : post.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BulkControlTab;
