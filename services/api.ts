import { supabase, isSupabaseConfigured } from './supabase';
import { Post, Campaign, MediaItem, Platform, MediaFolder } from '../types';

// =====================
// LOCAL STORAGE FALLBACK
// =====================

const getLocalPosts = (): Post[] => {
    try {
        const data = localStorage.getItem('socialflow_posts');
        if (!data) return [];
        return JSON.parse(data).map((p: any) => ({ ...p, date: new Date(p.date) }));
    } catch { return []; }
};

const saveLocalPosts = (posts: Post[]) => {
    localStorage.setItem('socialflow_posts', JSON.stringify(posts));
};

const getLocalCampaigns = (): Campaign[] => {
    try {
        const data = localStorage.getItem('socialflow_campaigns');
        if (!data) return [];
        return JSON.parse(data).map((c: any) => ({ ...c, startDate: new Date(c.startDate), endDate: new Date(c.endDate) }));
    } catch { return []; }
};

const saveLocalCampaigns = (campaigns: Campaign[]) => {
    localStorage.setItem('socialflow_campaigns', JSON.stringify(campaigns));
};

const getLocalMediaItems = (): MediaItem[] => {
    try {
        const data = localStorage.getItem('socialflow_media');
        if (!data) return [];
        return JSON.parse(data).map((m: any) => ({ ...m, date: new Date(m.date) }));
    } catch { return []; }
};

const saveLocalMediaItems = (items: MediaItem[]) => {
    localStorage.setItem('socialflow_media', JSON.stringify(items));
};

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
};

// =====================
// API FUNCTIONS
// =====================

// Posts
export const getPosts = async (): Promise<Post[]> => {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalPosts();
    }
    const { data, error } = await supabase.from('posts').select('*').order('date', { ascending: true });
    if (error) throw error;
    return data.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        platform: p.platform,
        status: p.status,
        date: new Date(p.date),
        imageUrl: p.image_url,
        programId: p.program_id,
        programName: p.program_name
    }));
};

export const createPost = async (post: Post): Promise<Post> => {
    if (!isSupabaseConfigured || !supabase) {
        const posts = getLocalPosts();
        const newPost: Post = {
            ...post,
            id: post.id || `local-${Date.now()}-${Math.random()}`,
            date: post.date || new Date(),
            platform: post.platform || Platform.INSTAGRAM,
            status: post.status || 'Draft'
        };
        saveLocalPosts([...posts, newPost]);
        return newPost;
    }

    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const payload = {
        user_id: userId,
        title: post.title,
        content: post.content || null,
        platform: post.platform || 'Instagram',
        status: post.status || 'Draft',
        date: post.date ? post.date.toISOString() : new Date().toISOString(),
        image_url: post.imageUrl || null,
        program_id: post.programId || null,
        program_name: post.programName || null
    };
    const { data, error } = await supabase.from('posts').insert([payload]).select().single();
    if (error) throw error;
    return { ...post, id: data.id };
};

export const updatePost = async (post: Post): Promise<Post> => {
    if (!isSupabaseConfigured || !supabase) {
        const posts = getLocalPosts();
        const updated = posts.map(p => p.id === post.id ? post : p);
        saveLocalPosts(updated);
        return post;
    }
    const payload = {
        title: post.title,
        content: post.content,
        platform: post.platform,
        status: post.status,
        date: post.date.toISOString(),
        image_url: post.imageUrl,
        program_id: post.programId,
        program_name: post.programName
    };
    const { error } = await supabase.from('posts').update(payload).eq('id', post.id);
    if (error) throw error;
    return post;
};

export const deletePost = async (id: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
        const posts = getLocalPosts();
        saveLocalPosts(posts.filter(p => p.id !== id));
        return;
    }
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
};

// Campaigns
export const getCampaigns = async (): Promise<Campaign[]> => {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalCampaigns();
    }
    const { data, error } = await supabase.from('campaigns').select('*').order('start_date', { ascending: true });
    if (error) throw error;
    return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        startDate: new Date(c.start_date),
        endDate: new Date(c.end_date),
        color: c.color
    }));
};

export const createCampaign = async (campaign: Campaign): Promise<Campaign> => {
    if (!isSupabaseConfigured || !supabase) {
        const campaigns = getLocalCampaigns();
        const newCampaign = { ...campaign, id: campaign.id || `local-${Date.now()}` };
        saveLocalCampaigns([...campaigns, newCampaign]);
        return newCampaign;
    }

    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const payload = {
        user_id: userId,
        name: campaign.name,
        description: campaign.description,
        start_date: campaign.startDate.toISOString(),
        end_date: campaign.endDate.toISOString(),
        color: campaign.color
    };
    const { data, error } = await supabase.from('campaigns').insert([payload]).select().single();
    if (error) throw error;
    return { ...campaign, id: data.id };
};


