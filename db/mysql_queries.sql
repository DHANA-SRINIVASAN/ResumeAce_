-- MySQL Workbench Queries for ResumeAce Database
-- You can run these queries directly in MySQL Workbench

-- Connection Information:
-- Host: localhost
-- User: admin
-- Password: admin@123
-- Database: resumeace

-- =============================================
-- 1. Basic Queries - View Table Data
-- =============================================

-- View all users
SELECT * FROM `User`;

-- View all resumes (basic info)
SELECT 
    r.id, 
    r.title, 
    u.name as userName, 
    r.createdAt, 
    r.updatedAt, 
    r.sentimentScore
FROM Resume r
JOIN User u ON r.userId = u.id;

-- View all job matches (basic info)
SELECT 
    jm.id, 
    r.title as resumeTitle, 
    u.name as userName, 
    JSON_EXTRACT(jm.jobData, '$.title') as jobTitle,
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    jm.matchScore, 
    jm.createdAt
FROM JobMatch jm
JOIN Resume r ON jm.resumeId = r.id
JOIN User u ON r.userId = u.id;

-- View all skill gap analyses (basic info)
SELECT 
    sg.id, 
    r.title as resumeTitle, 
    u.name as userName,
    sg.jobDescription, 
    sg.matchPercentage, 
    sg.createdAt
FROM SkillGapAnalysis sg
JOIN Resume r ON sg.resumeId = r.id
JOIN User u ON r.userId = u.id;

-- View all job applications
SELECT 
    ja.id, 
    u.name as userName, 
    r.title as resumeTitle,
    ja.jobTitle, 
    ja.company, 
    ja.status, 
    ja.applicationDate,
    ja.notes, 
    ja.nextSteps, 
    ja.interviewDate
FROM JobApplication ja
JOIN User u ON ja.userId = u.id
JOIN Resume r ON ja.resumeId = r.id;

-- =============================================
-- 2. Detailed Queries - View Specific Data
-- =============================================

-- View resume content (replace 'resume_id_here' with actual ID)
SELECT 
    r.id, 
    r.title, 
    u.name as userName, 
    r.content, 
    r.createdAt, 
    r.updatedAt, 
    r.sentimentScore
FROM Resume r
JOIN User u ON r.userId = u.id
WHERE r.id = 'resume_id_here';

-- View job match details (replace 'job_match_id_here' with actual ID)
SELECT 
    jm.id, 
    r.title as resumeTitle, 
    u.name as userName,
    jm.jobData, 
    jm.matchScore, 
    jm.createdAt
FROM JobMatch jm
JOIN Resume r ON jm.resumeId = r.id
JOIN User u ON r.userId = u.id
WHERE jm.id = 'job_match_id_here';

-- View skill gap analysis details (replace 'skill_gap_id_here' with actual ID)
SELECT 
    sg.id, 
    r.title as resumeTitle, 
    u.name as userName,
    sg.jobDescription, 
    sg.requiredSkills, 
    sg.missingSkills,
    sg.recommendations, 
    sg.matchPercentage, 
    sg.createdAt
FROM SkillGapAnalysis sg
JOIN Resume r ON sg.resumeId = r.id
JOIN User u ON r.userId = u.id
WHERE sg.id = 'skill_gap_id_here';

-- =============================================
-- 3. Direct MySQL Tables Queries
-- =============================================

-- View all users (direct MySQL)
SELECT * FROM users;

-- View all skills (direct MySQL)
SELECT * FROM skills;

-- View user skills with names (direct MySQL)
SELECT 
    u.username, 
    u.first_name, 
    u.last_name, 
    s.skill_name, 
    us.proficiency_level
FROM user_skills us
JOIN users u ON us.user_id = u.user_id
JOIN skills s ON us.skill_id = s.skill_id
ORDER BY u.username, us.proficiency_level DESC;

-- View job listings with skills (direct MySQL)
SELECT 
    j.title, 
    j.company, 
    j.location, 
    s.skill_name, 
    js.importance_level
FROM job_skills js
JOIN job_listings j ON js.job_id = j.job_id
JOIN skills s ON js.skill_id = s.skill_id
ORDER BY j.title, js.importance_level;

-- View job matches with user and job details (direct MySQL)
SELECT 
    u.username, 
    u.first_name, 
    u.last_name, 
    j.title, 
    j.company, 
    jm.match_score
