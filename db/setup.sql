-- Create tables for direct MySQL connection

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  resume_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  skill_id INT AUTO_INCREMENT PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
  user_skill_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency_level ENUM('basic', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, skill_id)
);

-- Job listings table
CREATE TABLE IF NOT EXISTS job_listings (
  job_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  company VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  description TEXT,
  requirements TEXT,
  salary_range VARCHAR(50),
  job_type ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship') DEFAULT 'full-time',
  posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Job skills table
CREATE TABLE IF NOT EXISTS job_skills (
  job_skill_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  skill_id INT NOT NULL,
  importance_level ENUM('nice-to-have', 'preferred', 'required') DEFAULT 'required',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES job_listings(job_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
  UNIQUE KEY (job_id, skill_id)
);

-- Job matches table
CREATE TABLE IF NOT EXISTS job_matches (
  match_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id INT NOT NULL,
  match_score DECIMAL(5,2) DEFAULT 0,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES job_listings(job_id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, job_id)
);