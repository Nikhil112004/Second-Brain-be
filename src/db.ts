import mongoose, { model, Schema } from 'mongoose';
mongoose.connect("mongodb+srv://dev_nikhil:dev_nikhil28@cluster0.h2xpg.mongodb.net/second-brain");

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
})

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: "Tag"}],
    type: String,
    userId: {type: mongoose.Types.ObjectId, ref: "User", required: true }
})

const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true },
})

export const LinkModel = model("links", LinkSchema);
export const ContentModel = model("Content", ContentSchema);