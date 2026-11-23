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
  pgm.createTable("proposals", {
    id: {
      type: "serial",
      primaryKey: true,
    },

    project_id: {
      type: "integer",
      notNull: true,
      references: "projects(id)",
      onDelete: "CASCADE",
    },

    freelancer_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "RESTRICT",
    },

    price: {
      type: "numeric(10,2)",
      notNull: true,
    },

    delivery_days: {
      type: "integer",
      notNull: true,
    },

    cover_letter: {
      type: "text",
      notNull: true,
    },

    technologies: {
      type: "text",
    },

    status: {
      type: "varchar(20)",
      notNull: true,
      default: "pending",
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

  // السعر لازم يكون أكبر من صفر
  pgm.addConstraint("proposals", "proposals_price_positive", {
    check: "price > 0",
  });

  // عدد أيام التنفيذ لازم يكون موجب
  pgm.addConstraint("proposals", "proposals_delivery_days_positive", {
    check: "delivery_days > 0",
  });

  // الحالات المسموحة للعروض
  pgm.addConstraint("proposals", "proposals_status_check", {
    check: "status IN ('pending', 'accepted', 'rejected', 'withdrawn')",
  });

  // منع المستقل من تقديم عرضين على نفس المشروع
  pgm.addConstraint("proposals", "unique_project_freelancer", {
    unique: ["project_id", "freelancer_id"],
  });

  // منع قبول أكثر من عرض واحد على نفس المشروع
  pgm.createIndex("proposals", "project_id", {
    name: "one_accepted_proposal_per_project",
    unique: true,
    where: "status = 'accepted'",
  });
};

export const down = (pgm) => {
  pgm.dropTable("proposals");
};

