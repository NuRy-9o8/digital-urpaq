import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database.db');

const runQuery = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const getRow = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const ensureUser = async (db, user) => {
  const existing = await getRow(db, 'SELECT id FROM users WHERE email = ?', [user.email]);
  if (existing) {
    await runQuery(
      db,
      `UPDATE users SET full_name = ?, password = ?, phone = ?, age = ?, role = ? WHERE id = ?`,
      [user.full_name, user.password, user.phone || null, user.age || null, user.role, existing.id]
    );
    return existing.id;
  }

  const result = await runQuery(
    db,
    `INSERT INTO users (full_name, email, password, phone, age, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [user.full_name, user.email, user.password, user.phone || null, user.age || null, user.role]
  );

  return result.lastID;
};

const getIdByName = async (db, table, name) => {
  const row = await getRow(db, `SELECT id FROM ${table} WHERE name = ?`, [name]);
  return row?.id || null;
};

const ensureClub = async (db, club) => {
  const existing = await getRow(db, 'SELECT id FROM clubs WHERE name = ?', [club.name]);
  if (existing) {
    await runQuery(
      db,
      `UPDATE clubs SET description = ?, direction = ?, age_min = ?, age_max = ?, teacher_id = ?,
       schedule = ?, location = ?, max_students = ?, current_students = ?, status = 'open' WHERE id = ?`,
      [
        club.description,
        club.direction,
        club.age_min,
        club.age_max,
        club.teacher_id,
        club.schedule,
        club.location,
        club.max_students,
        club.current_students,
        existing.id,
      ]
    );
    return existing.id;
  }

  const result = await runQuery(
    db,
    `INSERT INTO clubs (name, description, direction, age_min, age_max, teacher_id, schedule, location, max_students, current_students, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
    [
      club.name,
      club.description,
      club.direction,
      club.age_min,
      club.age_max,
      club.teacher_id,
      club.schedule,
      club.location,
      club.max_students,
      club.current_students,
    ]
  );
  return result.lastID;
};

const ensureNews = async (db, news) => {
  const existing = await getRow(db, 'SELECT id FROM news WHERE title = ?', [news.title]);
  if (existing) {
    await runQuery(
      db,
      `UPDATE news SET content = ?, type = ?, image_url = ?, is_published = 1, created_by = ? WHERE id = ?`,
      [news.content, news.type, news.image_url || null, news.created_by, existing.id]
    );
    return existing.id;
  }

  const result = await runQuery(
    db,
    `INSERT INTO news (title, content, type, image_url, created_by, is_published) VALUES (?, ?, ?, ?, ?, 1)`,
    [news.title, news.content, news.type, news.image_url || null, news.created_by]
  );
  return result.lastID;
};

export const seedDatabase = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      db.serialize(async () => {
        try {
          const usersCount = await getRow(db, 'SELECT COUNT(*) as count FROM users');
          const clubsCount = await getRow(db, 'SELECT COUNT(*) as count FROM clubs');
          const applicationsCount = await getRow(db, 'SELECT COUNT(*) as count FROM applications');
          const newsCount = await getRow(db, 'SELECT COUNT(*) as count FROM news');

          const shouldSeedUsers = usersCount.count === 0;
          const shouldSeedClubs = clubsCount.count === 0;
          const shouldSeedApplications = applicationsCount.count === 0;
          const shouldSeedNews = newsCount.count === 0;

          if (shouldSeedUsers || shouldSeedClubs || shouldSeedApplications || shouldSeedNews) {
            console.log('📝 Добавляем демо данные...');
          } else {
            console.log('✅ База данных уже содержит демо-данные, обновляем учетные записи...');
          }

          const adminId = await ensureUser(db, {
            full_name: 'Администратор',
            email: 'admin@example.com',
            password: '$2a$10$cr4ndUXsEwWSNScdI0FTnecR5g9IEkDCsA3ARWqoiw4dbOlVF3HeO',
            age: 40,
            role: 'admin'
          });

          const teacher1Id = await ensureUser(db, {
            full_name: 'Иван Преподаватель',
            email: 'teacher1@example.com',
            password: '$2a$10$cr4ndUXsEwWSNScdI0FTnecR5g9IEkDCsA3ARWqoiw4dbOlVF3HeO',
            age: 35,
            role: 'teacher',
            phone: '+7 700 123 45 67'
          });

          const teacher2Id = await ensureUser(db, {
            full_name: 'Мария Учитель',
            email: 'teacher2@example.com',
            password: '$2a$10$cr4ndUXsEwWSNScdI0FTnecR5g9IEkDCsA3ARWqoiw4dbOlVF3HeO',
            age: 32,
            role: 'teacher',
            phone: '+7 700 234 56 78'
          });

          const student1Id = await ensureUser(db, {
            full_name: 'Алексей Студент',
            email: 'student1@example.com',
            password: '$2a$10$cr4ndUXsEwWSNScdI0FTnecR5g9IEkDCsA3ARWqoiw4dbOlVF3HeO',
            age: 15,
            role: 'student',
            phone: '+7 700 345 67 89'
          });

          const student2Id = await ensureUser(db, {
            full_name: 'Ольга Студентка',
            email: 'student2@example.com',
            password: '$2a$10$cr4ndUXsEwWSNScdI0FTnecR5g9IEkDCsA3ARWqoiw4dbOlVF3HeO',
            age: 14,
            role: 'student',
            phone: '+7 700 456 78 90'
          });

          if (shouldSeedClubs) {
            await runQuery(
              db,
              `INSERT INTO clubs (name, description, direction, age_min, age_max, teacher_id, schedule, location, max_students, current_students, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
              ['Python для начинающих', 'Изучение основ программирования на Python', 'Программирование', 14, 18, teacher1Id, 'ПН, СР, ПТ 15:00-16:30', 'Кабинет 101', 20, 5]
            );

            await runQuery(
              db,
              `INSERT INTO clubs (name, description, direction, age_min, age_max, teacher_id, schedule, location, max_students, current_students, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
              ['Web-дизайн', 'Создание красивых веб-сайтов', 'Программирование', 15, 18, teacher1Id, 'ВТ, ЧТ 16:00-17:30', 'Кабинет 102', 15, 8]
            );

            await runQuery(
              db,
              `INSERT INTO clubs (name, description, direction, age_min, age_max, teacher_id, schedule, location, max_students, current_students, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
              ['Цифровое искусство', 'Рисование и дизайн на компьютере', 'Искусство', 14, 18, teacher2Id, 'ПН, ПТ 17:00-18:30', 'Кабинет 201', 12, 10]
            );

            await runQuery(
              db,
              `INSERT INTO clubs (name, description, direction, age_min, age_max, teacher_id, schedule, location, max_students, current_students, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
              ['Робототехника', 'Собирание и программирование роботов', 'Наука', 14, 17, teacher2Id, 'СР, СБ 14:00-15:30', 'Лаборатория', 16, 12]
            );
          }

          const palaceClubs = [
            ['Кабинет виртуальной реальности', 'Знакомство с VR-сценами, 3D-моделями и интерактивными образовательными симуляциями.', 'IT направление', 12, 17, teacher1Id, 'ПН, СР 15:00-16:30', 'Кабинет VR', 16, 9],
            ['SOFT-программирование', 'Основы алгоритмов, веб-разработки и проектной работы для начинающих программистов.', 'IT направление', 10, 17, teacher1Id, 'ВТ, ЧТ 16:00-17:30', 'Кабинет SOFT', 20, 12],
            ['Лаборатория робототехники и мехатроники', 'Конструирование, механика, датчики и программирование роботов для соревнований.', 'IT направление', 10, 17, teacher2Id, 'СР, СБ 14:00-15:30', 'Лаборатория робототехники', 18, 13],
            ['Современные биотехнологии', 'Практические занятия в лаборатории: наблюдения, эксперименты и исследовательские мини-проекты.', 'Научно-биологическое направление', 12, 18, teacher2Id, 'ПН, ПТ 16:00-17:30', 'Биолаборатория', 18, 10],
            ['Кабинет химии', 'Безопасные опыты, решение задач и подготовка к олимпиадам по химии.', 'Научно-биологическое направление', 13, 18, teacher2Id, 'ВТ, ЧТ 15:00-16:30', 'Кабинет химии', 16, 8],
            ['Домбра', 'Музыкальная культура, исполнительское мастерство и выступления в творческих проектах.', 'Художественно-эстетическое направление', 7, 16, teacher2Id, 'ПН, СР 17:00-18:30', 'Музыкальная студия', 15, 8],
            ['Журналистика и медиатехнологии', 'Сценарии, съемка, интервью, монтаж и выпуск школьных медиаматериалов.', 'Художественно-эстетическое направление', 11, 18, teacher1Id, 'ПТ 15:00-17:00', 'Медиацентр', 18, 11],
            ['Дебатный клуб Digital Urpaq', 'Аргументация, публичные выступления, командная работа и развитие лидерских качеств.', 'Гуманитарное направление', 12, 18, teacher1Id, 'СР, ПТ 16:30-18:00', 'Актовый зал', 24, 14],
            ['Математика и логика', 'Олимпиадные задачи, шахматное мышление и подготовка к техническим направлениям.', 'Естественно-математическое направление', 9, 17, teacher1Id, 'ВТ, СБ 14:00-15:30', 'Кабинет математики', 20, 11],
            ['Волонтерский клуб', 'Социальные инициативы, командные проекты и развитие личной культуры школьника.', 'Социально-педагогическое направление', 12, 18, teacher2Id, 'ЧТ 16:00-17:30', 'Проектная аудитория', 24, 15],
          ];

          for (const [name, description, direction, age_min, age_max, teacher_id, schedule, location, max_students, current_students] of palaceClubs) {
            await ensureClub(db, { name, description, direction, age_min, age_max, teacher_id, schedule, location, max_students, current_students });
          }

          if (shouldSeedApplications) {
            const pythonClubId = await getIdByName(db, 'clubs', 'Python для начинающих');
            const artClubId = await getIdByName(db, 'clubs', 'Цифровое искусство');

            if (student1Id && pythonClubId) {
              await runQuery(
                db,
                `INSERT INTO applications (student_id, club_id, status, comment) VALUES (?, ?, 'approved', ?)`,
                [student1Id, pythonClubId, 'Очень интересуюсь программированием']
              );
            }

            if (student2Id && artClubId) {
              await runQuery(
                db,
                `INSERT INTO applications (student_id, club_id, status, comment) VALUES (?, ?, 'new', ?)`,
                [student2Id, artClubId, 'Люблю рисовать']
              );
            }
          }

          if (shouldSeedNews) {
            await runQuery(
              db,
              `INSERT INTO news (title, content, type, created_by, is_published) VALUES (?, ?, 'news', ?, 1)`,
              ['Начало нового семестра', 'Рады объявить начало новых кружков на 2024 год!', adminId]
            );

            await runQuery(
              db,
              `INSERT INTO news (title, content, type, created_by, is_published) VALUES (?, ?, 'achievement', ?, 1)`,
              ['Достижения наших студентов', 'Наши ученики выиграли региональный конкурс по программированию!', adminId]
            );
          }

          const portalNews = [
            {
              title: 'Открыта регистрация на кружки 2026-2027 учебного года',
              type: 'announcement',
              content:
                'Дворец школьников Digital Urpaq открыл прием заявок на новый учебный сезон. Доступны программы по IT, научно-биологическому, художественно-эстетическому, гуманитарному, естественно-математическому и социально-педагогическому направлениям.\n\nРодители и учащиеся могут выбрать кружок, посмотреть расписание, возрастные ограничения и отправить заявку онлайн. После подачи заявления статус будет отображаться в личном кабинете.',
              created_by: adminId,
            },
            {
              title: 'Летняя Академия Digital Urpaq запускает практические интенсивы',
              type: 'news',
              content:
                'Летняя Академия приглашает школьников попробовать себя в программировании, робототехнике, биотехнологиях и творческих проектах. Формат построен вокруг коротких практических занятий и командной работы.\n\nКаждый участник сможет собрать мини-проект, познакомиться с наставниками и понять, какое направление подходит ему для дальнейшего обучения.',
              created_by: adminId,
            },
            {
              title: 'IT-центр расширяет набор в VR и SOFT-программирование',
              type: 'news',
              content:
                'В новом сезоне увеличено количество мест в кабинетах виртуальной реальности и SOFT-программирования. Учащиеся будут работать с 3D-моделями, образовательными симуляциями, основами алгоритмов и веб-разработки.\n\nПрограммы рассчитаны на начинающих и продолжающих школьников. Главный акцент сделан на проектном подходе и практических результатах.',
              created_by: adminId,
            },
            {
              title: 'Команды Дворца школьников готовятся к хакатонам',
              type: 'achievement',
              content:
                'Наставники Digital Urpaq начали подготовку команд к региональным конкурсам и хакатонам. Участники будут учиться формулировать идею, распределять роли, создавать прототип и защищать проект перед жюри.\n\nПодготовка открыта для учащихся IT-направления, медиастудии и естественно-математических кружков.',
              created_by: adminId,
            },
          ];

          for (const newsItem of portalNews) {
            await ensureNews(db, newsItem);
          }

          console.log('✅ Демо данные добавлены успешно!');
          console.log('');
          console.log('👤 Учетные данные для входа:');
          console.log('   Администратор: admin@example.com / password');
          console.log('   Преподаватель: teacher1@example.com / password');
          console.log('   Студент: student1@example.com / password');

          resolve(db);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
};
