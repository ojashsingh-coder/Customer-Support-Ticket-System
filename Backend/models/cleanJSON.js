function cleanJSON(schema) {
  schema.set('toJSON', {
    virtuals: false,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id;
      return ret;
    }
  });
}

module.exports = cleanJSON;