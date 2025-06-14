-- MySQL Workbench Queries for Resume Analysis
-- You can run these queries directly in MySQL Workbench

-- Connection Information:
-- Host: localhost
-- User: admin
-- Password: admin@123
-- Database: resumeace

-- =============================================
-- 1. Basic Resume Queries
-- =============================================

-- Get all resumes with basic information
SELECT 
    r.id, 
    r.title, 
    u.name as userName, 
    r.createdAt, 
    r.updatedAt, 
    r.sentimentScore
FROM Resume r
JOIN User u ON r.userId = u.id
ORDER BY r.createdAt DESC;

-- Get a specific resume with full content (replace 'resume_id_here' with actual ID)
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

-- Get all resumes for a specific user (replace 'user_id_here' with actual ID)
SELECT 
    r.id, 
    r.title, 
    r.createdAt, 
    r.updatedAt, 
    r.sentimentScore
FROM Resume r
WHERE r.userId = 'user_id_here'
ORDER BY r.createdAt DESC;

-- =============================================
-- 2. Resume Content Analysis
-- =============================================

-- Get resume skills (replace 'resume_id_here' with actual ID)
SELECT 
    r.id,
    r.title,
    JSON_EXTRACT(r.content, '$.skills') as skills
FROM Resume r
WHERE r.id = 'resume_id_here';

-- Get resume experience (replace 'resume_id_here' with actual ID)
SELECT 
    r.id,
    r.title,
    JSON_EXTRACT(r.content, '$.experience') as experience
FROM Resume r
WHERE r.id = 'resume_id_here';

-- Get resume education (replace 'resume_id_here' with actual ID)
SELECT 
    r.id,
    r.title,
    JSON_EXTRACT(r.content, '$.education') as education
FROM Resume r
WHERE r.id = 'resume_id_here';

-- Get resume personal information (replace 'resume_id_here' with actual ID)
SELECT 
    r.id,
    r.title,
    JSON_EXTRACT(r.content, '$.personalInfo') as personalInfo
FROM Resume r
WHERE r.id = 'resume_id_here';

-- Extract specific fields from resume content (replace 'resume_id_here' with actual ID)
SELECT 
    r.id,
    r.title,
    JSON_EXTRACT(r.content, '$.personalInfo.name') as name,
    JSON_EXTRACT(r.content, '$.personalInfo.email') as email,
    JSON_EXTRACT(r.content, '$.personalInfo.phone') as phone,
    JSON_EXTRACT(r.content, '$.personalInfo.address') as address,
    JSON_EXTRACT(r.content, '$.skills') as skills,
    JSON_EXTRACT(r.content, '$.experience[0].company') as latest_company,
    JSON_EXTRACT(r.content, '$.experience[0].position') as latest_position,
    JSON_EXTRACT(r.content, '$.education[0].institution') as latest_education,
    JSON_EXTRACT(r.content, '$.education[0].degree') as latest_degree
FROM Resume r
WHERE r.id = 'resume_id_here';

-- =============================================
-- 3. Resume Comparison and Analysis
-- =============================================

-- Compare multiple resumes (replace resume IDs with actual values)
SELECT 
    r.id,
    r.title,
    u.name as userName,
    JSON_EXTRACT(r.content, '$.skills') as skills,
    JSON_LENGTH(JSON_EXTRACT(r.content, '$.skills')) as skill_count,
    JSON_LENGTH(JSON_EXTRACT(r.content, '$.experience')) as experience_count,
    JSON_LENGTH(JSON_EXTRACT(r.content, '$.education')) as education_count,
    r.sentimentScore
FROM Resume r
JOIN User u ON r.userId = u.id
WHERE r.id IN ('resume_id_1', 'resume_id_2', 'resume_id_3')
ORDER BY skill_count DESC;

