import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import GanttChart from './components/GanttChart';
import BulkGenerator from './components/BulkGenerator';
import PostsListView from './components/PostsListView';
import PostModal from './components/PostModal';
import MediaLibrary from './components/MediaLibrary';
import DesignStudios from './components/DesignStudios';
import InvestorPlatform from './components/InvestorPlatform';
import LoginPage from './components/LoginPage';
import { Post, Campaign, Platform, MediaItem, MediaFolder } from './types';
import * as api from './services/api';
import { useAuth } from './contexts/AuthContext';
import {
  Zap,
  Download,
  Upload,
  Plus,
  LogOut,
  ClipboardList,
  Copy
} from 'lucide-react';

const App: React.FC = () => {
  const { user, loading: authLoading, signOut, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [showBulkGen, setShowBulkGen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaFolders, setMediaFolders] = useState<MediaFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);

  // JSON Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importing, setImporting] = useState(false);

  // Load data from Supabase on mount (or when user changes)
  useEffect(() => {
    // Don't fetch if still loading auth or no user when Supabase is configured
    if (isConfigured && (authLoading || !user)) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedPosts, fetchedCampaigns, fetchedMedia, fetchedFolders] = await Promise.all([
          api.getPosts(),
          api.getCampaigns(),
          api.getMediaItems(),
          api.getMediaFolders()
        ]);
        setPosts(fetchedPosts);
        setCampaigns(fetchedCampaigns);
        setMediaItems(fetchedMedia);
        setMediaFolders(fetchedFolders);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading, isConfigured]);

  // Show login page if Supabase is configured but user is not logged in
  if (isConfigured && authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isConfigured && !user) {
    return <LoginPage />;
  }


  const handleBulkPosts = async (newPosts: Post[]) => {
    try {
      // Save posts sequentially to avoid overwhelming Supabase
      const savedPosts: Post[] = [];

      for (let i = 0; i < newPosts.length; i++) {
        const post = newPosts[i];
        try {
          const saved = await api.createPost(post);
          savedPosts.push(saved);
        } catch (err) {
          console.error(`Failed to save post ${i + 1}:`, err);
          // Continue with next post even if one fails
        }

        // Small delay between requests to avoid rate limiting
        if (i < newPosts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      if (savedPosts.length > 0) {
        setPosts(prev => [...prev, ...savedPosts]);

        // If program, create campaign
        if (newPosts[0].programId) {
          const prog = newPosts[0];
          const dates = savedPosts.map(p => (p.date || new Date()).getTime());
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));

          const newCampaign: Campaign = {
            id: '',
            name: prog.programName || 'برنامج جديد',
            startDate: minDate,
            endDate: maxDate,
            color: '#6366f1',
            description: `برنامج محتوى لـ ${prog.platform || 'متعدد'} (${savedPosts.length} منشور)`
          };

          try {
            const savedCampaign = await api.createCampaign(newCampaign);
            setCampaigns(prev => [savedCampaign, ...prev]);
          } catch (err) {
            console.error('Failed to save campaign:', err);
          }
        }

        alert(`تم حفظ ${savedPosts.length} من ${newPosts.length} منشور بنجاح!`);
      } else {
        alert('فشل حفظ المنشورات. تأكد من إعداد قاعدة البيانات.');
      }

      setShowBulkGen(false);
      setActiveTab('posts');

    } catch (e) {
      console.error("Failed to save bulk posts", e);
      alert('حدث خطأ أثناء حفظ المنشورات.');
    }
  };

  const deletePost = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
      try {
        await api.deletePost(id);
        setPosts(prev => prev.filter(p => p.id !== id));
      } catch (e) {
        console.error(e);
        alert('فشل الحذف');
      }
    }
  };

  const openNewPostModal = (date?: Date) => {
    setEditingPost(null);
    setInitialDate(date || new Date());
    setIsModalOpen(true);
  };

  const openEditPostModal = (post: Post) => {
    setEditingPost(post);
    setInitialDate(undefined);
    setIsModalOpen(true);
  };

  const handleSavePost = async (post: Post) => {
    try {
      if (post.id && posts.find(p => p.id === post.id)) {
        // Update
        await api.updatePost(post);
        setPosts(prev => prev.map(p => p.id === post.id ? post : p));
      } else {
        // Create (Clean ID if it was a temp local ID during creation, although createPost handles ignoring ID usually or payload doesn't send it if not needed)
        // Actually api.createPost generates new ID.
        // If we passed a dummy ID from modal initialization, api.createPost payload doesn't include ID so it works.
        const savedPost = await api.createPost(post);
        setPosts(prev => [...prev, savedPost]);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to save post", e);
      alert('فشل حفظ المنشور');
    }
  };

  const handleUploadMedia = async (files: File[], folderId?: string | null, onProgress?: (fileId: string, progress: number) => void) => {
    // Upload all files with progress tracking
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      const fileId = `upload-${Date.now()}-${i}`;

      try {
        // Simulate progress for local storage mode (no real progress available)
        if (onProgress) {
          onProgress(fileId, 10);
        }

        const savedItem = await api.uploadMediaItem(file, folderId);

        if (onProgress) {
          onProgress(fileId, 100);
        }

        setMediaItems(prev => [savedItem, ...prev]);
      } catch (e) {
        console.error("Upload failed", e);
        // Don't show alert for each file - the UI will show the error status
      }
    }
  };

  const handleCreateFolder = async (name: string, parentId?: string | null) => {
    try {
      const newFolder = await api.createMediaFolder({ name, parentId });
      setMediaFolders(prev => [newFolder, ...prev]);
    } catch (e) {
      console.error("Failed to create folder", e);
      alert('فشل إنشاء المجلد');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (window.confirm('حذف هذا المجلد؟ سيتم نقل الملفات الموجودة فيه إلى الرئيسية.')) {
      try {
        await api.deleteMediaFolder(id);
        setMediaFolders(prev => prev.filter(f => f.id !== id));
        // Update media items that were in this folder
        setMediaItems(prev => prev.map(m => m.folderId === id ? { ...m, folderId: null } : m));
      } catch (e) {
        console.error("Failed to delete folder", e);
        alert('فشل حذف المجلد');
      }
    }
  };

  const handleRenameFolder = async (folder: MediaFolder) => {
    try {
      const updated = await api.updateMediaFolder(folder);
      setMediaFolders(prev => prev.map(f => f.id === folder.id ? updated : f));
    } catch (e) {
      console.error("Failed to rename folder", e);
      alert('فشل إعادة تسمية المجلد');
    }
  };

  const handleMoveItem = async (item: MediaItem, folderId: string | null) => {
    try {
      const updated = await api.updateMediaItem({ ...item, folderId });
      setMediaItems(prev => prev.map(m => m.id === item.id ? updated : m));
    } catch (e) {
      console.error("Failed to move item", e);
      alert('فشل نقل الملف');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const item = mediaItems.find(m => m.id === id);
    if (!item) return;

    if (window.confirm('حذف هذه الصورة؟')) {
      try {
        await api.deleteMediaItem(id, item.url);
        setMediaItems(prev => prev.filter(m => m.id !== id));
      } catch (e) {
        console.error(e);
        alert('فشل حذف الصورة');
      }
    }
  };

  // =====================
  // JSON EXPORT / IMPORT
  // =====================

  const handleExportPosts = () => {
    const exportData = {
      posts: posts.map(p => ({
        title: p.title,
        content: p.content,
        platform: p.platform,
        status: p.status,
        date: p.date.toISOString(),
        imageUrl: p.imageUrl || null,
        programId: p.programId || null,
        programName: p.programName || null
      })),
      exportedAt: new Date().toISOString(),
      totalPosts: posts.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `socialflow-posts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFromText = async () => {
    if (!importJsonText.trim()) return;

    setImporting(true);
    try {
      const json = JSON.parse(importJsonText);

      // Support both {posts: [...]} and direct array [...]
      const postsArray = Array.isArray(json) ? json : (json.posts || []);

      if (!Array.isArray(postsArray) || postsArray.length === 0) {
        alert('تنسيق غير صحيح. يجب أن يكون مصفوفة منشورات أو كائن يحتوي على "posts".');
        setImporting(false);
        return;
      }

      // Map common platform names to our Platform enum
      const mapPlatform = (name: string | undefined): Platform => {
        if (!name) return Platform.INSTAGRAM;
        const lower = name.toLowerCase();
        if (lower === 'twitter' || lower === 'x') return Platform.X;
        if (lower === 'instagram') return Platform.INSTAGRAM;
        if (lower === 'linkedin') return Platform.LINKEDIN;
        if (lower === 'tiktok') return Platform.TIKTOK;
        if (lower === 'facebook') return Platform.FACEBOOK;
        if (lower === 'whatsapp') return Platform.WHATSAPP;
        if (lower === 'telegram') return Platform.TELEGRAM;
        if (lower === 'snapchat') return Platform.SNAPCHAT;
        if (lower === 'youtube') return Platform.YOUTUBE;
        if (lower === 'threads') return Platform.THREADS;
        if (lower === 'pinterest') return Platform.PINTEREST;
        // Check if it already matches
        if (Object.values(Platform).includes(name as Platform)) {
          return name as Platform;
        }
        return Platform.INSTAGRAM;
      };

      const postsToImport: Post[] = postsArray.map((p: any, index: number) => ({
        id: '',
        title: p.title || `منشور ${index + 1}`,
        content: p.content || '',
        platform: mapPlatform(p.platform),
        status: p.status || 'Draft',
        date: new Date(p.date || Date.now()),
        imageUrl: p.imageUrl || undefined,
        programId: p.programId || undefined,
        programName: p.programName || undefined
      }));

      // Save to database
      const savePromises = postsToImport.map(p => api.createPost(p));
      const savedPosts = await Promise.all(savePromises);

      setPosts(prev => [...prev, ...savedPosts]);
      setShowImportModal(false);
      setImportJsonText('');
      alert(`تم استيراد ${savedPosts.length} منشور بنجاح!`);

    } catch (err) {
      console.error(err);
      alert('خطأ في تنسيق JSON. تأكد من صحة النص.');
    } finally {
      setImporting(false);
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-400 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
            جاري تحميل البيانات...
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'calendar':
        return (
          <div className="space-y-6">
            {showBulkGen && <BulkGenerator onPostsGenerated={handleBulkPosts} />}
            <CalendarView
              posts={posts}
              onAddPost={openNewPostModal}
              onEditPost={openEditPostModal}
            />
          </div>
        );
      case 'gantt':
        return <GanttChart campaigns={campaigns} />;
      case 'posts':
        return (
          <div className="space-y-6">
            {showBulkGen && <BulkGenerator onPostsGenerated={handleBulkPosts} />}
            <PostsListView posts={posts} onDeletePost={deletePost} onEditPost={openEditPostModal} />
          </div>
        );
      case 'media':
        return (
          <MediaLibrary
            mediaItems={mediaItems}
            mediaFolders={mediaFolders}
            onUpload={handleUploadMedia}
            onDelete={handleDeleteMedia}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={handleRenameFolder}
            onMoveItem={handleMoveItem}
          />
        );
      case 'studios':
        return <DesignStudios />;
      case 'investor':
        return <InvestorPlatform />;
      default:
        return <CalendarView posts={posts} onAddPost={openNewPostModal} onEditPost={openEditPostModal} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['IBM_Plex_Sans_Arabic']">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setShowBulkGen(false); }} />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pb-24 md:pb-8 transition-all">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="w-full md:w-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-between">
              <span>
                {activeTab === 'calendar' && 'التقويم الذكي'}
                {activeTab === 'gantt' && 'تخطيط المحتوى'}
                {activeTab === 'posts' && 'أرشيف المحتوى'}
                {activeTab === 'media' && 'مكتبة الوسائط'}
                {activeTab === 'studios' && 'استديوهات التصميم'}
                {activeTab === 'investor' && 'منصة المستثمر'}
              </span>
              <span className="md:hidden text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">SocialFlow</span>
            </h2>
            <p className="text-gray-500 mt-1 font-medium text-xs md:text-sm hidden sm:block">نظام إدارة المحتوى المتكامل (Supabase Edition)</p>
          </div>
          <div className="flex items-center gap-4">
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs text-gray-500">مرحباً</p>
                  <p className="text-sm font-medium text-gray-700 max-w-[150px] truncate">{user.email}</p>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
            {activeTab !== 'media' && activeTab !== 'investor' && (
              <button
                onClick={() => setShowBulkGen(!showBulkGen)}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 text-sm md:text-base ${showBulkGen ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <span>{showBulkGen ? 'إلغاء' : <><Zap size={16} /> <span className="hidden sm:inline">مولد البرامج</span><span className="sm:hidden">مولد</span></>}</span>
              </button>
            )}

            {activeTab !== 'media' && activeTab !== 'studios' && activeTab !== 'investor' && (
              <>
                <button
                  onClick={handleExportPosts}
                  className="px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5 text-sm md:text-base"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">تصدير</span>
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5 text-sm md:text-base"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">استيراد</span>
                </button>
              </>
            )}

            <button
              onClick={() => openNewPostModal()}
              className="bg-indigo-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform active:scale-95 flex items-center justify-center gap-1.5 text-sm md:text-base"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">منشور جديد</span>
              <span className="sm:hidden">جديد</span>
            </button>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </main>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePost}
        post={editingPost}
        initialDate={initialDate}
        mediaItems={mediaItems}
        onUploadMedia={handleUploadMedia}
      />

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-3xl p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Upload size={24} className="text-gray-800" />
              <span>استيراد منشورات من JSON</span>
            </h3>

            {/* Example Template */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                  <ClipboardList size={16} />
                  نموذج JSON (انسخ وعدّل):
                </span>
                <button
                  onClick={() => {
                    const template = `[
  {
    "title": "منشور ترويجي - العرض الأسبوعي",
    "content": "🔥 عرض خاص لهذا الأسبوع! خصم 30% على جميع المنتجات",
    "platform": "Instagram",
    "status": "Scheduled",
    "date": "2024-03-15T10:00:00Z",
    "programId": "campaign-march-2024",
    "programName": "حملة مارس التسويقية"
  },
  {
    "title": "نصيحة اليوم",
    "content": "💡 نصيحة: خطط لمحتواك قبل أسبوع على الأقل",
    "platform": "Twitter",
    "status": "Draft",
    "date": "2024-03-16T14:00:00Z",
    "programId": "campaign-march-2024",
    "programName": "حملة مارس التسويقية"
  },
  {
    "title": "قصة نجاح عميل",
    "content": "📈 شاهد كيف ضاعف عميلنا مبيعاته في شهر واحد...",
    "platform": "LinkedIn",
    "status": "Draft",
    "date": "2024-03-17T09:00:00Z"
  }
]`;
                    navigator.clipboard.writeText(template);
                    alert('تم نسخ النموذج!');
                  }}
                  className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <Copy size={12} className="mr-1" />
                  نسخ النموذج
                </button>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>الحقول المطلوبة:</strong> <code className="bg-white px-1 rounded">title</code></p>
                <p><strong>حقول اختيارية:</strong> <code className="bg-white px-1 rounded">content, platform, status, date, programId, programName</code></p>
                <p><strong>المنصات:</strong> Instagram, Twitter, LinkedIn, TikTok, Facebook</p>
                <p><strong>الحالات:</strong> Draft, Scheduled, Published</p>
              </div>
            </div>

            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full h-56 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none font-mono text-sm resize-none"
              placeholder="الصق نص JSON هنا..."
              dir="ltr"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowImportModal(false); setImportJsonText(''); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleImportFromText}
                disabled={!importJsonText.trim() || importing}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري الاستيراد...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    استيراد المنشورات
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

export default App;
