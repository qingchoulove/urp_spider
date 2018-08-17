'use strice'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

let InfoSchema = new Schema({
    id: String,
    std_id: {
        type: Number,
        unique: true
    },
    name: String,
    after: String,
    nation: String,
    class: String,
    institute: String,
    major: String
})

export default mongoose.model('Info', InfoSchema)