-- Get resumes with the most skills
SELECT 
    r.id,
    r.title,
    u.name as userName,
    JSON_EXTRACT(r.content, '$.skills') as skills,
    JSON_LENGTH(JSON_EXTRACT(r.content, '$.skills')) as skill_count
FROM Resume r
JOIN User u ON r.userId = u.id
ORDER BY skill_count DESC
LIMIT 10;

-- Get resumes with the most experience entries
SELECT 
    r.id,
    r.title,
    u.name as userName,
    JSON_EXTRACT(r.content, '$.experience') as experience,
    JSON_LENGTH(JSON_EXTRACT(r.content, '$.experience')) as experience_count
FROM Resume r
JOIN User u ON r.userId = u.id
ORDER BY experience_count DESC
LIMIT 10;

-- Get resumes with the highest sentiment scores
SELECT 
    r.id,
    r.title,
    u.name as userName,
    r.sentimentScore
FROM Resume r
JOIN User u ON r.userId = u.id
WHERE r.sentimentScore IS NOT NULL
ORDER BY r.sentimentScore DESC
LIMIT 10;

-- =============================================
-- 4. Resume Skills Analysis
-- =============================================

-- Extract all skills from all resumes (this is a complex query that may not work in all MySQL versions)
-- You may need to adjust this based on your MySQL version and data structure
SELECT 
    r.id,
    r.title,
    u.name as userName,
    JSON_EXTRACT(r.content, '$.skills') as skills
FROM Resume r
JOIN User u ON r.userId = u.id;

-- Find resumes that contain a specific skill (replace 'skill_name' with the skill you're looking for)
SELECT 
    r.id,
    r.title,
    u.name as userName,
    JSON_EXTRACT(r.content, '$.skills') as skills
FROM Resume r
JOIN User u ON r.userId = u.id
WHERE JSON_CONTAINS(LOWER(JSON_EXTRACT(r.content, '$.skills')), LOWER('"skill_name"'));

-- =============================================
-- 5. Resume Job Match Analysis
-- =============================================

-- Get all job matches for a specific resume (replace 'resume_id_here' with actual ID)
SELECT 
    jm.id,
    JSON_EXTRACT(jm.jobData, '$.title') as jobTitle,
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    JSON_EXTRACT(jm.jobData, '$.location') as location,
    jm.matchScore,
    jm.createdAt
FROM JobMatch jm
WHERE jm.resumeId = 'resume_id_here'
ORDER BY jm.matchScore DESC;

-- Get all skill gap analyses for a specific resume (replace 'resume_id_here' with actual ID)
SELECT 
    sg.id,
    sg.jobDescription,
    sg.requiredSkills,
    sg.missingSkills,
    sg.recommendations,
    sg.matchPercentage,
    sg.createdAt
FROM SkillGapAnalysis sg
WHERE sg.resumeId = 'resume_id_here'
ORDER BY sg.matchPercentage DESC;

-- Get all job applications using a specific resume (replace 'resume_id_here' with actual ID)
SELECT 
    ja.id,
    ja.jobTitle,
    ja.company,
    ja.status,
    ja.applicationDate,
    ja.notes,
    ja.nextSteps,
    ja.interviewDate
FROM JobApplication ja
WHERE ja.resumeId = 'resume_id_here'
ORDER BY ja.applicationDate DESC;

-- =============================================
-- 6. Resume Performance Analysis
-- =============================================

-- Get resume performance metrics
SELECT 
    r.id,
    r.title,
    u.name as userName,
    COUNT(DISTINCT jm.id) as job_match_count,
    AVG(jm.matchScore) as avg_match_score,
    MAX(jm.matchScore) as max_match_score,
    COUNT(DISTINCT sg.id) as skill_gap_count,
    AVG(sg.matchPercentage) as avg_skill_match,
    COUNT(DISTINCT ja.id) as job_application_count,
    COUNT(DISTINCT CASE WHEN ja.status = 'Interview' THEN ja.id END) as interview_count,
    COUNT(DISTINCT CASE WHEN ja.status = 'Offer' THEN ja.id END) as offer_count
FROM Resume r
JOIN User u ON r.userId = u.id
LEFT JOIN JobMatch jm ON r.id = jm.resumeId
LEFT JOIN SkillGapAnalysis sg ON r.id = sg.resumeId
LEFT JOIN JobApplication ja ON r.id = ja.resumeId
GROUP BY r.id, r.title, u.name
ORDER BY avg_match_score DESC;

-- Get the most successful resumes (based on job application outcomes)
SELECT 
    r.id,
    r.title,
    u.name as userName,
    COUNT(DISTINCT ja.id) as application_count,
    COUNT(DISTINCT CASE WHEN ja.status = 'Interview' THEN ja.id END) as interview_count,
    COUNT(DISTINCT CASE WHEN ja.status = 'Offer' THEN ja.id END) as offer_count,
    ROUND((COUNT(DISTINCT CASE WHEN ja.status = 'Interview' THEN ja.id END) / COUNT(DISTINCT ja.id)) * 100, 2) as interview_rate,
    ROUND((COUNT(DISTINCT CASE WHEN ja.status = 'Offer' THEN ja.id END) / COUNT(DISTINCT ja.id)) * 100, 2) as offer_rate
FROM Resume r
JOIN User u ON r.userId = u.id
JOIN JobApplication ja ON r.id = ja.resumeId
GROUP BY r.id, r.title, u.name
HAVING application_count > 0
ORDER BY offer_rate DESC, interview_rate DESC;

-- =============================================
-- 7. Direct MySQL Tables Resume Analysis
-- =============================================

-- Get all users with their skills
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.last_name,
    GROUP_CONCAT(DISTINCT s.skill_name ORDER BY us.proficiency_level DESC SEPARATOR ', ') as skills
FROM users u
LEFT JOIN user_skills us ON u.user_id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.skill_id
GROUP BY u.user_id, u.username, u.first_name, u.last_name;

-- Get users with their skill proficiency levels
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.last_name,
    s.skill_name,
    us.proficiency_level
FROM users u
JOIN user_skills us ON u.user_id = us.user_id
JOIN skills s ON us.skill_id = s.skill_id
ORDER BY u.username, us.proficiency_level DESC;

-- Get users with the most skills
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT us.skill_id) as skill_count,
    GROUP_CONCAT(DISTINCT s.skill_name SEPARATOR ', ') as skills
