const mongoose = require('mongoose');
const { createConnection, Schema } = mongoose;
const Config = require('./config');

mongoose
  .connect(Config.mongoLink, {
    dbName: 'Telegram-concurso-Id-' + Config.bot_token.split(':')[0],
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Base de Datos conectada');
  })
  .catch((e) => {
    console.log('Error en la Base de Datos', e);
  });

const collections = [
  {
    name: 'users',
    schema: new Schema({
      id: {
        type: Number,
        required: true,
        unique: true,
      },
      first_name: {
        type: String,
        required: false,
      },
      last_name: {
        type: String,
        required: false,
      },
      username: {
        type: String,
        required: false,
      },
      last_update: {
        type: Date,
        default: () => Date.now(),
      },
      joined: {
        type: Date,
        default: () => Date.now(),
      },
      balance: {
        type: Number,
        default: 0,
        required: false,
      },
      pending_refs: {
        type: Number,
        default: 0,
        required: false,
      },
      withdrawn: {
        type: Number,
        default: 0,
        required: false,
      },
      refferal_id: {
        type: String,
        required: false,
        default: 'no one',
      },
      invited_users: {
        type: Array,
        default: [],
        required: false,
      },
      pending_ref_users: {
        type: Array,
        default: [],
        required: false,
      },
      total_invited: {
        type: Number,
        default: 0,
        required: false,
      },
      paid_for_refer: {
        type: Boolean,
        default: false,
        required: false,
      },
      not_a_bot: {
        type: Boolean,
        required: false,
        default: false,
      },
      is_verified: {
        type: Boolean,
        required: false,
        default: false,
      },
      user_step: {
        type: String,
        required: false,
        default: 'bind twitter',
      },
      wallet: {
        type: String,
        required: false,
        default: 'not set',
      },
      twitter: {
        type: String,
        required: false,
        default: 'not set',
      },
      twitter_id: {
        type: String,
        required: false,
        default: 'not set',
      },
      bind_twitter: { type: Boolean, required: false, default: false },
      join_group: { type: Boolean, required: false, default: false },
      join_channel: { type: Boolean, required: false, default: false },
      do_twitter: { type: Boolean, required: false, default: false },
      bind_walllet: { type: Boolean, required: false, default: false },
    }),
  },
  {
    name: 'bot',
    schema: new Schema({
      id: {
        type: String,
        required: true,
      },
      admin: {
        type: Array,
        required: false,
        default: [Config.admin],
      },
      post_limited: {
        type: Boolean,
        required: false,
        default: false,
      },
      post_limited_for: {
        type: Number,
        required: false,
        default: 0,
      },
      user_lookup: {
        type: Boolean,
        required: false,
        default: false,
      },
      user_lookup_limit: {
        type: Number,
        required: false,
        default: 0,
      },
      broadcast_status: {
        type: String,
        required: false,
        default: 'Inactive',
      },
    }),
  },
];
collections.reverse().forEach((collection) => {
  if (collection.pre) {
    Object.keys(collection.pre).forEach((preKey) => {
      collection.schema.pre(preKey, collection.pre[preKey]);
    });
  }
  if (collection.method) {
    collection.schema.method(collection.method);
  }
  if (collection.virtual) {
    Object.keys(collection.virtual).forEach((virtual) => {
      collection.schema.virtual(virtual, collection.virtual[virtual]);
    });
  }
  mongoose.model(collection.name, collection.schema);
});

const database = (collectionName) => {
  const collection = collections.find((el) => el.name === collectionName);
  if (collection) {
    return mongoose.model(collection.name, collection.schema);
  } else {
    throw new Error('Collection not Found');
  }
};

module.exports = database;
