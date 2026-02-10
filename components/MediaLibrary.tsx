
import React, { useRef, useState, useCallback } from 'react';
import { MediaItem, MediaFolder } from '../types';
import {
    Upload,
    Image,
    Folder,
    FolderOpen,
    Edit2,
    Trash2,
    Eye,
    Home,
    Check,
    X,
    ArrowUp,
    Plus,
    Grid,
    List
} from 'lucide-react';

interface UploadingFile {
    id: string;
    file: File;
    name: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

type ViewMode = 'grid' | 'list';

interface MediaLibraryProps {
    mediaItems: MediaItem[];
    mediaFolders: MediaFolder[];
    onUpload: (files: File[], folderId?: string | null, onProgress?: (fileId: string, progress: number) => void) => Promise<void>;
    onDelete: (id: string) => void;
    onSelect?: (item: MediaItem) => void;
    isSelectMode?: boolean;
    onCreateFolder: (name: string, parentId?: string | null) => void;
    onDeleteFolder: (id: string) => void;
    onRenameFolder: (folder: MediaFolder) => void;
    onMoveItem: (item: MediaItem, folderId: string | null) => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
    mediaItems,
    mediaFolders,
    onUpload,
    onDelete,
    onSelect,
    isSelectMode = false,
    onCreateFolder,
    onDeleteFolder,
    onRenameFolder,
    onMoveItem
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [movingItem, setMovingItem] = useState<MediaItem | null>(null);
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Upload state
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFilesUpload(Array.from(e.target.files));
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFilesUpload = async (files: File[]) => {
        const newUploads: UploadingFile[] = files.map((file, index) => ({
            id: `upload-${Date.now()}-${index}`,
            file,
            name: file.name,
            progress: 0,
            status: 'pending' as const
        }));

        setUploadingFiles(prev => [...prev, ...newUploads]);

        const onProgress = (fileId: string, progress: number) => {
            setUploadingFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, progress, status: 'uploading' as const } : f
            ));
        };

        try {
            await onUpload(files, currentFolderId, onProgress);
            setUploadingFiles(prev => prev.map(f =>
                newUploads.find(u => u.id === f.id)
                    ? { ...f, progress: 100, status: 'success' as const }
                    : f
            ));
            setTimeout(() => {
                setUploadingFiles(prev => prev.filter(f =>
                    !newUploads.find(u => u.id === f.id)
                ));
            }, 2000);
        } catch (error) {
            setUploadingFiles(prev => prev.map(f =>
                newUploads.find(u => u.id === f.id)
                    ? { ...f, status: 'error' as const, error: 'فشل الرفع' }
                    : f
            ));
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes('Files')) {
            setIsDragOver(true);
        }
    }, []);

    const handleDragLeaveUpload = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setIsDragOver(false);
        }
    }, []);

    const handleDragOverUpload = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDropUpload = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const droppedFiles = e.dataTransfer.files;
        const imageFiles: File[] = [];

        for (let i = 0; i < droppedFiles.length; i++) {
            const file = droppedFiles[i];
            if (file.type.startsWith('image/')) {
                imageFiles.push(file);
            }
        }

        if (imageFiles.length > 0) {
            handleFilesUpload(imageFiles);
        }
    }, [currentFolderId]);

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName.trim(), currentFolderId);
            setNewFolderName('');
            setShowNewFolderModal(false);
        }
    };

    const handleRenameFolder = () => {
        if (editingFolder && newFolderName.trim()) {
            onRenameFolder({ ...editingFolder, name: newFolderName.trim() });
            setEditingFolder(null);
            setNewFolderName('');
        }
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'غير معروف';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const removeUploadingFile = (id: string) => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id));
    };

    // Get folder contents count (recursive)
    const getFolderContents = (folderId: string): { folders: number; files: number } => {
        const childFolders = mediaFolders.filter(f => f.parentId === folderId);
        const childFiles = mediaItems.filter(m => m.folderId === folderId);
        return {
            folders: childFolders.length,
            files: childFiles.length
        };
    };

    // Get current folder's children folders
    const currentFolders = mediaFolders.filter(f => f.parentId === currentFolderId);
    // Get current folder's media items
    const currentItems = mediaItems.filter(m => m.folderId === currentFolderId);
    // Get parent folder for breadcrumb
    const currentFolder = currentFolderId ? mediaFolders.find(f => f.id === currentFolderId) : null;

    const getBreadcrumbPath = (): MediaFolder[] => {
        const path: MediaFolder[] = [];
        let folder = currentFolder;
        while (folder) {
            path.unshift(folder);
            folder = folder.parentId ? mediaFolders.find(f => f.id === folder!.parentId) : undefined;
        }
        return path;
    };

    const breadcrumbs = getBreadcrumbPath();

    // Drag and drop for moving items between folders
    const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
        e.dataTransfer.setData('mediaItemId', item.id);
    };

    const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
        e.preventDefault();
        setDragOverFolderId(folderId);
    };

    const handleDragLeave = () => {
        setDragOverFolderId(null);
    };

    const handleDrop = (e: React.DragEvent, folderId: string | null) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('mediaItemId');
        if (itemId) {
            const item = mediaItems.find(m => m.id === itemId);
            if (item && item.folderId !== folderId) {
                onMoveItem(item, folderId);
            }
        }
        setDragOverFolderId(null);
    };

    // Grid View Icon
    const GridIcon = () => <Grid size={18} />;

    // List View Icon
    const ListIcon = () => <List size={18} />;

    return (
        <div
            className="bg-white rounded-xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] relative"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOverUpload}
            onDragLeave={handleDragLeaveUpload}
            onDrop={handleDropUpload}
        >
            {/* Drag Overlay */}
            {isDragOver && (
                <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-indigo-500 rounded-3xl">
                    <div className="text-center">
                        <div className="mb-4 animate-bounce text-indigo-500">
                            <Upload size={64} />
                        </div>
                        <p className="text-2xl font-bold text-indigo-700">اسحب الملفات هنا للرفع</p>
                        <p className="text-indigo-600 mt-2">يمكنك رفع عدة صور في نفس الوقت</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-3 md:p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <div>
                        <h2 className="text-lg md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Image size={20} className="text-gray-800" />
                            <span>مكتبة الوسائط</span>
                        </h2>
                        <p className="text-gray-500 text-xs md:text-sm mt-1 hidden sm:block">اسحب وأفلت الصور في أي مكان أو استخدم زر الرفع</p>
                    </div>
                    <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 md:p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="عرض شبكة"
                            >
                                <GridIcon />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 md:p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="عرض قائمة"
                            >
                                <ListIcon />
                            </button>
                        </div>
                        <button
                            onClick={() => setShowNewFolderModal(true)}
                            className="flex-1 sm:flex-none px-3 md:px-5 py-2 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">مجلد جديد</span>
                            <span className="sm:hidden">مجلد</span>
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 sm:flex-none px-3 md:px-6 py-2 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base"
                        >
                            <Upload size={18} />
                            <span className="hidden sm:inline">رفع صور جديدة</span>
                            <span className="sm:hidden">رفع</span>
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

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm">
                    <button
                        onClick={() => setCurrentFolderId(null)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${currentFolderId === null ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        onDragOver={(e) => handleDragOver(e, null)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, null)}
                    >
                        <Home size={16} />
                        <span>الرئيسية</span>
                    </button>
                    {breadcrumbs.map((folder, index) => (
                        <React.Fragment key={folder.id}>
                            <span className="text-gray-400">›</span>
                            <button
                                onClick={() => setCurrentFolderId(folder.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${index === breadcrumbs.length - 1 ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                onDragOver={(e) => handleDragOver(e, folder.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, folder.id)}
                            >
                                <Folder size={16} className="text-indigo-500" />
                                <span>{folder.name}</span>
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Upload Progress Panel */}
            {uploadingFiles.length > 0 && (
                <div className="border-b border-gray-100 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <ArrowUp className="animate-bounce text-indigo-500" size={18} />
                            جاري الرفع ({uploadingFiles.length} ملف)
                        </h3>
                        <button onClick={() => setUploadingFiles([])} className="text-xs text-gray-400 hover:text-gray-600">
                            إغلاق الكل
                        </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {uploadingFiles.map(file => (
                            <div key={file.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${file.status === 'success' ? 'bg-green-500' : file.status === 'error' ? 'bg-red-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${file.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {file.status === 'success' && <Check className="text-green-500" size={18} />}
                                    {file.status === 'error' && <X className="text-red-500" size={18} />}
                                    {(file.status === 'pending' || file.status === 'uploading') && (
                                        <span className="text-indigo-500 text-sm font-medium">{file.progress}%</span>
                                    )}
                                    <button onClick={() => removeUploadingFile(file.id)} className="p-1 text-gray-400 hover:text-gray-600"><X size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {currentFolders.length === 0 && currentItems.length === 0 ? (
                    <div
                        className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="mb-4 opacity-50">
                            <FolderOpen size={64} className="text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">المجلد فارغ</p>
                        <p className="text-sm mt-2">اسحب الصور هنا أو انقر للرفع</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Folders Section */}
                        {currentFolders.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                    <Folder size={18} />
                                    <span>المجلدات ({currentFolders.length})</span>
                                </h3>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {currentFolders.map(folder => {
                                            const contents = getFolderContents(folder.id);
                                            return (
                                                <div
                                                    key={folder.id}
                                                    className={`group relative bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-lg hover:border-indigo-300 ${dragOverFolderId === folder.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'}`}
                                                    onClick={() => setCurrentFolderId(folder.id)}
                                                    onDragOver={(e) => handleDragOver(e, folder.id)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => { e.stopPropagation(); handleDrop(e, folder.id); }}
                                                >
                                                    <div className="mb-2 flex justify-center text-indigo-200">
                                                        <Folder size={48} fill="currentColor" className="text-indigo-50" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700 text-center truncate" title={folder.name}>{folder.name}</p>
                                                    <div className="text-xs text-gray-400 text-center mt-1 space-y-0.5">
                                                        {contents.folders > 0 && <p>{contents.folders} مجلد</p>}
                                                        <p>{contents.files} ملف</p>
                                                    </div>
                                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setNewFolderName(folder.name); }} className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white" title="تعديل"><Edit2 size={12} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white" title="حذف"><Trash2 size={12} /></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* List View for Folders */
                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                        {currentFolders.map((folder, index) => {
                                            const contents = getFolderContents(folder.id);
                                            return (
                                                <div
                                                    key={folder.id}
                                                    className={`group flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-all ${index !== currentFolders.length - 1 ? 'border-b border-gray-100' : ''} ${dragOverFolderId === folder.id ? 'bg-indigo-50' : ''}`}
                                                    onClick={() => setCurrentFolderId(folder.id)}
                                                    onDragOver={(e) => handleDragOver(e, folder.id)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => { e.stopPropagation(); handleDrop(e, folder.id); }}
                                                >
                                                    <Folder size={24} className="text-indigo-400" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-800">{folder.name}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {contents.folders > 0 && `${contents.folders} مجلد • `}{contents.files} ملف
                                                        </p>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setNewFolderName(folder.name); }} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600" title="تعديل"><Edit2 size={16} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600" title="حذف"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Images Section */}
                        {currentItems.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                    <Image size={18} />
                                    <span>الصور ({currentItems.length})</span>
                                </h3>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {currentItems.map(item => (
                                            <div
                                                key={item.id}
                                                draggable={!isSelectMode}
                                                onDragStart={(e) => handleDragStart(e, item)}
                                                className={`group relative aspect-square bg-white rounded-xl overflow-hidden border transition-all cursor-pointer ${isSelectMode ? 'hover:ring-4 hover:ring-indigo-400 hover:scale-95' : 'hover:shadow-lg'}`}
                                                onClick={() => isSelectMode && onSelect?.(item)}
                                            >
                                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-lg flex flex-col items-end">
                                                    {item.width && item.height && <span className="font-bold">{item.width}×{item.height}</span>}
                                                    <span className="opacity-80">{formatFileSize(item.size)}</span>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                                                    <p className="text-xs font-medium truncate mb-1" title={item.name}>{item.name}</p>
                                                    <p className="text-[10px] opacity-70 mb-2">{item.date.toLocaleDateString('ar-SA')}</p>
                                                    {!isSelectMode && (
                                                        <div className="flex justify-between items-center">
                                                            <button onClick={(e) => { e.stopPropagation(); setMovingItem(item); setShowMoveModal(true); }} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg" title="نقل">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                                            </button>
                                                            <div className="flex gap-2">
                                                                <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg" title="حذف">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg" title="عرض">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* List View for Images */
                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                        {currentItems.map((item, index) => (
                                            <div
                                                key={item.id}
                                                draggable={!isSelectMode}
                                                onDragStart={(e) => handleDragStart(e, item)}
                                                className={`group flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-50 transition-all ${index !== currentItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                onClick={() => isSelectMode && onSelect?.(item)}
                                            >
                                                <img src={item.url} alt={item.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 truncate" title={item.name}>{item.name}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                        {item.width && item.height && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.width}×{item.height}</span>}
                                                        <span>{formatFileSize(item.size)}</span>
                                                        <span>{item.date.toLocaleDateString('ar-SA')}</span>
                                                    </div>
                                                </div>
                                                {!isSelectMode && (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); setMovingItem(item); setShowMoveModal(true); }} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600" title="نقل"><Folder size={16} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600" title="عرض"><Eye size={16} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600" title="حذف"><Trash2 size={16} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showNewFolderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewFolderModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Folder size={20} className="text-gray-800" /><span>إنشاء مجلد جديد</span>
                        </h3>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="اسم المجلد..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowNewFolderModal(false); setNewFolderName(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">إلغاء</button>
                            <button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">إنشاء</button>
                        </div>
                    </div>
                </div>
            )}

            {editingFolder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setEditingFolder(null); setNewFolderName(''); }}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Edit2 size={20} className="text-gray-800" /><span>إعادة تسمية المجلد</span>
                        </h3>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="الاسم الجديد..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setEditingFolder(null); setNewFolderName(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">إلغاء</button>
                            <button onClick={handleRenameFolder} disabled={!newFolderName.trim()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">حفظ</button>
                        </div>
                    </div>
                </div>
            )}

            {showMoveModal && movingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowMoveModal(false); setMovingItem(null); }}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[70vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Folder size={20} className="text-gray-800" /><span>نقل إلى مجلد</span>
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">نقل: <strong>{movingItem.name}</strong></p>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            <button
                                onClick={() => { onMoveItem(movingItem, null); setShowMoveModal(false); setMovingItem(null); }}
                                className={`w-full text-right px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${movingItem.folderId === null ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
                            >
                                <Home size={20} />
                                <span>الرئيسية (بدون مجلد)</span>
                            </button>
                            {mediaFolders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => { onMoveItem(movingItem, folder.id); setShowMoveModal(false); setMovingItem(null); }}
                                    className={`w-full text-right px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${movingItem.folderId === folder.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
                                >
                                    <Folder size={20} />
                                    <span>{folder.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end mt-4 pt-4 border-t">
                            <button onClick={() => { setShowMoveModal(false); setMovingItem(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
