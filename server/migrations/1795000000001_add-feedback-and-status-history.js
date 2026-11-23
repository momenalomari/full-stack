export const up = (pgm) => {
  pgm.createTable("feedback", {
    id: { type: "serial", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    project_id: {
      type: "integer",
      references: "projects(id)",
      onDelete: "CASCADE",
    },
    rating: { type: "integer", notNull: true },
    comment: { type: "text", notNull: true },
    status: { type: "varchar(20)", notNull: true, default: "pending" },
    reviewed_by: {
      type: "integer",
      references: "users(id)",
      onDelete: "SET NULL",
    },
    reviewed_at: { type: "timestamptz" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });
  pgm.addConstraint("feedback", "feedback_rating_check", {
    check: "rating BETWEEN 1 AND 5",
  });
  pgm.addConstraint("feedback", "feedback_status_check", {
    check: "status IN ('pending', 'approved', 'rejected')",
  });
  pgm.createIndex("feedback", ["status", "created_at"]);
  pgm.createIndex("feedback", "project_id");

  pgm.createTable("status_history", {
    id: { type: "serial", primaryKey: true },
    entity_type: { type: "varchar(20)", notNull: true },
    entity_id: { type: "integer", notNull: true },
    previous_status: { type: "varchar(30)" },
    new_status: { type: "varchar(30)", notNull: true },
    changed_by: {
      type: "integer",
      references: "users(id)",
      onDelete: "SET NULL",
    },
    note: { type: "text" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });
  pgm.addConstraint("status_history", "status_history_entity_check", {
    check: "entity_type IN ('project', 'proposal', 'feedback')",
  });
  pgm.createIndex("status_history", ["entity_type", "entity_id", "created_at"]);
};

export const down = (pgm) => {
  pgm.dropTable("status_history");
  pgm.dropTable("feedback");
};
