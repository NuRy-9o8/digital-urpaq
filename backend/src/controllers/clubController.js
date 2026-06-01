import { getDatabase } from '../database/init.js';
import { notifyAdmins, notifyClubStudents, notifyClubTeacher } from '../services/telegramService.js';

export const createClub = async (req, res) => {
  try {
    const { name, description, direction, age_min, age_max, schedule, location, max_students } = req.body;

    if (!name || !direction) {
      return res.status(400).json({ error: 'Name and direction required' });
    }

    const db = await getDatabase();

    db.run(
      `INSERT INTO clubs (name, description, direction, age_min, age_max, teacher_id, schedule, location, max_students, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [name, description || null, direction, age_min || null, age_max || null, req.user.id, schedule || null, location || null, max_students || 20],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Club creation failed' });
        }

        res.status(201).json({
          message: 'Club created successfully',
          club_id: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

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

    db.get(`SELECT status, current_students, max_students FROM clubs WHERE id = ?`, [club_id], (err, club) => {
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
            }
          );
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const requestNewClub = async (req, res) => {
  try {
    const { name, description, direction, age_min, age_max, schedule, location, max_students } = req.body;

    if (!name || !direction) {
      return res.status(400).json({ error: 'Name and direction required' });
    }

    const db = await getDatabase();

    db.run(
      `INSERT INTO club_requests (teacher_id, name, description, direction, age_min, age_max, schedule, location, max_students)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, description || null, direction, age_min || null, age_max || null, schedule || null, location || null, max_students || 20],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Club request failed' });
        }

        res.status(201).json({
          message: 'Запрос на открытие кружка отправлен',
          request_id: this.lastID
        });

        notifyAdmins(`Новый запрос на открытие кружка от преподавателя <b>${req.user.fullName || req.user.email}</b>: <b>${name}</b>`)
          .catch((err) => console.error('Telegram notify error:', err));
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClubs = async (req, res) => {
  try {
    const db = await getDatabase();
    const { status, direction, age } = req.query;

    let query = `
      SELECT c.*, u.full_name as teacher_name, cs.views, cs.applications_count, cs.rating
      FROM clubs c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN club_stats cs ON c.id = cs.club_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (direction) {
      query += ' AND c.direction = ?';
      params.push(direction);
    }

    if (age) {
      query += ' AND (c.age_min IS NULL OR c.age_min <= ?) AND (c.age_max IS NULL OR c.age_max >= ?)';
      params.push(age, age);
    }

    db.all(query, params, (err, clubs) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch clubs' });
      }

      res.json(clubs || []);
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClubById = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;

    // Увеличиваем счетчик просмотров
    db.run(
      `INSERT INTO club_stats (club_id, views) VALUES (?, 1)
       ON CONFLICT(club_id) DO UPDATE SET views = views + 1`,
      [id],
      (err) => {
        if (err) console.error('Stats update error:', err);
      }
    );

    db.get(
      `SELECT c.*, u.full_name as teacher_name, cs.views, cs.applications_count, cs.rating
       FROM clubs c
       LEFT JOIN users u ON c.teacher_id = u.id
       LEFT JOIN club_stats cs ON c.id = cs.club_id
       WHERE c.id = ?`,
      [id],
      (err, club) => {
        if (err || !club) {
          return res.status(404).json({ error: 'Club not found' });
        }

        res.json(club);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, direction, age_min, age_max, schedule, location, max_students, status } = req.body;
    const db = await getDatabase();

    db.get('SELECT * FROM clubs WHERE id = ?', [id], (err, oldClub) => {
      if (err || !oldClub) {
        return res.status(404).json({ error: 'Club not found' });
      }

      db.run(
        `UPDATE clubs SET 
         name = ?, description = ?, direction = ?, age_min = ?, age_max = ?, 
         schedule = ?, location = ?, max_students = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND (teacher_id = ? OR ? = 'admin')`,
        [name, description, direction, age_min, age_max, schedule, location, max_students, status, id, req.user.id, req.user.role],
        function (updateErr) {
          if (updateErr || this.changes === 0) {
            return res.status(403).json({ error: 'Update failed or insufficient permissions' });
          }

          res.json({ message: 'Club updated successfully' });

          const notices = [];
          if (oldClub.schedule !== schedule) {
            notices.push(`В кружке <b>${oldClub.name}</b> изменилось расписание: <b>${oldClub.schedule || 'не указано'}</b> → <b>${schedule || 'не указано'}</b>`);
          }
          if (oldClub.status !== status) {
            notices.push(`Статус кружка <b>${oldClub.name}</b> изменён: <b>${oldClub.status}</b> → <b>${status}</b>`);
          }

          if (notices.length > 0) {
            const message = notices.join('\n');
            notifyClubStudents(id, message).catch((err) => console.error('Telegram notify error:', err));
            notifyClubTeacher(id, message).catch((err) => console.error('Telegram notify error:', err));
          }
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    db.run(
      `DELETE FROM clubs WHERE id = ? AND (teacher_id = ? OR ? = 'admin')`,
      [id, req.user.id, req.user.role],
      function (err) {
        if (err || this.changes === 0) {
          return res.status(403).json({ error: 'Delete failed or insufficient permissions' });
        }

        res.json({ message: 'Club deleted successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClubStudents = async (req, res) => {
  try {
    const { clubId } = req.params;
    const db = await getDatabase();

    db.all(
      `SELECT DISTINCT u.id, u.full_name, u.email, u.phone, u.age, a.created_at as enrolled_at
       FROM users u
       JOIN applications a ON u.id = a.student_id
       WHERE a.club_id = ? AND a.status = 'approved'
       ORDER BY a.created_at DESC`,
      [clubId],
      (err, students) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch students' });
        }

        res.json(students || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
