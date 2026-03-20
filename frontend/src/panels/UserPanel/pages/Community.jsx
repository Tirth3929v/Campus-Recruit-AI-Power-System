import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, Send, User, MoreHorizontal, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
        credentials: 'include'
      });
      
      if (res.ok) {
        const post = await res.json();
        setPosts([{ ...post, content: newPost }, ...posts]);
        setNewPost('');
      }
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  const handleLike = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/posts/${id}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    } catch (error) {
      console.error("Failed to like post", error);
    }
  };

  const toggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      if (!comments[postId]) {
        try {
          const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setComments(prev => ({ ...prev, [postId]: data }));
          }
        } catch (error) {
          console.error("Failed to fetch comments", error);
        }
      }
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
        credentials: 'include'
      });

      if (res.ok) {
        const comment = await res.json();
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), comment]
        }));
        setPosts(posts.map(p => p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
        setNewComment('');
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Community Hub
            </h1>
            <p className="text-gray-400 text-sm mt-1">Discuss interview questions, share tips, and connect with peers.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search discussions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </header>

        {/* Create Post */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-8">
          <form onSubmit={handlePostSubmit}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind? Share an interview question or tip..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none min-h-[100px]"
            />
            <div className="flex justify-end mt-4">
              <button 
                type="submit"
                disabled={!newPost.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} /> Post
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400 border border-white/10">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{post.author}</h3>
                    <p className="text-xs text-gray-400">{post.course} • {post.timestamp}</p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <p className="text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              
              <div className="flex items-center gap-6 border-t border-white/10 pt-4">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors group"
                >
                  <Heart size={18} className="group-hover:fill-pink-500 transition-colors" />
                  <span className="text-sm font-medium">{post.likes} Likes</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-2 hover:text-blue-400 transition-colors ${expandedPostId === post.id ? 'text-blue-400' : 'text-gray-400'}`}
                >
                  <MessageSquare size={18} />
                  <span className="text-sm font-medium">{post.commentsCount || 0} Comments</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedPostId === post.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-white/5"
                >
                  <div className="space-y-4 mb-4">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="bg-black/20 rounded-xl p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-blue-400">{comment.author}</span>
                          <span className="text-[10px] text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-300">{comment.content}</p>
                      </div>
                    ))}
                    {(!comments[post.id] || comments[post.id].length === 0) && (
                      <p className="text-xs text-gray-500 text-center py-2">No comments yet.</p>
                    )}
                  </div>
                  
                  <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={!newComment.trim()}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </motion.div>
              )}
            </motion.div>
          ))}
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p>No discussions found. Be the first to post!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;