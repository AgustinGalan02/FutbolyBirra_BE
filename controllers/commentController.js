import Comment from '../models/comment.js';

// POST
export const createComment = async (req, res) => {
    const { content, post } = req.body; 

    try {
        const newComment = new Comment({
            content,
            post,
            author: req.user.id 
        });

        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET
export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate('author', 'username team')
            .sort({ createdAt: 1 }); // orden: mas viejo a mas nuevo
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET comments by user
export const getCommentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const comments = await Comment.find({ author: userId })
            .populate('post', 'title') // populate para mostrar en q titulo comento
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: "Comentario no encontrado" });

        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "No tenés permiso" });
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};