FROM job_matches jm
JOIN users u ON jm.user_id = u.user_id
JOIN job_listings j ON jm.job_id = j.job_id
ORDER BY jm.match_score DESC;

-- =============================================
-- 4. Advanced Analysis Queries
-- =============================================

-- Get resume skills (replace 'resume_id_here' with actual ID)
SELECT 
    JSON_EXTRACT(content, '$.skills') as skills
FROM Resume
WHERE id = 'resume_id_here';

-- Get resume experience (replace 'resume_id_here' with actual ID)
SELECT 
    JSON_EXTRACT(content, '$.experience') as experience
FROM Resume
WHERE id = 'resume_id_here';

-- Get resume education (replace 'resume_id_here' with actual ID)
SELECT 
    JSON_EXTRACT(content, '$.education') as education
FROM Resume
WHERE id = 'resume_id_here';

-- Get job match statistics
SELECT 
    COUNT(*) as total_matches,
    AVG(matchScore) as average_score,
    MIN(matchScore) as min_score,
    MAX(matchScore) as max_score
FROM JobMatch;

-- Get job match score distribution
SELECT 
    CASE 
        WHEN matchScore >= 90 THEN '90-100'
        WHEN matchScore >= 80 THEN '80-89'
        WHEN matchScore >= 70 THEN '70-79'
        WHEN matchScore >= 60 THEN '60-69'
        WHEN matchScore >= 50 THEN '50-59'
        ELSE 'Below 50'
    END as score_range,
    COUNT(*) as count
FROM JobMatch
GROUP BY score_range
ORDER BY 
    CASE score_range
        WHEN '90-100' THEN 1
        WHEN '80-89' THEN 2
        WHEN '70-79' THEN 3
        WHEN '60-69' THEN 4
        WHEN '50-59' THEN 5
        ELSE 6
    END;

-- Get top companies from job matches
SELECT 
    JSON_EXTRACT(jobData, '$.company') as company,
    COUNT(*) as count
FROM JobMatch
GROUP BY company
ORDER BY count DESC
LIMIT 10;

-- Get top job titles from job matches
SELECT 
    JSON_EXTRACT(jobData, '$.title') as title,
    COUNT(*) as count
FROM JobMatch
GROUP BY title
ORDER BY count DESC
LIMIT 10;

-- Get top 5 highest scoring job matches
SELECT 
    jm.id,
    JSON_EXTRACT(jm.jobData, '$.title') as jobTitle,
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    jm.matchScore,
    r.title as resumeTitle,
    u.name as userName
FROM JobMatch jm
JOIN Resume r ON jm.resumeId = r.id
JOIN User u ON r.userId = u.id
ORDER BY jm.matchScore DESC
LIMIT 5;

-- Get job application status summary
SELECT 
    status,
    COUNT(*) as count
FROM JobApplication
GROUP BY status
ORDER BY count DESC;

-- Get job applications by user (replace 'user_id_here' with actual ID)
SELECT 
    ja.jobTitle,
    ja.company,
    ja.status,
    ja.applicationDate,
    r.title as resumeTitle
FROM JobApplication ja
JOIN Resume r ON ja.resumeId = r.id
WHERE ja.userId = 'user_id_here'
ORDER BY ja.applicationDate DESC;

-- =============================================
-- 5. Useful Joins and Complex Queries
-- =============================================

-- Get users with their resume count
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(r.id) as resume_count
FROM User u
LEFT JOIN Resume r ON u.id = r.userId
GROUP BY u.id, u.name, u.email;

-- Get resumes with their job match count
SELECT 
    r.id,
    r.title,
    u.name as userName,
    COUNT(jm.id) as job_match_count,
    AVG(jm.matchScore) as average_match_score
FROM Resume r
JOIN User u ON r.userId = u.id
LEFT JOIN JobMatch jm ON r.id = jm.resumeId
GROUP BY r.id, r.title, u.name;

-- Get resumes with their skill gap analysis count
SELECT 
    r.id,
    r.title,
    u.name as userName,
    COUNT(sg.id) as skill_gap_count,
    AVG(sg.matchPercentage) as average_match_percentage
FROM Resume r
JOIN User u ON r.userId = u.id
LEFT JOIN SkillGapAnalysis sg ON r.id = sg.resumeId
GROUP BY r.id, r.title, u.name;

