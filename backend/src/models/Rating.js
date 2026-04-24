import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 0, max: 5 },
  comentario: { type: String, default: "" }
}, { timestamps: true });

ratingSchema.index({ donationId: 1, fromUser: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);