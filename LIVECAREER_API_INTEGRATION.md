# LiveCareer API Integration

This document provides instructions on how to set up and use the LiveCareer API integration in the ResumeAce application.

## Overview

The ResumeAce application now supports integration with the LiveCareer API for resume parsing and job matching. This integration provides more accurate and comprehensive resume analysis and job matching capabilities.

## Setup Instructions

1. **Obtain a LiveCareer API Key**
   - Sign up for a LiveCareer API account at [LiveCareer Developer Portal](https://developer.livecareer.com/)
   - Create a new API key for your application

2. **Configure the API Key**
   - Open the `.env.local` file in the root directory of the project
   - Replace `your_livecareer_api_key_here` with your actual LiveCareer API key:
     ```
     NEXT_PUBLIC_LIVECAREER_API_KEY=your_actual_api_key
     ```

3. **Restart the Application**
   - If the application is running, restart it to apply the changes

## Using the LiveCareer API Integration

The application provides a toggle switch in the Recruiter Portal to switch between the LiveCareer API and the local AI processing:

- **LiveCareer API**: Uses the LiveCareer API for resume parsing and job matching
- **Local AI**: Uses the built-in AI processing for resume parsing and job matching

The application will automatically fall back to local AI processing if the LiveCareer API fails or if the API key is not configured.

## API Endpoints Used

The integration uses the following LiveCareer API endpoints:

1. **Resume Parsing**: `/resume/parse`
   - Parses a resume file and extracts structured information

2. **Job Matching**: `/resume/match`
   - Matches a parsed resume against a job description

3. **Resume Suggestions**: `/resume/{resumeId}/suggestions`
   - Provides suggestions for improving a resume

## Troubleshooting

If you encounter issues with the LiveCareer API integration, check the following:

1. **API Key**: Ensure that your API key is correctly configured in the `.env.local` file
2. **API Limits**: Check if you have reached your API usage limits
3. **Network Issues**: Ensure that your application can connect to the LiveCareer API servers
4. **Console Errors**: Check the browser console for any error messages

If the issues persist, you can always switch to the local AI processing by toggling the switch in the Recruiter Portal.

## Support

For issues related to the LiveCareer API, please contact LiveCareer support.

For issues related to the ResumeAce application, please open an issue in the project repository.# LiveCareer API Integration

This document provides instructions on how to set up and use the LiveCareer API integration in the ResumeAce application.

## Overview

The ResumeAce application now supports integration with the LiveCareer API for resume parsing and job matching. This integration provides more accurate and comprehensive resume analysis and job matching capabilities.

## Setup Instructions

1. **Obtain a LiveCareer API Key**
   - Sign up for a LiveCareer API account at [LiveCareer Developer Portal](https://developer.livecareer.com/)
   - Create a new API key for your application

2. **Configure the API Key**
   - Open the `.env.local` file in the root directory of the project
   - Replace `your_livecareer_api_key_here` with your actual LiveCareer API key:
     ```
     NEXT_PUBLIC_LIVECAREER_API_KEY=your_actual_api_key
     ```

3. **Restart the Application**
   - If the application is running, restart it to apply the changes

## Using the LiveCareer API Integration

The application provides a toggle switch in the Recruiter Portal to switch between the LiveCareer API and the local AI processing:

- **LiveCareer API**: Uses the LiveCareer API for resume parsing and job matching
- **Local AI**: Uses the built-in AI processing for resume parsing and job matching

The application will automatically fall back to local AI processing if the LiveCareer API fails or if the API key is not configured.

## API Endpoints Used

The integration uses the following LiveCareer API endpoints:

1. **Resume Parsing**: `/resume/parse`
   - Parses a resume file and extracts structured information

2. **Job Matching**: `/resume/match`
   - Matches a parsed resume against a job description

3. **Resume Suggestions**: `/resume/{resumeId}/suggestions`
   - Provides suggestions for improving a resume

## Troubleshooting

If you encounter issues with the LiveCareer API integration, check the following:

1. **API Key**: Ensure that your API key is correctly configured in the `.env.local` file
2. **API Limits**: Check if you have reached your API usage limits
3. **Network Issues**: Ensure that your application can connect to the LiveCareer API servers
4. **Console Errors**: Check the browser console for any error messages

If the issues persist, you can always switch to the local AI processing by toggling the switch in the Recruiter Portal.

## Support

For issues related to the LiveCareer API, please contact LiveCareer support.

For issues related to the ResumeAce application, please open an issue in the project repository.