export const up = (pgm) => {
  pgm.addColumns("users", {
    email_verified: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    email_verification_hash: {
      type: "varchar(64)",
      unique: true,
    },
    email_verification_expires_at: {
      type: "timestamptz",
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumns("users", [
    "email_verification_expires_at",
    "email_verification_hash",
    "email_verified",
  ]);
};
