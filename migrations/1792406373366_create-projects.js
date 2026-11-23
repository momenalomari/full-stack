/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */

export const up = (pgm) => {
  pgm.createTable("projects", {
    id: {
      type: "serial",
      primaryKey: true,
    },

    client_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },

    category_id: {
      type: "integer",
      notNull: true,
      references: "categories(id)",
      onDelete: "RESTRICT",
    },

    title: {
      type: "varchar(150)",
      notNull: true,
    },

    description: {
      type: "text",
      notNull: true,
    },

    budget: {
      type: "numeric(10,2)",
      notNull: true,
    },

    deadline: {
      type: "date",
      notNull: true,
    },

    status: {
      type: "varchar(30)",
      notNull: true,
      default: "open",
    },

    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.addConstraint("projects", "projects_budget_positive", {
    check: "budget > 0",
  });

  pgm.addConstraint("projects", "projects_status_check", {
    check:
      "status IN ('open', 'in_progress', 'submitted', 'revision_requested', 'completed', 'cancelled', 'disputed')",
  });
};

export const down = (pgm) => {
  pgm.dropTable("projects");
};

