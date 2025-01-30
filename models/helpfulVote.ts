import mongoose, { Schema, Document } from 'mongoose';

export interface IHelpfulVote extends Document {
  reviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const helpfulVoteSchema = new Schema({
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound unique index to prevent duplicate votes
helpfulVoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

export default mongoose.models.HelpfulVote || mongoose.model<IHelpfulVote>('HelpfulVote', helpfulVoteSchema);
