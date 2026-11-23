import { pool } from "../config/db.js";

export const getModeratorDashboardData = async () => {
  const [stats, pendingFeedback, disputedProjects, recentHistory] =
    await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM feedback WHERE status = 'pending') AS pending_feedback,
          (SELECT COUNT(*)::int FROM feedback WHERE status = 'approved') AS approved_feedback,
          (SELECT COUNT(*)::int FROM feedback WHERE status = 'rejected') AS rejected_feedback,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'disputed') AS disputed_projects,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'submitted') AS submitted_projects,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'revision_requested') AS revision_projects
      `),
      pool.query(`
        SELECT f.id, f.rating, f.comment, f.created_at,
               u.username, u.email
        FROM feedback f
        JOIN users u ON u.id = f.user_id
        WHERE f.status = 'pending'
        ORDER BY f.created_at DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT p.id, p.title, p.status, p.updated_at,
               u.username AS client_name
        FROM projects p
        JOIN users u ON u.id = p.client_id
        WHERE p.status IN ('disputed', 'submitted', 'revision_requested')
        ORDER BY p.updated_at DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT sh.*, u.username AS changed_by_name
        FROM status_history sh
        LEFT JOIN users u ON u.id = sh.changed_by
        ORDER BY sh.created_at DESC
        LIMIT 15
      `),
    ]);

  return {
    stats: stats.rows[0],
    pending_feedback: pendingFeedback.rows,
    attention_projects: disputedProjects.rows,
    recent_activity: recentHistory.rows,
  };
};
