import { getDatabase } from '../database/init.js';
import { notifyClubStudents, notifyClubTeacher, notifyNews, notifyEventAnnouncement } from '../services/telegramService.js';

export const createContent = async (req, res) => {
  try {
    const { club_id, title, content, type, access_level, file_url } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type required' });
    }

    const db = await getDatabase();

    db.run(
      `INSERT INTO educational_content (club_id, title, content, type, access_level, file_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [club_id || null, title, content || null, type, access_level || 'public', file_url || null, req.user.id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Content creation failed' });
        }

        res.status(201).json({
          message: 'Content created successfully',
          content_id: this.lastID
        });

        if (club_id) {
          notifyClubStudents(club_id, `Добавлено новое содержание для вашего кружка: <b>${title}</b>`)
            .catch((err) => console.error('Telegram notify error:', err));
          notifyClubTeacher(club_id, `В кружке <b>${title}</b> добавлено новое содержание.`)
            .catch((err) => console.error('Telegram notify error:', err));
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getContent = async (req, res) => {
  try {
    const { clubId } = req.params;
    const db = await getDatabase();

    let query = `
      SELECT ec.*, u.full_name as author
      FROM educational_content ec
      JOIN users u ON ec.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (clubId) {
      query += ' AND ec.club_id = ?';
      params.push(clubId);
    }

    query += ' ORDER BY ec.created_at DESC';

    db.all(query, params, (err, content) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch content' });
      }

      res.json(content || []);
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const db = await getDatabase();

    db.run(
      `DELETE FROM educational_content WHERE id = ? AND (created_by = ? OR ? = 'admin')`,
      [contentId, req.user.id, req.user.role],
      function (err) {
        if (err || this.changes === 0) {
          return res.status(403).json({ error: 'Delete failed or insufficient permissions' });
        }

        res.json({ message: 'Content deleted successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createNews = async (req, res) => {
  try {
    const { title, content, type, image_url } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const db = await getDatabase();

    db.run(
      `INSERT INTO news (title, content, type, image_url, created_by, is_published)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [title, content, type || 'news', image_url || null, req.user.id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'News creation failed' });
        }

        res.status(201).json({
          message: 'News created successfully',
          news_id: this.lastID
        });

        const notificationPayload = {
          title,
          body: content,
          date: new Date().toLocaleDateString('ru-RU'),
        };

        if (type === 'announcement') {
          notifyEventAnnouncement(notificationPayload).catch((err) => console.error('Telegram notify error:', err));
        } else {
          notifyNews(notificationPayload).catch((err) => console.error('Telegram notify error:', err));
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getNews = async (req, res) => {
  try {
    const db = await getDatabase();
    const { type } = req.query;

    let query = `
      SELECT n.*, u.full_name as author
      FROM news n
      JOIN users u ON n.created_by = u.id
      WHERE n.is_published = 1
    `;
    const params = [];

    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }

    query += ' ORDER BY n.created_at DESC LIMIT 50';

    db.all(query, params, (err, news) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch news' });
      }

      res.json(news || []);
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const db = await getDatabase();
    const { newsId } = req.params;

    db.get(
      `SELECT n.*, u.full_name as author
       FROM news n
       JOIN users u ON n.created_by = u.id
       WHERE n.id = ? AND n.is_published = 1`,
      [newsId],
      (err, newsItem) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch news' });
        }

        if (!newsItem) {
          return res.status(404).json({ error: 'News not found' });
        }

        res.json(newsItem);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const { newsId } = req.params;
    const db = await getDatabase();

    db.run(
      `DELETE FROM news WHERE id = ? AND (created_by = ? OR ? = 'admin')`,
      [newsId, req.user.id, req.user.role],
      function (err) {
        if (err || this.changes === 0) {
          return res.status(403).json({ error: 'Delete failed or insufficient permissions' });
        }

        res.json({ message: 'News deleted successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
