import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    numeroDocumento: {
      type: String,
      default: null,
    },
    nit: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

blacklistSchema.index({ email: 1 }, { unique: true });
blacklistSchema.index({ numeroDocumento: 1 }, { unique: true, sparse: true });
blacklistSchema.index({ nit: 1 }, { unique: true, sparse: true });

export default mongoose.model("Blacklist", blacklistSchema);
