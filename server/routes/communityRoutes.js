const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');

// GET /api/community/posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await CommunityPost.find()
            .populate('author', 'name email')
            .populate('comments.author', 'name email')
            .sort({ createdAt: -1 });

        const result = posts.map(post => ({
            id: post._id,
            author: post.author?.name || 'Anonymous',
            authorEmail: post.author?.email || '',
            content: post.content,
            likes: post.likes?.length || 0,
            likedBy: post.likes.map(id => id.toString()),
            comments: (post.comments || []).map(c => ({
                id: c._id,
                author: c.author?.name || 'Anonymous',
                content: c.content,
                createdAt: c.createdAt
            })),
            tags: post.tags || [],
            createdAt: post.createdAt
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/community/posts
router.post('/posts', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const post = await CommunityPost.create({
            author: userId,
            content: req.body.content,
            tags: req.body.tags || []
        });

        const populated = await post.populate('author', 'name email');
        res.status(201).json({
            id: populated._id,
            author: populated.author?.name || 'Anonymous',
            content: populated.content,
            likes: 0,
            likedBy: [],
            comments: [],
            tags: populated.tags,
            createdAt: populated.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const post = await CommunityPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const index = post.likes.indexOf(userId);
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }
        await post.save();

        res.json({ likes: post.likes.length, liked: index === -1 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const post = await CommunityPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({
            author: userId,
            content: req.body.content
        });
        await post.save();

        // Re-populate and return
        const updated = await CommunityPost.findById(req.params.id)
            .populate('comments.author', 'name email');

        const lastComment = updated.comments[updated.comments.length - 1];
        res.status(201).json({
            id: lastComment._id,
            author: lastComment.author?.name || 'Anonymous',
            content: lastComment.content,
            createdAt: lastComment.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
