#!/usr/bin/env node

/**
 * Screenshot Optimization Script for ResumeAce
 * 
 * This script helps optimize screenshots for the README file:
 * - Checks if all required screenshots exist
 * - Validates file sizes and formats
 * - Provides optimization suggestions
 * 
 * Usage: node scripts/optimize-screenshots.js
 */

const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const MAX_FILE_SIZE = 500 * 1024; // 500KB
const REQUIRED_SCREENSHOTS = [
  'landing-page.png',
  'dashboard.png',
  'resume-analysis.png',
  'job-recommendations.png',
  'skill-gap-analysis.png',
  'resume-builder.png',
  'recruiter-portal.png',
  'mobile-view.png'
];

const OPTIONAL_SCREENSHOTS = [
  'login-page.png',
  'signup-page.png',
  'profile-settings.png',
  'admin-dashboard.png',
  'analytics-detailed.png',
  'resume-templates.png',
  'job-search.png',
  'notifications.png'
];

function checkScreenshots() {
  console.log('🔍 Checking ResumeAce Screenshots...\n');

  // Check if screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    console.log('❌ Screenshots directory not found!');
    console.log('📁 Please create the screenshots folder and add your images.\n');
    return;
  }

  const existingFiles = fs.readdirSync(SCREENSHOTS_DIR)
    .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));

  console.log('📊 Screenshot Status Report:\n');

  // Check required screenshots
  console.log('🔥 Required Screenshots:');
  let requiredCount = 0;
  REQUIRED_SCREENSHOTS.forEach(filename => {
    const exists = existingFiles.includes(filename);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${filename}`);
    
    if (exists) {
      requiredCount++;
      checkFileSize(filename);
    }
  });

  console.log(`\n📈 Progress: ${requiredCount}/${REQUIRED_SCREENSHOTS.length} required screenshots\n`);

  // Check optional screenshots
  console.log('🚀 Optional Screenshots:');
  let optionalCount = 0;
  OPTIONAL_SCREENSHOTS.forEach(filename => {
    const exists = existingFiles.includes(filename);
    if (exists) {
      console.log(`  ✅ ${filename}`);
      optionalCount++;
      checkFileSize(filename);
    } else {
      console.log(`  ⚪ ${filename} (optional)`);
    }
  });

  if (optionalCount > 0) {
    console.log(`\n🎉 Bonus: ${optionalCount} optional screenshots added!\n`);
  }

  // Check for unexpected files
  const unexpectedFiles = existingFiles.filter(file => 
    !REQUIRED_SCREENSHOTS.includes(file) && 
    !OPTIONAL_SCREENSHOTS.includes(file) &&
    file !== 'README.md'
  );

  if (unexpectedFiles.length > 0) {
    console.log('⚠️  Unexpected files found:');
    unexpectedFiles.forEach(file => {
      console.log(`  📄 ${file}`);
    });
    console.log('');
  }

  // Provide recommendations
  provideRecommendations(requiredCount, optionalCount);
}

function checkFileSize(filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);
  
  if (stats.size > MAX_FILE_SIZE) {
    console.log(`    ⚠️  Large file: ${sizeKB}KB (consider optimizing)`);
  } else {
    console.log(`    📏 Size: ${sizeKB}KB`);
  }
}

function provideRecommendations(requiredCount, optionalCount) {
  console.log('💡 Recommendations:\n');

  if (requiredCount === 0) {
    console.log('🚨 No screenshots found! Please add screenshots to showcase your project.');
    console.log('📖 Check screenshots/README.md for detailed guidance.\n');
  } else if (requiredCount < REQUIRED_SCREENSHOTS.length) {
    const missing = REQUIRED_SCREENSHOTS.length - requiredCount;
    console.log(`📸 Add ${missing} more required screenshots to complete the showcase.`);
  } else {
    console.log('🎉 All required screenshots are present!');
  }

  if (requiredCount > 0) {
    console.log('\n🛠️  Optimization Tips:');
    console.log('  • Use PNG format for UI screenshots');
    console.log('  • Keep file sizes under 500KB');
    console.log('  • Use consistent window sizes (1920x1080 recommended)');
    console.log('  • Ensure good contrast and readability');
    console.log('  • Show realistic, professional sample data');
    console.log('  • Remove personal/sensitive information');
  }

  console.log('\n📱 Mobile Screenshot Tip:');
  console.log('  Use browser dev tools (F12 → Device Mode) to capture mobile views');

  console.log('\n🔧 Image Optimization Tools:');
  console.log('  • TinyPNG (https://tinypng.com/) - Online compression');
  console.log('  • ImageOptim (Mac) - Desktop optimization');
  console.log('  • GIMP/Photoshop - Professional editing');

  console.log('\n📚 Need help? Check screenshots/README.md for detailed guidance!');
}

// Run the check
checkScreenshots();