const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    genres: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['Ongoing', 'Completed'],
        default: 'Ongoing'
    },
    episodes: [{
        number: Number,
        title: String,
        url: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    releaseDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Anime', animeSchema); 