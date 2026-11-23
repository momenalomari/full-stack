import { pool } from "../config/db.js";

export const getAdminDashboardData = async () => {
  const [statsResult, usersResult, projectsResult, proposalsResult] =
    await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM users) AS total_users,
          (SELECT COUNT(*)::int FROM users WHERE is_active = TRUE) AS active_users,
          (SELECT COUNT(*)::int FROM users WHERE is_active = FALSE) AS inactive_users,
          (SELECT COUNT(*)::int FROM users WHERE role = 'admin') AS admin_users,
          (SELECT COUNT(DISTINCT p.client_id)::int FROM projects p JOIN users u ON u.id = p.client_id WHERE u.is_active = TRUE) AS active_clients,
          (SELECT COUNT(DISTINCT pr.freelancer_id)::int FROM proposals pr JOIN users u ON u.id = pr.freelancer_id WHERE u.is_active = TRUE) AS active_freelancers,
          (SELECT COUNT(*)::int FROM projects) AS total_projects,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'open') AS open_projects,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'in_progress') AS in_progress_projects,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'submitted') AS submitted_projects,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'revision_requested') AS revision_projects,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'completed') AS completed_projects,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'cancelled') AS cancelled_projects,
          (SELECT COUNT(*)::int FROM projects WHERE status = 'disputed') AS disputed_projects,
          (SELECT COUNT(*)::int FROM proposals) AS total_proposals,
          (SELECT COUNT(*)::int FROM proposals WHERE status = 'pending') AS pending_proposals,
          (SELECT COUNT(*)::int FROM proposals WHERE status = 'accepted') AS accepted_proposals,
          (SELECT COUNT(*)::int FROM proposals WHERE status = 'rejected') AS rejected_proposals,
          (SELECT COUNT(*)::int FROM proposals WHERE status = 'withdrawn') AS withdrawn_proposals,
          (SELECT COALESCE(SUM(budget), 0)::numeric(14, 2) FROM projects WHERE status IN ('open', 'in_progress', 'submitted', 'revision_requested')) AS active_budget
      `),
      pool.query(`
        SELECT u.id, u.username, u.email, u.role, u.status, u.is_active,
               u.created_at, u.updated_at,
               COUNT(DISTINCT p.id)::int AS client_project_count,
               COUNT(DISTINCT pr.id)::int AS freelancer_proposal_count
        FROM users u
        LEFT JOIN projects p ON p.client_id = u.id
        LEFT JOIN proposals pr ON pr.freelancer_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at DESC, u.id DESC
      `),
      pool.query(`
        SELECT p.id, p.title, p.description, p.status, p.budget,
               p.deadline, p.created_at, p.updated_at,
               p.client_id, u.username AS client_name, u.email AS client_email,
               c.name AS category_name,
               COUNT(pr.id)::int AS proposal_count
        FROM projects p
        JOIN users u ON u.id = p.client_id
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN proposals pr ON pr.project_id = p.id
        GROUP BY p.id, u.username, u.email, c.name
        ORDER BY p.created_at DESC, p.id DESC
      `),
      pool.query(`
        SELECT pr.id, pr.project_id, pr.freelancer_id,
               pr.price, pr.delivery_days, pr.technologies, pr.cover_letter,
               pr.status, pr.created_at, pr.updated_at,
               p.title AS project_title, p.client_id,
               client.username AS client_name, client.email AS client_email,
               freelancer.username AS freelancer_name,
               freelancer.email AS freelancer_email
        FROM proposals pr
        JOIN projects p ON p.id = pr.project_id
        JOIN users client ON client.id = p.client_id
        JOIN users freelancer ON freelancer.id = pr.freelancer_id
        ORDER BY pr.created_at DESC, pr.id DESC
      `),
    ]);

  return {
    stats: statsResult.rows[0],
    users: usersResult.rows,
    projects: projectsResult.rows,
    proposals: proposalsResult.rows,
  };
};
