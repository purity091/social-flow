import { supabase, isSupabaseConfigured } from './supabase';
import { Post, Campaign, MediaItem, Platform } from '../types';

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
        date: new Date(m.created_at)
    }));
};

export const uploadMediaItem = async (file: File): Promise<MediaItem> => {
    if (!isSupabaseConfigured || !supabase) {
        // Local mode: use object URL
        const newItem: MediaItem = {
            id: `local-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file),
            name: file.name,
            type: file.type,
            date: new Date()
        };
        const items = getLocalMediaItems();
        saveLocalMediaItems([newItem, ...items]);
        return newItem;
    }

    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // 1. Upload file to Storage (assuming bucket 'media' exists)
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);

    // 3. Save metadata to Database
    const payload = {
        user_id: userId,
        name: file.name,
        url: urlData.publicUrl,
        type: file.type
    };

    const { data: dbData, error: dbError } = await supabase.from('media_items').insert([payload]).select().single();
    if (dbError) throw dbError;

    return {
        id: dbData.id,
        name: dbData.name,
        url: dbData.url,
        type: dbData.type,
        date: new Date(dbData.created_at)
    };
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
