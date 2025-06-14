-- =============================================
-- ResumeAce Complete MySQL Script
-- =============================================
-- This script contains comprehensive queries for the ResumeAce database
-- You can run these queries directly in MySQL Workbench

-- Connection Information:
-- Host: localhost
-- User: admin
-- Password: admin@123
-- Database: resumeace

-- =============================================
-- PART 1: BASIC TABLE QUERIES
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
-- PART 2: DETAILED RESUME QUERIES
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
-- PART 3: JOB MATCH QUERIES
-- =============================================

-- Get all job matches with details
SELECT 
    jm.id, 
    r.title as resumeTitle, 
    u.name as userName, 
    JSON_EXTRACT(jm.jobData, '$.title') as jobTitle,
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    JSON_EXTRACT(jm.jobData, '$.location') as location,
    JSON_EXTRACT(jm.jobData, '$.salary') as salary,
    jm.matchScore, 
    jm.createdAt
FROM JobMatch jm
JOIN Resume r ON jm.resumeId = r.id
JOIN User u ON r.userId = u.id
ORDER BY jm.matchScore DESC;

-- Get job matches for a specific user (replace 'user_id_here' with actual ID)
SELECT 
    jm.id, 
    r.title as resumeTitle, 
    JSON_EXTRACT(jm.jobData, '$.title') as jobTitle,
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    JSON_EXTRACT(jm.jobData, '$.location') as location,
    JSON_EXTRACT(jm.jobData, '$.salary') as salary,
    jm.matchScore, 
    jm.createdAt
FROM JobMatch jm
JOIN Resume r ON jm.resumeId = r.id
WHERE r.userId = 'user_id_here'
ORDER BY jm.matchScore DESC;

-- Get job matches for a specific resume (replace 'resume_id_here' with actual ID)
SELECT 
    jm.id, 
    JSON_EXTRACT(jm.jobData, '$.title') as jobTitle,
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    JSON_EXTRACT(jm.jobData, '$.location') as location,
    JSON_EXTRACT(jm.jobData, '$.salary') as salary,
    JSON_EXTRACT(jm.jobData, '$.description') as description,
    JSON_EXTRACT(jm.jobData, '$.requirements') as requirements,
    jm.matchScore, 
    jm.createdAt
FROM JobMatch jm
WHERE jm.resumeId = 'resume_id_here'
ORDER BY jm.matchScore DESC;

-- Get top 10 job matches across all users
SELECT 
    jm.id, 
    r.title as resumeTitle, 
    u.name as userName, 
    JSON_EXTRACT(jm.jobData, '$.title') as jobTitle,
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    jm.matchScore
FROM JobMatch jm
JOIN Resume r ON jm.resumeId = r.id
JOIN User u ON r.userId = u.id
ORDER BY jm.matchScore DESC
LIMIT 10;

-- Get job matches by company
SELECT 
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    COUNT(*) as match_count,
    AVG(jm.matchScore) as avg_match_score,
    MAX(jm.matchScore) as max_match_score
FROM JobMatch jm
GROUP BY company
ORDER BY match_count DESC;

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

-- =============================================
-- PART 4: SKILL GAP ANALYSIS QUERIES
-- =============================================

-- Get all skill gap analyses with details
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
ORDER BY sg.matchPercentage DESC;

-- Get skill gap analyses for a specific user (replace 'user_id_here' with actual ID)
SELECT 
    sg.id, 
    r.title as resumeTitle, 
    sg.jobDescription, 
    sg.requiredSkills, 
    sg.missingSkills,
    sg.recommendations, 
    sg.matchPercentage, 
    sg.createdAt
FROM SkillGapAnalysis sg
JOIN Resume r ON sg.resumeId = r.id
WHERE r.userId = 'user_id_here'
ORDER BY sg.matchPercentage DESC;

-- Get skill gap analyses for a specific resume (replace 'resume_id_here' with actual ID)
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

-- Get most common missing skills across all skill gap analyses
SELECT 
    sg.id,
    JSON_EXTRACT(sg.missingSkills, '$[0]') as skill1,
    JSON_EXTRACT(sg.missingSkills, '$[1]') as skill2,
    JSON_EXTRACT(sg.missingSkills, '$[2]') as skill3,
    JSON_EXTRACT(sg.missingSkills, '$[3]') as skill4,
    JSON_EXTRACT(sg.missingSkills, '$[4]') as skill5