// Media Folders
const getLocalMediaFolders = (): MediaFolder[] => {
    try {
        const data = localStorage.getItem('socialflow_media_folders');
        if (!data) return [];
        return JSON.parse(data).map((f: any) => ({ ...f, date: new Date(f.date) }));
    } catch { return []; }
};

const saveLocalMediaFolders = (folders: MediaFolder[]) => {
    localStorage.setItem('socialflow_media_folders', JSON.stringify(folders));
};

export const getMediaFolders = async (): Promise<MediaFolder[]> => {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalMediaFolders();
    }
    const { data, error } = await supabase.from('media_folders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((f: any) => ({
        id: f.id,
        name: f.name,
        parentId: f.parent_id,
        date: new Date(f.created_at)
    }));
};

export const createMediaFolder = async (folder: Omit<MediaFolder, 'id' | 'date'>): Promise<MediaFolder> => {
    if (!isSupabaseConfigured || !supabase) {
        const folders = getLocalMediaFolders();
        const newFolder: MediaFolder = {
            id: `local-${Date.now()}-${Math.random()}`,
            name: folder.name,
            parentId: folder.parentId || null,
            date: new Date()
        };
        saveLocalMediaFolders([newFolder, ...folders]);
        return newFolder;
    }

    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const payload = {
        user_id: userId,
        name: folder.name,
        parent_id: folder.parentId || null
    };

    const { data, error } = await supabase.from('media_folders').insert([payload]).select().single();
    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        parentId: data.parent_id,
        date: new Date(data.created_at)
    };
};

export const updateMediaFolder = async (folder: MediaFolder): Promise<MediaFolder> => {
    if (!isSupabaseConfigured || !supabase) {
        const folders = getLocalMediaFolders();
        const updated = folders.map(f => f.id === folder.id ? folder : f);
        saveLocalMediaFolders(updated);
        return folder;
    }

    const payload = {
        name: folder.name,
        parent_id: folder.parentId || null
    };

    const { error } = await supabase.from('media_folders').update(payload).eq('id', folder.id);
    if (error) throw error;
    return folder;
};

export const deleteMediaFolder = async (id: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
        const folders = getLocalMediaFolders();
        saveLocalMediaFolders(folders.filter(f => f.id !== id));
        // Also update media items that were in this folder
        const items = getLocalMediaItems();
        saveLocalMediaItems(items.map(m => m.folderId === id ? { ...m, folderId: null } : m));
        return;
    }

    // Update media items in this folder to have no folder
    await supabase.from('media_items').update({ folder_id: null }).eq('folder_id', id);

    const { error } = await supabase.from('media_folders').delete().eq('id', id);
    if (error) throw error;
};

// Helper function to get image dimensions
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image'));
        };
        img.src = URL.createObjectURL(file);
    });
};

// Media
export const getMediaItems = async (): Promise<MediaItem[]> => {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalMediaItems();
    }
    const { data, error } = await supabase.from('media_items').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((m: any) => ({
        id: m.id,
        name: m.name,
        url: m.url,
        type: m.type,
        date: new Date(m.created_at),
        folderId: m.folder_id,
        width: m.width,
        height: m.height,
        size: m.file_size
    }));
};

