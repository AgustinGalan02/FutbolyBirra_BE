import Post from '../models/Post.js';

// GET
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username team')
            .populate('category', 'title');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET posts by user
export const getPostsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// POST
export const createPost = async (req, res) => {
    const { title, content, category } = req.body;
    try {
        const newPost = new Post({
            title,
            content,
            category,
            author: req.user.id // El id viene del token
        });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post no encontrado" });

        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "No tenés permiso para borrar este post" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post no encontrado" });

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Solo el autor puede editar su post" });
        }

        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};