const Pool = require('pg').Pool;
const Constants = require('../shared/constants');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT
});

const selectAccounts = () => {
  const text = 'select * from account';

  return pool.query(text);
};

const getParentStatus = async (token) => {
  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT status FROM parent where parent_uuid = $1', [token]);
    return rows[0].status;
  } finally {
    client.release();
  }
};

const createParent = async (parent) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const insert_parent_sql = 'insert into parent (name, email, phone, password, status) values ($1, $2, $3, $4, $5) RETURNING parent_id, parent_uuid';
    const { rows } = await client.query(insert_parent_sql, [parent.name, parent.email, parent.phone, parent.password, Constants.STATUS_PENDING_ACTIVATION]);

    const insert_child_sql = 'insert into child (parent_id, campus_id, name, grade, section) values ($1, $2, $3, $4, $5)';
    parent.children.forEach(async child => {
      let campusId = 2;
      let grade = +child.grade;

      if (Number.isNaN(grade) || grade < 6) {
        campusId = 1;
      }

      await client.query(insert_child_sql, [rows[0].parent_id, campusId, child.name, child.grade, child.section]);
    });

    await client.query('COMMIT')
    return rows[0].parent_uuid;
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
};

const createStaff = async (staff) => {
  const sql = 'insert into staff (school_id, name, email, phone, password, status) values ($1, $2, $3, $4, $5, $6) RETURNING staff_id, staff_uuid';
  const values = [1, staff.name, staff.email, staff.phone, 'dummy-password', Constants.STATUS_ACTIVE];

  const { rows } = await pool.query(sql, values);
  return rows[0].staff_uuid;
};

const loadParentsPendingActivation = async () => {
  const client = await pool.connect()
  try {
    const sql = `
      select p.name, email, phone, status, parent_uuid, p.created_on, c.name as child_name, grade, section
        from parent p join child c on c.parent_id = p.parent_id
        where p.status = 'PENDING_ACTIVATION'
        order by p.created_on
    `;

    const { rows } = await client.query(sql);
    return rows;
  } finally {
    client.release();
  }
};

const setApplicationStatus = async (parentUUID, status) => {
  const client = await pool.connect()
  try {
    const sql = 'update parent set status = $1 where parent_uuid = $2';
    const values = [status, parentUUID];
    const { rows } = await client.query(sql, values);
    return rows[0];
  } finally {
    client.release();
  }
};

const getCampusByParent = async (parentUUID) => {
  const client = await pool.connect();

  try {
    const sql = 'select latitude, longitude from campus where campus_id in (select distinct campus_id from child where parent_id in (select parent_id from parent where parent_uuid = $1))';
    const values = [parentUUID];
    const { rows } = await client.query(sql, values);
    return rows;
  } finally {
    client.release();
  }
};

const saveLocation = async (latitude, longitude, parentUuid) => {
    const sql = 'insert into location (parent_id, latitude, longitude) select parent_id, $1, $2 from parent where parent_uuid = $3';
    const values = [latitude, longitude, parentUuid];
    const { rows } = await pool.query(sql, values);
    return rows;
};

const readLocation = async () => {
  const sql = `
    select  p.name as parent_name, p.parent_uuid, t1.latitude, t1.longitude, c.campus_id, c.name as child_name, grade, section
    from    parent p
    inner join    child c on p.parent_id = c.parent_id
    inner join    (
      SELECT    DISTINCT ON (parent_id) parent_id, latitude, longitude
      FROM      location
      ORDER BY  parent_id, created_on DESC
    ) t1
    on t1.parent_id = p.parent_id
    order by t1.parent_id
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

module.exports = {
  createParent,
  getParentStatus,
  createStaff,
  loadParentsPendingActivation,
  setApplicationStatus,
  getCampusByParent,
  saveLocation,
  readLocation
};