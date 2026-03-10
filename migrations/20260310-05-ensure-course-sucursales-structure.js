'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure single-branch reference exists on courses
    await queryInterface.sequelize.query(`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS sucursal_id INTEGER;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'courses_sucursal_id_fkey'
        ) THEN
          ALTER TABLE courses
          ADD CONSTRAINT courses_sucursal_id_fkey
          FOREIGN KEY (sucursal_id)
          REFERENCES sucursales(id)
          ON UPDATE CASCADE
          ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS courses_sucursal_id_idx ON courses (sucursal_id);
    `);

    // Ensure many-to-many table exists for multi-branch courses
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS course_sucursales (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        sucursal_id INTEGER NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'course_sucursales_course_id_fkey'
        ) THEN
          ALTER TABLE course_sucursales
          ADD CONSTRAINT course_sucursales_course_id_fkey
          FOREIGN KEY (course_id)
          REFERENCES courses(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'course_sucursales_sucursal_id_fkey'
        ) THEN
          ALTER TABLE course_sucursales
          ADD CONSTRAINT course_sucursales_sucursal_id_fkey
          FOREIGN KEY (sucursal_id)
          REFERENCES sucursales(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS course_sucursales_course_id_idx ON course_sucursales (course_id);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS course_sucursales_sucursal_id_idx ON course_sucursales (sucursal_id);
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'course_sucursales_course_id_sucursal_id_unique'
        ) THEN
          ALTER TABLE course_sucursales
          ADD CONSTRAINT course_sucursales_course_id_sucursal_id_unique
          UNIQUE (course_id, sucursal_id);
        END IF;
      END
      $$;
    `);
  },

  async down() {
    // Intentionally no-op to avoid dropping shared structures in existing environments.
  }
};