FROM users u
LEFT JOIN user_skills us ON u.user_id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.skill_id
GROUP BY u.user_id, u.username, u.first_name, u.last_name
ORDER BY skill_count DESC;

-- Get users with specific skills (replace skill_name with the skill you're looking for)
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.last_name,
    us.proficiency_level
FROM users u
JOIN user_skills us ON u.user_id = us.user_id
JOIN skills s ON us.skill_id = s.skill_id
WHERE s.skill_name = 'skill_name'
ORDER BY us.proficiency_level DESC;

-- Get the most common skills among users
SELECT 
    s.skill_name,
    COUNT(DISTINCT us.user_id) as user_count,
    ROUND((COUNT(DISTINCT us.user_id) / (SELECT COUNT(*) FROM users)) * 100, 2) as percentage
FROM skills s
JOIN user_skills us ON s.skill_id = us.skill_id
GROUP BY s.skill_name
ORDER BY user_count DESC;

-- Get the distribution of proficiency levels for each skill
SELECT 
    s.skill_name,
    us.proficiency_level,
    COUNT(*) as user_count
FROM skills s
JOIN user_skills us ON s.skill_id = us.skill_id
GROUP BY s.skill_name, us.proficiency_level
ORDER BY s.skill_name, 
    CASE us.proficiency_level
        WHEN 'expert' THEN 1
        WHEN 'advanced' THEN 2
        WHEN 'intermediate' THEN 3
        WHEN 'basic' THEN 4
        ELSE 5
    END;