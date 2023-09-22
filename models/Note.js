const mongoose = require("mongoose");
const { Schema } = mongoose;
const NoteSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    userAgent: {
        type: String
    },
    createdBy: {
        type: String
    }
});

NoteSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        console.log('Debug: Transformation in progress', doc, ret);
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
const Note = mongoose.model("Note", NoteSchema);
module.exports = Note;