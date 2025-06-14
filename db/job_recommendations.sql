-- MySQL Workbench Queries for Job Recommendations and Matches
-- You can run these queries directly in MySQL Workbench

-- Connection Information:
-- Host: localhost
-- User: admin
-- Password: admin@123
-- Database: resumeace

-- =============================================
-- 1. Job Match Queries
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

-- Get job matches by job title
SELECT 
    JSON_EXTRACT(jm.jobData, '$.title') as jobTitle,
    COUNT(*) as match_count,
    AVG(jm.matchScore) as avg_match_score,
    MAX(jm.matchScore) as max_match_score
FROM JobMatch jm
GROUP BY jobTitle
ORDER BY match_count DESC;

-- =============================================
-- 2. Skill Gap Analysis Queries
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
-- 3. Job Application Queries
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

-- Get job applications by job title
SELECT 
    ja.jobTitle,
    COUNT(*) as application_count,
    COUNT(DISTINCT ja.userId) as user_count,
    MIN(ja.applicationDate) as earliest_application,
    MAX(ja.applicationDate) as latest_application
FROM JobApplication ja
GROUP BY ja.jobTitle
ORDER BY application_count DESC;

-- =============================================
-- 4. Direct MySQL Tables Job Recommendation Queries
-- =============================================

-- Get all job matches with user and job details
SELECT 
    jm.match_id,
    u.username,
    u.first_name,
    u.last_name,
    j.title as job_title,
    j.company,
    j.location,
    j.salary_range,
    jm.match_score,
    jm.match_date
FROM job_matches jm
JOIN users u ON jm.user_id = u.user_id
JOIN job_listings j ON jm.job_id = j.job_id
ORDER BY jm.match_score DESC;

-- Get job matches for a specific user (replace user_id with actual ID)
SELECT 
    jm.match_id,
    j.title as job_title,
    j.company,
    j.location,
    j.salary_range,
    j.description,
    j.requirements,
    jm.match_score,
    jm.match_date
FROM job_matches jm
JOIN job_listings j ON jm.job_id = j.job_id
WHERE jm.user_id = 1 -- Replace with actual user_id
ORDER BY jm.match_score DESC;

-- Get job listings with their required skills
SELECT 
    j.job_id,
    j.title,
    j.company,
    j.location,
    j.salary_range,
    s.skill_name,
    js.importance_level
FROM job_listings j
JOIN job_skills js ON j.job_id = js.job_id
JOIN skills s ON js.skill_id = s.skill_id
ORDER BY j.job_id, js.importance_level;

-- Get job listings that match a user's skills (replace user_id with actual ID)
SELECT 
    j.job_id,
    j.title,
    j.company,
    j.location,
    j.salary_range,
    COUNT(DISTINCT js.skill_id) as total_required_skills,
    COUNT(DISTINCT CASE WHEN us.skill_id IS NOT NULL THEN js.skill_id END) as matching_skills,
    ROUND((COUNT(DISTINCT CASE WHEN us.skill_id IS NOT NULL THEN js.skill_id END) / COUNT(DISTINCT js.skill_id)) * 100, 2) as match_percentage
FROM job_listings j
JOIN job_skills js ON j.job_id = js.job_id
LEFT JOIN user_skills us ON js.skill_id = us.skill_id AND us.user_id = 1 -- Replace with actual user_id
GROUP BY j.job_id, j.title, j.company, j.location, j.salary_range
HAVING match_percentage > 0
ORDER BY match_percentage DESC;

-- Get skills that a user is missing for a specific job (replace user_id and job_id with actual IDs)
SELECT 
    j.job_id,
    j.title,
    j.company,
    s.skill_name,
    js.importance_level
FROM job_skills js
JOIN job_listings j ON js.job_id = js.job_id
JOIN skills s ON js.skill_id = s.skill_id
LEFT JOIN user_skills us ON js.skill_id = us.skill_id AND us.user_id = 1 -- Replace with actual user_id
WHERE j.job_id = 1 -- Replace with actual job_id
AND us.skill_id IS NULL
ORDER BY 
    CASE js.importance_level
        WHEN 'required' THEN 1
        WHEN 'preferred' THEN 2
        WHEN 'nice-to-have' THEN 3
        ELSE 4
    END;

-- =============================================
-- 5. Combined Queries for Comprehensive Analysis
-- =============================================

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