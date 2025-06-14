const { pool } = require('./connection');

// Job operations
const jobModel = {
    // Create a new job listing
    async createJobListing(jobData) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO job_listings 
         (title, company, location, description, requirements, salary_range, job_type, posted_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    jobData.title,
                    jobData.company,
                    jobData.location,
                    jobData.description,
                    jobData.requirements,
                    jobData.salaryRange,
                    jobData.jobType,
                    jobData.postedDate || new Date()
                ]
            );
            return { id: result.insertId, ...jobData };
        } catch (error) {
            console.error('Error creating job listing:', error);
            throw error;
        }
    },

    // Get job by ID
    async getJobById(jobId) {
        try {
            const [rows] = await pool.execute('SELECT * FROM job_listings WHERE job_id = ?', [jobId]);
            return rows[0];
        } catch (error) {
            console.error('Error getting job by ID:', error);
            throw error;
        }
    },

    // Get all jobs
    async getAllJobs() {
        try {
            const [rows] = await pool.execute('SELECT * FROM job_listings ORDER BY posted_date DESC');
            return rows;
        } catch (error) {
            console.error('Error getting all jobs:', error);
            throw error;
        }
    },

    // Store job skills
    async storeJobSkills(jobId, skills) {
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

                    // Insert into job_skills table
                    await connection.execute(
                        'INSERT INTO job_skills (job_id, skill_id, importance_level) VALUES (?, ?, ?)',
                        [jobId, skillId, skill.importance || 'required']
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
            console.error('Error storing job skills:', error);
            throw error;
        }
    },

    // Get job skills
    async getJobSkills(jobId) {
        try {
            const [rows] = await pool.execute(
                `SELECT s.skill_name, js.importance_level 
         FROM job_skills js
         JOIN skills s ON js.skill_id = s.skill_id
         WHERE js.job_id = ?`,
                [jobId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting job skills:', error);
            throw error;
        }
    }
};

module.exports = jobModel;