-- Get users with their job application count and status summary
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(ja.id) as application_count,
    SUM(CASE WHEN ja.status = 'Applied' THEN 1 ELSE 0 END) as applied,
    SUM(CASE WHEN ja.status = 'Interview' THEN 1 ELSE 0 END) as interview,
    SUM(CASE WHEN ja.status = 'Offer' THEN 1 ELSE 0 END) as offer,
    SUM(CASE WHEN ja.status = 'Rejected' THEN 1 ELSE 0 END) as rejected
FROM User u
LEFT JOIN JobApplication ja ON u.id = ja.userId
GROUP BY u.id, u.name, u.email;

-- Get all data for a specific user (replace 'user_id_here' with actual ID)
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    r.id as resume_id,
    r.title as resume_title,
    jm.id as job_match_id,
    JSON_EXTRACT(jm.jobData, '$.title') as job_title,
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    jm.matchScore,
    sg.id as skill_gap_id,
    sg.jobDescription,
    sg.matchPercentage,
    ja.id as job_application_id,
    ja.jobTitle as application_job_title,
    ja.company as application_company,
    ja.status as application_status
FROM User u
LEFT JOIN Resume r ON u.id = r.userId
LEFT JOIN JobMatch jm ON r.id = jm.resumeId
LEFT JOIN SkillGapAnalysis sg ON r.id = sg.resumeId
LEFT JOIN JobApplication ja ON u.id = ja.userId
WHERE u.id = 'user_id_here';

-- =============================================
-- 6. Direct MySQL Tables Complex Queries
-- =============================================

-- Get users with their skills count and proficiency levels
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.last_name,
    COUNT(us.skill_id) as skill_count,
    GROUP_CONCAT(s.skill_name ORDER BY us.proficiency_level DESC SEPARATOR ', ') as skills
FROM users u
LEFT JOIN user_skills us ON u.user_id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.skill_id
GROUP BY u.user_id, u.username, u.first_name, u.last_name;

-- Get job listings with their required skills
SELECT 
    j.job_id,
    j.title,
    j.company,
    j.location,
    COUNT(js.skill_id) as skill_count,
    GROUP_CONCAT(s.skill_name ORDER BY js.importance_level SEPARATOR ', ') as required_skills
FROM job_listings j
LEFT JOIN job_skills js ON j.job_id = js.job_id
LEFT JOIN skills s ON js.skill_id = s.skill_id
GROUP BY j.job_id, j.title, j.company, j.location;

-- Get skills with their usage count in resumes and job listings
SELECT 
    s.skill_id,
    s.skill_name,
    COUNT(DISTINCT us.user_id) as users_count,
    COUNT(DISTINCT js.job_id) as jobs_count
FROM skills s
LEFT JOIN user_skills us ON s.skill_id = us.skill_id
LEFT JOIN job_skills js ON s.skill_id = js.skill_id
GROUP BY s.skill_id, s.skill_name
ORDER BY users_count DESC, jobs_count DESC;

-- Get job match details with user and job information
SELECT 
    jm.match_id,
    u.username,
    u.first_name,
    u.last_name,
    j.title as job_title,
    j.company,
    j.location,
    jm.match_score,
    jm.match_date,
    COUNT(js.skill_id) as job_skill_count,
    COUNT(us.skill_id) as user_skill_count,
    COUNT(CASE WHEN us.skill_id = js.skill_id THEN 1 END) as matching_skill_count
FROM job_matches jm
JOIN users u ON jm.user_id = u.user_id
JOIN job_listings j ON jm.job_id = j.job_id
LEFT JOIN job_skills js ON j.job_id = js.job_id
LEFT JOIN user_skills us ON u.user_id = us.user_id
GROUP BY jm.match_id, u.username, u.first_name, u.last_name, j.title, j.company, j.location, jm.match_score, jm.match_date
ORDER BY jm.match_score DESC;

-- =============================================
-- 7. Useful Utility Queries
-- =============================================

-- Get database size
SELECT 
    table_schema as database_name,
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb
FROM information_schema.tables
WHERE table_schema = 'resumeace'
GROUP BY table_schema;

-- Get table row counts
SELECT 
    table_name,
    table_rows
FROM information_schema.tables
WHERE table_schema = 'resumeace'
ORDER BY table_rows DESC;

-- Get foreign key constraints
SELECT 
    table_name,
    column_name,
    constraint_name,
    referenced_table_name,
    referenced_column_name
FROM information_schema.key_column_usage
WHERE 
    table_schema = 'resumeace' AND
    referenced_table_name IS NOT NULL;

-- Get table structure
SHOW TABLES;
-- Then for each table:
-- DESCRIBE table_name;