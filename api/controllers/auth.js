import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { pool, connectToPool } from '../db.js';
import { Router } from 'express';
import * as crypto from 'node:crypto';
import jwt from 'node-jsonwebtoken';
import { expressjwt } from 'express-jwt';
import jwtSecret from '../secrets/jwt-secret.js';

const md5 = input => crypto.createHash('md5').update(input).digest('hex');
const generateSalt = () => crypto.randomBytes(16).toString('hex');
const verifyPassword = (password, salt, hash) => hash == md5(salt + password);

const authRouter = Router();

authRouter.get('/users', connectToPool, getUsers);
authRouter.post('/register', connectToPool, register);
authRouter.post('/login', login);


export default authRouter;

export const init = () => {
  passport.use(new LocalStrategy(async (username, password, done) => {
    let client;
    try {
      // Connect to PostgreSQL pool
      client = await pool.connect();

      // Query users table of users
      const users = await client.query({
        text: 'SELECT * FROM users WHERE username=$1',
        values: [username]
      });

      // Check to make sure there is only one user with the username queried
      if (users.rowCount == 1) {
        const user = users.rows[0];

        // Verify password
        if (verifyPassword(password, user.salt, user.hash)) {
          done(null, user);
        } else {
          done({error: 'Incorrect password'}, false);
        }
      } else {
        done({error: 'User not found'}, false);
      }
    } catch(err) {
      done(null, false);
    } finally {
      client.release();
    }
  })); 
}

function generateJwt(user, expiry) {
  return jwt.sign({
    id: user.id,
    username: user.username,
    exp: expiry.getTime() / 1000 
  }, jwtSecret, {
    algorithm: 'HS256'
  });
}

async function register(req, res, next) {
  try {
    const {username, password} = req.body;

    const salt = generateSalt();
    const hash = md5(salt + password);

    const user = await req.client.query({
      text: 'INSERT INTO users (username, salt, hash) VALUES ($1, $2, $3) RETURNING *',
      values: [username, salt, hash]
    });

    const expiry = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000));
    const token = generateJwt(user.rows[0], expiry);

    res.json({ token });
    
  } catch(err) {
  } finally {
    req.client.release();
  }
}

function login(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);

    if (user) {
      const expiry = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000));
      const token = generateJwt(user, expiry);

      res.json({ token });
    } else {
      next({error: 'User not found', info});
    }
  })(req, res, next);
}

async function getUsers(req, res, next) {
  try {
    const users = await req.client.query('SELECT * FROM users');

    if (!users.rowCount)
      throw new Error({status: 404});

    res.json(users.rows);
  } catch(err) {
    next(err);
  } finally {
    req.client.release();
  }
}

export const jwtParse = expressjwt({
  secret: jwtSecret,
  algorithms: ['HS256']
});