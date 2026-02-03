
import React, { useState } from 'react';
import { Post, Platform } from '../types';
import { PLATFORM_CONFIG } from '../constants';

interface PostsListViewProps {
  posts: Post[];
  onDeletePost: (id: string) => void;
  onEditPost: (post: Post) => void;
}

const PostsListView: React.FC<PostsListViewProps> = ({ posts, onDeletePost, onEditPost }) => {
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<string, boolean>>(
    Object.values(Platform).reduce((acc, p) => ({ ...acc, [p]: true }), {})
  );
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});

  const togglePlatform = (p: string) => {
    setExpandedPlatforms(prev => ({ ...prev, [p]: !prev[p] }));
  };

  const toggleProgram = (pId: string) => {
    setExpandedPrograms(prev => ({ ...prev, [pId]: !prev[pId] }));
  };

  const platformsWithPosts = Object.values(Platform).filter(p => posts.some(post => post.platform === p));

  return (
    <div className="space-y-4">
      {platformsWithPosts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-400">لا توجد منشورات حالياً. ابدأ بإضافة منشور أو توليد برنامج مكثف.</p>
        </div>
      )}

      {platformsWithPosts.map(platform => {
        const platformPosts = posts.filter(p => p.platform === platform);
        const config = PLATFORM_CONFIG[platform];
        const isPlatformExpanded = expandedPlatforms[platform];

        // Group posts by programId
        const groupedByProgram: Record<string, { name: string, posts: Post[] }> = {};
        const individualPosts: Post[] = [];

        platformPosts.forEach(post => {
          if (post.programId) {
            if (!groupedByProgram[post.programId]) {
              groupedByProgram[post.programId] = { name: post.programName || 'برنامج غير مسمى', posts: [] };
            }
            groupedByProgram[post.programId].posts.push(post);
          } else {
            individualPosts.push(post);
          }
        });

        return (
          <div key={platform} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <button
              onClick={() => togglePlatform(platform)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color} text-white`}>
                  {config.icon('w-5 h-5')}
                </div>
                <h3 className="font-bold text-gray-800">{platform}</h3>
                <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">
                  {platformPosts.length} منشور
                </span>
              </div>
              <span className={`transform transition-transform ${isPlatformExpanded ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isPlatformExpanded && (
              <div className="p-4 space-y-4 bg-gray-50/30">
                {/* Programs Toggles */}
                {Object.entries(groupedByProgram).map(([programId, data]) => (
                  <div key={programId} className="border border-indigo-50 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => toggleProgram(programId)}
                      className="w-full flex items-center justify-between p-3 bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600">📦</span>
                        <span className="font-bold text-sm text-indigo-900">{data.name}</span>
                        <span className="text-[10px] text-indigo-400">({data.posts.length} منشور)</span>
                      </div>
                      <span className={`text-[10px] transform transition-transform ${expandedPrograms[programId] ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {expandedPrograms[programId] && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.posts.map(post => <PostCard key={post.id} post={post} onDelete={onDeletePost} onEdit={onEditPost} />)}
                      </div>
                    )}
                  </div>
                ))}

                {/* Individual Posts Section */}
                {individualPosts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 px-2 uppercase tracking-wider">منشورات فردية</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {individualPosts.map(post => <PostCard key={post.id} post={post} onDelete={onDeletePost} onEdit={onEditPost} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface PostCardProps {
  post: Post;
  onDelete: (id: string) => void;
  onEdit: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onEdit }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group h-full flex flex-col">
    <div className="flex justify-between items-start mb-3">
      <span className="text-[10px] font-mono text-gray-400">{post.date.toLocaleDateString('ar-SA')}</span>
      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${post.status === 'Published' ? 'bg-green-50 text-green-600' :
          post.status === 'Scheduled' ? 'bg-orange-50 text-orange-600' :
            'bg-gray-100 text-gray-500' // Draft
        }`}>
        {post.status}
      </span>
    </div>
    <h5 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1">{post.title}</h5>
    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-grow leading-relaxed">{post.content}</p>
    <div className="flex justify-end pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
      <button
        onClick={() => onEdit(post)}
        className="text-indigo-500 hover:text-indigo-700 text-[10px] font-bold"
      >
        تعديل
      </button>
      <button
        onClick={() => onDelete(post.id)}
        className="text-red-400 hover:text-red-600 text-[10px] font-bold"
      >
        حذف
      </button>
    </div>
  </div>
);

export default PostsListView;
