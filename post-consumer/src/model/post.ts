import mongoose, { Schema, Document } from "mongoose";

interface Post extends Document {
    title: string;
    content: string;
}

const postSchema = new Schema<Post>({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

export const PostModel = mongoose.model<Post>('Post', postSchema);
