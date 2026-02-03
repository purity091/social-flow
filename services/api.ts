import { supabase, isSupabaseConfigured } from './supabase';
import { Post, Campaign, MediaItem } from '../types';

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

// =====================
// API FUNCTIONS
// =====================

// Posts
export const getPosts = async (): Promise<Post[]> => {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalPosts();
    }
    const { data, error } = await supabase.from('posts').select('*');
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
        const newPost = { ...post, id: post.id || `local-${Date.now()}-${Math.random()}` };
        saveLocalPosts([...posts, newPost]);
        return newPost;
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
    const { data, error } = await supabase.from('campaigns').select('*');
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
    const payload = {
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

    // 1. Upload file to Storage (assuming bucket 'media' exists)
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);

    // 3. Save metadata to Database
    const payload = {
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
