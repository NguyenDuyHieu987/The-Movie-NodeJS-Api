import mongoose from 'mongoose';

const Search = new mongoose.Schema({
  comments: { ref: 'Comment' },
  posts: { ref: 'Post' },
});

export default mongoose.model('movies', Search);
