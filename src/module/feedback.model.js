import { pool } from "../config/db.js";

export const createFeedback = async ({ userId, projectId, rating, comment }) => {
  const result = await pool.query(
    `INSERT INTO feedback (user_id, project_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, projectId || null, rating, comment],
  );
  return result.rows[0];
};

export const getApprovedFeedback = async () => {
  const result = await pool.query(
    `SELECT f.id, f.project_id, f.rating, f.comment, f.created_at,
            u.username
     FROM feedback f
     JOIN users u ON u.id = f.user_id
     WHERE f.status = 'approved'
     ORDER BY f.created_at DESC`,
  );
  return result.rows;
};

export const getPendingFeedback = async () => {
  const result = await pool.query(
    `SELECT f.*, u.username, u.email
     FROM feedback f
     JOIN users u ON u.id = f.user_id
     WHERE f.status = 'pending'
     ORDER BY f.created_at DESC`,
  );
  return result.rows;
};

export const reviewFeedback = async (feedbackId, reviewerId, status) => {
  const result = await pool.query(
    `WITH reviewed AS (
       UPDATE feedback
       SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND status = 'pending'
       RETURNING *
     )
     SELECT reviewed.*,
            u.username,
            u.email
     FROM reviewed
     JOIN users u ON u.id = reviewed.user_id`,
    [status, reviewerId, feedbackId],
  );
  return result.rows[0];
};
