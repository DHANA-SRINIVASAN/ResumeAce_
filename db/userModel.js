const { pool } = require('./connection');

// User operations
const userModel = {
  // Create a new user
  async createUser(userData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, first_name, last_name, resume_path) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.username, userData.email, userData.password, userData.firstName, userData.lastName, userData.resumePath]
      );
      return { id: result.insertId, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Update user resume path
  async updateResumePath(userId, resumePath) {
    try {
      await pool.execute('UPDATE users SET resume_path = ? WHERE user_id = ?', [resumePath, userId]);
      return true;
    } catch (error) {
      console.error('Error updating resume path:', error);
      throw error;
    }
  },

  // Store user skills (from parsed resume)
  async storeUserSkills(userId, skills) {
    try {
      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        for (const skill of skills) {
          // Check if skill exists in skills table
          let [skillRows] = await connection.execute('SELECT skill_id FROM skills WHERE skill_name = ?', [skill.name]);
          
          let skillId;
          if (skillRows.length === 0) {
            // Insert new skill
            const [result] = await connection.execute('INSERT INTO skills (skill_name) VALUES (?)', [skill.name]);
            skillId = result.insertId;
          } else {
            skillId = skillRows[0].skill_id;
          }

          // Insert into user_skills table
          await connection.execute(
            'INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES (?, ?, ?)',
            [userId, skillId, skill.proficiency || 'intermediate']
          );
        }

        await connection.commit();
        connection.release();
        return true;
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error storing user skills:', error);
      throw error;
    }
  },

  // Get user skills
  async getUserSkills(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT s.skill_name, us.proficiency_level 
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.skill_id
         WHERE us.user_id = ?`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting user skills:', error);
      throw error;
    }
  }
};

module.exports = userModel;