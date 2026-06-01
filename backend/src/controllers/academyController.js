import { getDatabase } from '../database/init.js';
import { notifyAdmins, notifyUserById } from '../services/telegramService.js';

export const submitAcademyApplication = async (req, res) => {
  try {
    const { program, student_name, age, phone, comment } = req.body;

    if (!program || !student_name) {
      return res.status(400).json({ error: 'Program and student name are required' });
    }

    const db = await getDatabase();

    db.run(
      `INSERT INTO academy_applications (student_id, program, student_name, age, phone, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, program, student_name, age || null, phone || null, comment || null],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Academy application submission failed' });
        }

        res.status(201).json({
          message: 'Academy application submitted successfully',
          application_id: this.lastID,
        });

        notifyAdmins(
          `Новая заявка в Летнюю Академию: <b>${student_name}</b>, программа: <b>${program}</b>.`
        ).catch((notifyErr) => console.error('Telegram notify error:', notifyErr));
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyAcademyApplications = async (req, res) => {
  try {
    const db = await getDatabase();

    db.all(
      `SELECT id, program, student_name, age, phone, comment, status, created_at
       FROM academy_applications
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [req.user.id],
      (err, applications) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch academy applications' });
        }

        res.json(applications || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllAcademyApplications = async (req, res) => {
  try {
    const db = await getDatabase();

    db.all(
      `SELECT a.*, u.full_name AS user_name, u.email AS user_email
       FROM academy_applications a
       JOIN users u ON a.student_id = u.id
       ORDER BY a.created_at DESC`,
      (err, applications) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch academy applications' });
        }

        res.json(applications || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAcademyApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = await getDatabase();

    db.get('SELECT * FROM academy_applications WHERE id = ?', [applicationId], (getErr, application) => {
      if (getErr || !application) {
        return res.status(404).json({ error: 'Academy application not found' });
      }

      db.run(
        `UPDATE academy_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, applicationId],
        function (err) {
          if (err || this.changes === 0) {
            return res.status(500).json({ error: 'Update failed' });
          }

          res.json({ message: `Academy application ${status} successfully` });

          notifyUserById(
            application.student_id,
            `Статус заявки в Летнюю Академию изменен: <b>${status}</b>.`
          ).catch((notifyErr) => console.error('Telegram notify error:', notifyErr));
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
