const { pool } = require('./connection');

// Job matching operations
const matchModel = {
  // Create a job match
  async createJobMatch(userId, jobId, matchScore) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO job_matches (user_id, job_id, match_score) VALUES (?, ?, ?)',
        [userId, jobId, matchScore]
      );
      return { id: result.insertId, userId, jobId, matchScore };
    } catch (error) {
      console.error('Error creating job match:', error);
      throw error;
    }
  },

  // Get matches for a user
  async getUserMatches(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT m.match_id, m.job_id, m.match_score, m.match_date,
                j.title, j.company, j.location, j.job_type, j.salary_range
         FROM job_matches m
         JOIN job_listings j ON m.job_id = j.job_id
         WHERE m.user_id = ?
         ORDER BY m.match_score DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting user matches:', error);
      throw error;
    }
  },

  // Calculate match score between user and job
  async calculateMatchScore(userId, jobId) {
    try {
      // Get user skills
      const [userSkills] = await pool.execute(
        `SELECT s.skill_name, us.proficiency_level 
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.skill_id
         WHERE us.user_id = ?`,
        [userId]
      );

      // Get job skills
      const [jobSkills] = await pool.execute(
        `SELECT s.skill_name, js.importance_level 
         FROM job_skills js
         JOIN skills s ON js.skill_id = s.skill_id
         WHERE js.job_id = ?`,
        [jobId]
      );

      if (jobSkills.length === 0) {
        return 0; // No skills required for the job
      }

      // Convert to maps for easier lookup
      const userSkillMap = new Map();
      userSkills.forEach(skill => {
        userSkillMap.set(skill.skill_name.toLowerCase(), skill.proficiency_level);
      });

      // Calculate match score
      let matchPoints = 0;
      let totalPoints = 0;

      jobSkills.forEach(skill => {
        const skillName = skill.skill_name.toLowerCase();
        const importance = skill.importance_level;
        
        // Assign weight based on importance
        let weight = 1;
        if (importance === 'required') weight = 3;
        else if (importance === 'preferred') weight = 2;
        
        totalPoints += weight;
        
        // Check if user has the skill
        if (userSkillMap.has(skillName)) {
          const proficiency = userSkillMap.get(skillName);
          
          // Assign points based on proficiency
          let proficiencyMultiplier = 0.5; // basic
          if (proficiency === 'intermediate') proficiencyMultiplier = 0.75;
          else if (proficiency === 'advanced' || proficiency === 'expert') proficiencyMultiplier = 1;
          
          matchPoints += weight * proficiencyMultiplier;
        }
      });

      // Calculate percentage match
      const matchScore = totalPoints > 0 ? (matchPoints / totalPoints) * 100 : 0;
      
      // Round to 2 decimal places
      return Math.round(matchScore * 100) / 100;
    } catch (error) {
      console.error('Error calculating match score:', error);
      throw error;
    }
  },

  // Find and store matches for a user with all available jobs
  async findAndStoreMatches(userId) {
    try {
      // Get all jobs
      const [jobs] = await pool.execute('SELECT job_id FROM job_listings');
      
      // Calculate and store match for each job
      const matches = [];
      for (const job of jobs) {
        const matchScore = await this.calculateMatchScore(userId, job.job_id);
        
        // Store match in database
        await this.createJobMatch(userId, job.job_id, matchScore);
        
        matches.push({
          jobId: job.job_id,
          matchScore
        });
      }
      
      return matches;
    } catch (error) {
      console.error('Error finding and storing matches:', error);
      throw error;
    }
  }
};

module.exports = matchModel;