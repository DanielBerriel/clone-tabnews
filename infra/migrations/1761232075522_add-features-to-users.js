exports.up = (pgm) => {
  pgm.addColumn("users", {
    features: {
      type: "varchar[]",
      notNull: true,
      default: "{}" /* {} representa um array vazio no postgres */,
    },
  });
};

exports.down = false;
