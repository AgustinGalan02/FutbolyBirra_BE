import Comment from '../models/comment.js';
import Notification from '../models/notification.js';
import Post from '../models/post.js';
import User from '../models/user.js';

const authorPopulate = {
    path: 'author',
    select: 'username person',
    populate: {
        path: 'person',
        select: 'nombre apellido team'
    }
};

// POST
export const createComment = async (req, res) => {
    const { content, post, parentComment } = req.body;

    try {
        // 1. Guardar el nuevo comentario
        const newComment = new Comment({
            content,
            post,
            author: req.user.id,
            parentComment: parentComment || null
        });

        const savedComment = await newComment.save();

        // 2. Poblar datos del autor para el frontend
        const populatedComment = await Comment.findById(savedComment._id)
            .populate(authorPopulate);

        // 3. Crear las Notificaciones de forma no bloqueante
        try {
            const currentPost = await Post.findById(post);
            const postId = currentPost?._id || post;
            const postOwnerId = (currentPost?.author || currentPost?.user)?._id?.toString() || (currentPost?.author || currentPost?.user)?.toString();

            if (parentComment) {
                // Notificar al autor del comentario padre
                const parent = await Comment.findById(parentComment);
                const parentAuthorId = (parent?.author || parent?.user)?._id?.toString() || (parent?.author || parent?.user)?.toString();

                if (parentAuthorId && parentAuthorId !== req.user.id) {
                    await Notification.create({
                        recipient: parentAuthorId,
                        sender: req.user.id,
                        type: 'comment_reply',
                        post: postId
                    });
                }
            } else {
                // Notificar al dueño del post
                if (postOwnerId && postOwnerId !== req.user.id) {
                    await Notification.create({
                        recipient: postOwnerId,
                        sender: req.user.id,
                        type: 'post_comment',
                        post: postId
                    });
                }
            }

            // Notificar por menciones @username
            const mentions = content.match(/@([a-zA-Z0-9_]+)/g);
            if (mentions) {
                const usernames = [...new Set(mentions.map(m => m.slice(1)))];
                const mentionedUsers = await User.find({ username: { $in: usernames } });

                for (const targetUser of mentionedUsers) {
                    const targetUserId = targetUser._id.toString();
                    if (targetUserId !== req.user.id) {
                        await Notification.create({
                            recipient: targetUserId,
                            sender: req.user.id,
                            type: 'comment_reply',
                            post: postId
                        });
                    }
                }
            }
        } catch (notifError) {
            console.error('Error al generar notificaciones:', notifError.message);
        }

        return res.status(201).json(populatedComment);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// GET
export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate(authorPopulate)
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

        // Borra el comentario seleccionado Y todas las respuestas asociadas a él
        await Comment.deleteMany({
            $or: [
                { _id: req.params.id },
                { parentComment: req.params.id }
            ]
        });

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};