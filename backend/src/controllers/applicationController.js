import { getDatabase } from '../database/init.js';
import { notifyNewApplication, notifyStatusChange, notifyClubTeacher, notifyUserById } from '../services/telegramService.js';

const closeClubIfFull = (db, clubId) => {
  db.get(`SELECT current_students, max_students FROM clubs WHERE id = ?`, [clubId], (err, club) => {
    if (err || !club) return;
    if (club.current_students >= club.max_students) {
      db.run(`UPDATE clubs SET status = 'closed' WHERE id = ?`, [clubId], (updateErr) => {
        if (updateErr) console.error('Failed to close full club:', updateErr);
      });
    }
  });
};

export const submitApplication = async (req, res) => {
  try {
    const { club_id, comment } = req.body;

    if (!club_id) {
      return res.status(400).json({ error: 'Club ID required' });
    }

    const db = await getDatabase();

    db.get(`SELECT status, current_students, max_students, name AS club_name FROM clubs WHERE id = ?`, [club_id], (err, club) => {
      if (err || !club) {
        return res.status(404).json({ error: 'Club not found' });
      }

      if (club.status === 'closed' || club.current_students >= club.max_students) {
        return res.status(400).json({ error: 'Набор в этот кружок закрыт' });
      }

      db.get(
        'SELECT id FROM applications WHERE student_id = ? AND club_id = ? AND status IN ("new", "pending", "approved")',
        [req.user.id, club_id],
        (err, existing) => {
          if (existing) {
            return res.status(400).json({ error: 'Already applied for this club' });
          }

          db.run(
            `INSERT INTO applications (student_id, club_id, status, comment)
             VALUES (?, ?, 'new', ?)`,
            [req.user.id, club_id, comment || null],
            function (err) {
              if (err) {
                return res.status(500).json({ error: 'Application submission failed' });
              }

              db.run(
                `INSERT INTO club_stats (club_id, applications_count) VALUES (?, 1)
                 ON CONFLICT(club_id) DO UPDATE SET applications_count = applications_count + 1`,
                [club_id]
              );

              res.status(201).json({
                message: 'Application submitted successfully',
                application_id: this.lastID
              });

              notifyNewApplication({
                fullName: req.user.fullName || req.user.email,
                clubName: club.club_name,
                comment: comment || 'нет комментария',
              }).catch((err) => console.error('Telegram notify error:', err));

              notifyClubTeacher(club_id, `Новая заявка на кружок: <b>${req.user.fullName || req.user.email}</b> для кружка <b>${club.club_name}</b>.`).catch((err) => console.error('Telegram notify error:', err));
            }
          );
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const db = await getDatabase();

    db.all(
      `SELECT a.id, a.status, a.comment, a.created_at, c.name as club_name, c.description
       FROM applications a
       JOIN clubs c ON a.club_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.created_at DESC`,
      [req.user.id],
      (err, applications) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch applications' });
        }

        res.json(applications || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClubApplications = async (req, res) => {
  try {
    const { clubId } = req.params;
    const db = await getDatabase();

    db.all(
      `SELECT a.id, a.status, a.comment, a.created_at, u.full_name, u.email, u.phone, u.age
       FROM applications a
       JOIN users u ON a.student_id = u.id
       WHERE a.club_id = ?
       ORDER BY a.created_at DESC`,
      [clubId],
      (err, applications) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch applications' });
        }

        res.json(applications || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = await getDatabase();

    db.get(
      `SELECT a.*, u.full_name AS student_name, u.telegram_chat_id AS student_telegram, c.name AS club_name
       FROM applications a
       JOIN users u ON a.student_id = u.id
       JOIN clubs c ON a.club_id = c.id
       WHERE a.id = ?`,
      [applicationId],
      (err, application) => {
        if (err || !application) {
          return res.status(404).json({ error: 'Application not found' });
        }

        const previousStatus = application.status;

      db.run(
        `UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, applicationId],
        function (err) {
          if (err || this.changes === 0) {
            return res.status(500).json({ error: 'Update failed' });
          }

          if (previousStatus !== 'approved' && status === 'approved') {
            db.run(
              `UPDATE clubs SET current_students = current_students + 1 WHERE id = ?`,
              [application.club_id],
              (updateErr) => {
                if (updateErr) {
                  console.error('Failed to increment current_students:', updateErr);
                } else {
                  closeClubIfFull(db, application.club_id);
                }
              }
            );
          }

          notifyStatusChange(
            {
              status,
              clubName: application.club_name,
              studentName: application.student_name,
              applicationId,
            },
            application.student_telegram ? [application.student_telegram] : []
          ).catch((err) => console.error('Telegram notify error:', err));

          notifyClubTeacher(application.club_id, `Статус заявки на ваш кружок <b>${application.club_name}</b> изменён на <b>${status}</b>.`).catch((err) => console.error('Telegram notify error:', err));

          if (previousStatus === 'approved' && status !== 'approved') {
            db.run(
              `UPDATE clubs SET current_students = current_students - 1 WHERE id = ? AND current_students > 0`,
              [application.club_id],
              (updateErr) => {
                if (updateErr) {
                  console.error('Failed to decrement current_students:', updateErr);
                } else {
                  db.get(`SELECT current_students, max_students, status FROM clubs WHERE id = ?`, [application.club_id], (getErr, club) => {
                    if (getErr || !club) return;
                    if (club.status === 'closed' && club.current_students < club.max_students) {
                      db.run(`UPDATE clubs SET status = 'open' WHERE id = ?`, [application.club_id], (openErr) => {
                        if (openErr) console.error('Failed to reopen club:', openErr);
                      });
                    }
                  });
                }
              }
            );
          }

          res.json({ message: `Application ${status} successfully` });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const cancelApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const db = await getDatabase();

    db.run(
      `DELETE FROM applications WHERE id = ? AND student_id = ?`,
      [applicationId, req.user.id],
      function (err) {
        if (err || this.changes === 0) {
          return res.status(403).json({ error: 'Cannot cancel application' });
        }

        res.json({ message: 'Application cancelled successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