FROM SkillGapAnalysis sg;

-- Get most common recommendations across all skill gap analyses
SELECT 
    sg.id,
    JSON_EXTRACT(sg.recommendations, '$[0]') as rec1,
    JSON_EXTRACT(sg.recommendations, '$[1]') as rec2,
    JSON_EXTRACT(sg.recommendations, '$[2]') as rec3,
    JSON_EXTRACT(sg.recommendations, '$[3]') as rec4,
    JSON_EXTRACT(sg.recommendations, '$[4]') as rec5
FROM SkillGapAnalysis sg;

-- =============================================
-- PART 5: JOB APPLICATION QUERIES
-- =============================================

-- Get all job applications with details
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
    ja.interviewDate,
    jm.matchScore
FROM JobApplication ja
JOIN User u ON ja.userId = u.id
JOIN Resume r ON ja.resumeId = r.id
LEFT JOIN JobMatch jm ON ja.jobMatchId = jm.id
ORDER BY ja.applicationDate DESC;

-- Get job applications for a specific user (replace 'user_id_here' with actual ID)
SELECT 
    ja.id, 
    r.title as resumeTitle,
    ja.jobTitle, 
    ja.company, 
    ja.status, 
    ja.applicationDate,
    ja.notes, 
    ja.nextSteps, 
    ja.interviewDate
FROM JobApplication ja
JOIN Resume r ON ja.resumeId = r.id
WHERE ja.userId = 'user_id_here'
ORDER BY ja.applicationDate DESC;

-- Get job applications by status
SELECT 
    ja.status,
    COUNT(*) as count,
    MIN(ja.applicationDate) as earliest_application,
    MAX(ja.applicationDate) as latest_application
FROM JobApplication ja
GROUP BY ja.status
ORDER BY count DESC;

-- Get job applications by company
SELECT 
    ja.company,
    COUNT(*) as application_count,
    COUNT(DISTINCT ja.userId) as user_count,
    MIN(ja.applicationDate) as earliest_application,
    MAX(ja.applicationDate) as latest_application
FROM JobApplication ja
GROUP BY ja.company
ORDER BY application_count DESC;

-- =============================================
-- PART 6: COMBINED ANALYSIS QUERIES
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

-- Get a user's resume skills and compare with job requirements (replace IDs with actual values)
SELECT 
    u.name as user_name,
    r.title as resume_title,
    JSON_EXTRACT(r.content, '$.skills') as resume_skills,
    JSON_EXTRACT(jm.jobData, '$.title') as job_title,
    JSON_EXTRACT(jm.jobData, '$.company') as company,
    JSON_EXTRACT(jm.jobData, '$.requirements') as job_requirements,
    jm.matchScore as match_score,
    sg.missingSkills as missing_skills,
    sg.recommendations as recommendations
FROM User u
JOIN Resume r ON u.id = r.userId
JOIN JobMatch jm ON r.id = jm.resumeId
LEFT JOIN SkillGapAnalysis sg ON r.id = sg.resumeId
WHERE u.id = 'user_id_here' -- Replace with actual user_id
AND jm.id = 'job_match_id_here' -- Replace with actual job_match_id
AND sg.id = 'skill_gap_id_here'; -- Replace with actual skill_gap_id

-- Get a comprehensive job application history with match scores and skill gaps
SELECT 
    u.name as user_name,
    ja.jobTitle,
    ja.company,
    ja.status,
    ja.applicationDate,
    r.title as resume_used,
    jm.matchScore as match_score,
    sg.matchPercentage as skill_match_percentage,
    sg.missingSkills as missing_skills,
    sg.recommendations as recommendations
FROM JobApplication ja
JOIN User u ON ja.userId = u.id
JOIN Resume r ON ja.resumeId = r.id
LEFT JOIN JobMatch jm ON ja.jobMatchId = jm.id
LEFT JOIN SkillGapAnalysis sg ON r.id = sg.resumeId
WHERE u.id = 'user_id_here' -- Replace with actual user_id
ORDER BY ja.applicationDate DESC;

-- =============================================
-- PART 7: DIRECT MYSQL TABLES QUERIES
-- =============================================

-- These queries are for direct MySQL tables if your database uses them
-- You may need to adjust table and column names based on your actual schema

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

-- =============================================
-- PART 8: UTILITY QUERIES
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