export const uploadMediaItem = async (file: File, folderId?: string | null): Promise<MediaItem> => {
    // Get image dimensions before upload
    let dimensions = { width: 0, height: 0 };
    if (file.type.startsWith('image/')) {
        try {
            dimensions = await getImageDimensions(file);
        } catch (e) {
            console.warn('Could not get image dimensions', e);
        }
    }

    if (!isSupabaseConfigured || !supabase) {
        // Local mode: use object URL (preserves original file)
        const newItem: MediaItem = {
            id: `local-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file),
            name: file.name,
            type: file.type,
            date: new Date(),
            folderId: folderId || null,
            width: dimensions.width,
            height: dimensions.height,
            size: file.size
        };
        const items = getLocalMediaItems();
        saveLocalMediaItems([newItem, ...items]);
        return newItem;
    }

    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // 1. Upload file to Storage WITHOUT any compression (preserving original size)
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        // No contentType transformation - keeps original
    });

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);

    // 3. Save metadata to Database with dimensions and size
    const payload = {
        user_id: userId,
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        folder_id: folderId || null,
        width: dimensions.width,
        height: dimensions.height,
        file_size: file.size
    };

    const { data: dbData, error: dbError } = await supabase.from('media_items').insert([payload]).select().single();
    if (dbError) throw dbError;

    return {
        id: dbData.id,
        name: dbData.name,
        url: dbData.url,
        type: dbData.type,
        date: new Date(dbData.created_at),
        folderId: dbData.folder_id,
        width: dbData.width,
        height: dbData.height,
        size: dbData.file_size
    };
};

export const updateMediaItem = async (item: MediaItem): Promise<MediaItem> => {
    if (!isSupabaseConfigured || !supabase) {
        const items = getLocalMediaItems();
        const updated = items.map(m => m.id === item.id ? item : m);
        saveLocalMediaItems(updated);
        return item;
    }

    const payload = {
        name: item.name,
        folder_id: item.folderId || null
    };

    const { error } = await supabase.from('media_items').update(payload).eq('id', item.id);
    if (error) throw error;
    return item;
};

export const deleteMediaItem = async (id: string, url: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
        const items = getLocalMediaItems();
        saveLocalMediaItems(items.filter(m => m.id !== id));
        return;
    }

    // 1. Delete from DB
    const { error: dbError } = await supabase.from('media_items').delete().eq('id', id);
    if (dbError) throw dbError;

    // 2. Delete from Storage (Extract path from URL)
    try {
        const path = url.split('/storage/v1/object/public/media/')[1];
        if (path) {
            await supabase.storage.from('media').remove([path]);
        }
    } catch (e) {
        console.error("Failed to delete file from storage", e);
    }
};

// =====================
// DESIGN STUDIOS
// =====================

export interface StudioLink {
    id: string;
    name: string;
    url: string;
    imageUrl: string;
    imageSize: string; // تصنيف حجم الصورة (مثل: 1080x1080، 1200x628، إلخ)
    usageTips: string; // نصائح كيفية الاستخدام
}

const getLocalStudios = (): StudioLink[] => {
    try {
        const data = localStorage.getItem('socialflow_studios');
        if (!data) return [];
        return JSON.parse(data);
    } catch { return []; }
};

const saveLocalStudios = (studios: StudioLink[]) => {
    localStorage.setItem('socialflow_studios', JSON.stringify(studios));
};

export const getStudios = async (): Promise<StudioLink[]> => {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalStudios();
    }
    const { data, error } = await supabase.from('design_studios').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((s: any) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        imageUrl: s.image_url || '',
        imageSize: s.image_size || '',
        usageTips: s.usage_tips || ''
    }));
};

export const createStudio = async (studio: Omit<StudioLink, 'id'>): Promise<StudioLink> => {
    if (!isSupabaseConfigured || !supabase) {
        const studios = getLocalStudios();
        const newStudio = { ...studio, id: `local-${Date.now()}`, imageSize: studio.imageSize || '', usageTips: studio.usageTips || '' };
        saveLocalStudios([newStudio, ...studios]);
        return newStudio;
    }

    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const payload = {
        user_id: userId,
        name: studio.name,
        url: studio.url,
        image_url: studio.imageUrl || null,
        image_size: studio.imageSize || null,
        usage_tips: studio.usageTips || null
    };

    const { data, error } = await supabase.from('design_studios').insert([payload]).select().single();
    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        url: data.url,
        imageUrl: data.image_url || '',
        imageSize: data.image_size || '',
        usageTips: data.usage_tips || ''
    };
};

export const deleteStudio = async (id: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
        const studios = getLocalStudios();
        saveLocalStudios(studios.filter(s => s.id !== id));
        return;
    }

    const { error } = await supabase.from('design_studios').delete().eq('id', id);
    if (error) throw error;
};

export const updateStudio = async (studio: StudioLink): Promise<StudioLink> => {
    if (!isSupabaseConfigured || !supabase) {
        const studios = getLocalStudios();
        const updated = studios.map(s => s.id === studio.id ? studio : s);
        saveLocalStudios(updated);
        return studio;
    }

    const payload = {
        name: studio.name,
        url: studio.url,
        image_url: studio.imageUrl || null,
        image_size: studio.imageSize || null,
        usage_tips: studio.usageTips || null
    };

    const { error } = await supabase.from('design_studios').update(payload).eq('id', studio.id);
    if (error) throw error;

    return studio;
};
