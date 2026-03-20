import mongoose from 'mongoose';
const { Schema } = mongoose;

const jobSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

export default Job;