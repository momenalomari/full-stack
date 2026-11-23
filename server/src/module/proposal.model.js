import { pool } from "../config/db.js";

const workflowError = (code) => Object.assign(new Error(code), { code });

export const submitProposal = async ({
  project_id,
  freelancer_id,
  price,
  delivery_days,
  cover_letter,
  technologies,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectResult = await client.query(
      "SELECT id, client_id, status FROM projects WHERE id = $1 FOR UPDATE",
      [project_id],
    );
    const project = projectResult.rows[0];

    if (!project) throw workflowError("PROJECT_NOT_FOUND");
    if (project.client_id === freelancer_id)
      throw workflowError("SELF_PROPOSAL");
    if (project.status !== "open") throw workflowError("PROJECT_NOT_OPEN");

    const result = await client.query(
      `INSERT INTO proposals (
         project_id, freelancer_id, price, delivery_days, cover_letter, technologies
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        project_id,
        freelancer_id,
        price,
        delivery_days,
        cover_letter,
        technologies ?? null,
      ],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    throw error;
  } finally {
    client.release();
  }
};

export const getProposalsByFreelancer = async (freelancerId) => {
  const result = await pool.query(
    `SELECT p.*, pr.title AS project_title, pr.status AS project_status
     FROM proposals p
     JOIN projects pr ON pr.id = p.project_id
     WHERE p.freelancer_id = $1
     ORDER BY p.created_at DESC`,
    [freelancerId],
  );
  return result.rows;
};

export const getProjectProposals = async (projectId, clientId) => {
  const result = await pool.query(
    `SELECT p.id, p.project_id, p.freelancer_id, p.price, p.delivery_days,
            p.cover_letter, p.technologies, p.status, p.created_at, p.updated_at,
            u.username AS freelancer_username
     FROM proposals p
     JOIN projects pr ON pr.id = p.project_id
     JOIN users u ON u.id = p.freelancer_id
     WHERE p.project_id = $1 AND pr.client_id = $2
     ORDER BY p.created_at DESC`,
    [projectId, clientId],
  );
  return result.rows;
};

export const updateProposal = async (
  proposalId,
  freelancerId,
  proposalData,
) => {
  const { price, delivery_days, cover_letter, technologies } = proposalData;
  const result = await pool.query(
    `UPDATE proposals
     SET price = COALESCE($1, price),
         delivery_days = COALESCE($2, delivery_days),
         cover_letter = COALESCE($3, cover_letter),
         technologies = COALESCE($4, technologies),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5 AND freelancer_id = $6 AND status = 'pending'
     RETURNING *`,
    [
      price ?? null,
      delivery_days ?? null,
      cover_letter ?? null,
      technologies ?? null,
      proposalId,
      freelancerId,
    ],
  );
  return result.rows[0];
};

export const withdrawProposal = async (proposalId, freelancerId) => {
  const result = await pool.query(
    `UPDATE proposals
     SET status = 'withdrawn', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND freelancer_id = $2 AND status = 'pending'
     RETURNING *`,
    [proposalId, freelancerId],
  );
  return result.rows[0];
};

export const acceptProposal = async (proposalId, clientId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectResult = await client.query(
      `SELECT pr.id, pr.client_id, pr.status
       FROM projects pr
       JOIN proposals p ON p.project_id = pr.id
       WHERE p.id = $1
       FOR UPDATE OF pr`,
      [proposalId],
    );
    const project = projectResult.rows[0];

    if (!project) throw workflowError("PROPOSAL_NOT_FOUND");
    if (project.client_id !== clientId)
      throw workflowError("NOT_PROJECT_OWNER");
    if (project.status !== "open") throw workflowError("PROJECT_NOT_OPEN");

    const proposalResult = await client.query(
      "SELECT id, status FROM proposals WHERE id = $1 FOR UPDATE",
      [proposalId],
    );
    if (proposalResult.rows[0]?.status !== "pending") {
      throw workflowError("PROPOSAL_NOT_PENDING");
    }

    await client.query(
      `UPDATE proposals
       SET status = CASE WHEN id = $1 THEN 'accepted' ELSE 'rejected' END,
           updated_at = CURRENT_TIMESTAMP
       WHERE project_id = $2 AND status = 'pending'`,
      [proposalId, project.id],
    );
    await client.query(
      `UPDATE projects
       SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [project.id],
    );
    await client.query(
      `INSERT INTO status_history
       (entity_type, entity_id, previous_status, new_status, changed_by)
       VALUES ('proposal', $1, 'pending', 'accepted', $2)`,
      [proposalId, clientId],
    );
    await client.query(
      `INSERT INTO status_history
       (entity_type, entity_id, previous_status, new_status, changed_by)
       VALUES ('project', $1, 'open', 'in_progress', $2)`,
      [project.id, clientId],
    );

    const acceptedResult = await client.query(
      "SELECT * FROM proposals WHERE id = $1",
      [proposalId],
    );

    await client.query("COMMIT");
    return acceptedResult.rows[0];
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    throw error;
  } finally {
    client.release();
  }
};

export const rejectProposal = async (proposalId, clientId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectResult = await client.query(
      `SELECT pr.id, pr.client_id, pr.status, p.status AS proposal_status
       FROM proposals p
       JOIN projects pr ON pr.id = p.project_id
       WHERE p.id = $1
       FOR UPDATE OF pr, p`,
      [proposalId],
    );
    const proposal = projectResult.rows[0];

    if (!proposal) throw workflowError("PROPOSAL_NOT_FOUND");
    if (proposal.client_id !== clientId)
      throw workflowError("NOT_PROJECT_OWNER");
    if (proposal.status !== "open") throw workflowError("PROJECT_NOT_OPEN");
    if (proposal.proposal_status !== "pending")
      throw workflowError("PROPOSAL_NOT_PENDING");

    const result = await client.query(
      `UPDATE proposals
       SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [proposalId],
    );
    await client.query(
      `INSERT INTO status_history
       (entity_type, entity_id, previous_status, new_status, changed_by)
       VALUES ('proposal', $1, 'pending', 'rejected', $2)`,
      [proposalId, clientId],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    throw error;
  } finally {
    client.release();
  }
};
