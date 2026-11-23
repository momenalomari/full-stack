import { pool } from "../config/db.js";

export const createProject = async ({
  client_id,
  category_id,
  title,
  description,
  budget,
  deadline,
  image_url,
}) => {
  const query = `
    INSERT INTO projects (
      client_id,
      category_id,
      title,
      description,
      budget,
      deadline,
      image_url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    client_id,
    category_id,
    title,
    description,
    budget,
    deadline,
    image_url,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getAllProjects = async ({
  status = "open",
  search = "",
  sort = "newest",
  page = 1,
  limit = 12,
  categoryId = null,
} = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 12));
  const offset = (safePage - 1) * safeLimit;
  const values = [status];
  const clauses = ["p.status = $1"];

  if (search) {
    values.push(`%${search}%`);
    clauses.push(`(p.title ILIKE $${values.length} OR p.description ILIKE $${values.length})`);
  }
  if (categoryId) {
    values.push(categoryId);
    clauses.push(`p.category_id = $${values.length}`);
  }

  const orderBy =
    sort === "budget_low"
      ? "p.budget ASC"
      : sort === "budget_high"
        ? "p.budget DESC"
        : sort === "deadline"
          ? "p.deadline ASC"
          : "p.created_at DESC";

  values.push(safeLimit, offset);
  const limitParam = values.length - 1;
  const offsetParam = values.length;
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM projects p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${clauses.join(" AND ")}
     ORDER BY ${orderBy}, p.id DESC
     LIMIT $${limitParam} OFFSET $${offsetParam}`,
    values,
  );

  const countValues = values.slice(0, values.length - 2);
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM projects p
     WHERE ${clauses.join(" AND ")}`,
    countValues,
  );

  const total = countResult.rows[0].total;
  return {
    projects: result.rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getProjectsByClient = async (clientId) => {
  const result = await pool.query(
    `SELECT *
     FROM projects
     WHERE client_id = $1
     ORDER BY created_at DESC`,
    [clientId],
  );
  return result.rows;
};

export const getProjectById = async (id) => {
  const result = await pool.query(
    `
    select * from projects where id = $1`,
    [id],
  );

  return result.rows[0];
};

export const updateProject = async (
  id,
  client_id,
  { title, description, deadline, budget, category_id },
) => {
  const values = [
    title ?? null, // $1
    description ?? null, // $2
    deadline ?? null, // $3
    budget ?? null, // $4
    category_id ?? null, // $5
    client_id, // $6
    id, // $7
  ];
  const result = await pool.query(
    `UPDATE projects
SET
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    deadline = COALESCE($3, deadline),
    budget = COALESCE($4, budget),
    category_id = COALESCE($5, category_id),
    updated_at = CURRENT_TIMESTAMP
WHERE
    client_id = $6
    AND id = $7
    AND status = 'open'
RETURNING *`,
    values,
  );
  return result.rows[0];
};

export const deleteProject = async (id, client_id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE projects SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND client_id = $2 AND status = 'open' RETURNING *`,
      [id, client_id],
    );
    if (rows.length) {
      await client.query(
        `WITH rejected AS (
           UPDATE proposals SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
           WHERE project_id = $1 AND status = 'pending' RETURNING id
         )
         INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by)
         SELECT 'proposal', id, 'pending', 'rejected', $2 FROM rejected
         UNION ALL SELECT 'project', $1::integer, 'open', 'cancelled', $2::integer`,
        [id, client_id],
      );
    }
    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
