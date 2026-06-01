import { getDatabase } from '../database/init.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
  try {
    const db = await getDatabase();

    db.all(
      `SELECT id, full_name, email, phone, age, role, created_at FROM users ORDER BY created_at DESC`,
      (err, users) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch users' });
        }

        res.json(users || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const db = await getDatabase();

    db.run(
      `UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [role, userId],
      function (err) {
        if (err || this.changes === 0) {
          return res.status(500).json({ error: 'Update failed' });
        }

        res.json({ message: 'User role updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getDatabase();

    // Предотвращение удаления последнего администратора
    db.get('SELECT COUNT(*) as count FROM users WHERE role = "admin"', (err, row) => {
      if (row.count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the only admin' });
      }

      db.run(
        `DELETE FROM users WHERE id = ?`,
        [userId],
        function (err) {
          if (err || this.changes === 0) {
            return res.status(500).json({ error: 'Delete failed' });
          }

          res.json({ message: 'User deleted successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const db = await getDatabase();

    const promises = [
      new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          resolve(row?.count || 0);
        });
      }),
      new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM clubs', (err, row) => {
          resolve(row?.count || 0);
        });
      }),
      new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM applications', (err, row) => {
          resolve(row?.count || 0);
        });
      }),
      new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM applications WHERE status = "approved"', (err, row) => {
          resolve(row?.count || 0);
        });
      })
    ];

    const [usersCount, clubsCount, applicationsCount, approvedCount] = await Promise.all(promises);

    res.json({
      total_users: usersCount,
      total_clubs: clubsCount,
      total_applications: applicationsCount,
      approved_applications: approvedCount,
      pending_applications: applicationsCount - approvedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getApplicationStats = async (req, res) => {
  try {
    const db = await getDatabase();

    db.all(
      `SELECT 
        c.id, c.name,
        COUNT(a.id) as total_applications,
        SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN a.status = 'new' THEN 1 ELSE 0 END) as new,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM clubs c
       LEFT JOIN applications a ON c.id = a.club_id
       GROUP BY c.id
       ORDER BY total_applications DESC`,
      (err, stats) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch statistics' });
        }

        res.json(stats || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClubRequests = async (req, res) => {
  try {
    const db = await getDatabase();

    db.all(
      `SELECT r.*, u.full_name AS teacher_name, u.email AS teacher_email
       FROM club_requests r
       JOIN users u ON r.teacher_id = u.id
       ORDER BY r.created_at DESC`,
      (err, requests) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch club requests' });
        }

        res.json(requests || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateClubRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, admin_note } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid request status' });
    }

    const db = await getDatabase();

    db.get(`SELECT * FROM club_requests WHERE id = ?`, [requestId], (err, request) => {
      if (err || !request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.status !== 'new') {
        return res.status(400).json({ error: 'Request already processed' });
      }

      const finalizeRequest = (clubId = null) => {
        db.run(
          `UPDATE club_requests SET status = ?, club_id = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [status, clubId, admin_note || null, requestId],
          function (updateErr) {
            if (updateErr || this.changes === 0) {
              return res.status(500).json({ error: 'Failed to update request' });
            }

            res.json({ message: `Request ${status} successfully`, club_id: clubId });
          }
        );
      };

      if (status === 'approved') {
        db.run(
          `INSERT INTO clubs (name, description, direction, age_min, age_max, teacher_id, schedule, location, max_students, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
          [
            request.name,
            request.description,
            request.direction,
            request.age_min,
            request.age_max,
            request.teacher_id,
            request.schedule,
            request.location,
            request.max_students || 20
          ],
          function (insertErr) {
            if (insertErr) {
              return res.status(500).json({ error: 'Failed to create club from request' });
            }

            finalizeRequest(this.lastID);
          }
        );
      } else {
        finalizeRequest(null);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
