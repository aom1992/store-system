import mysql from 'mysql2/promise';

function connectMysql(db) {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: db,
    debug: false
  });

  return pool;
}

export default connectMysql;