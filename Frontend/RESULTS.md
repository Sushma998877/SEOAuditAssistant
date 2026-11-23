# Project Results – AI Marketing Intelligence Assistant

## 1. Overview

The AI Marketing Intelligence Assistant was tested to verify website crawling, SEO metric extraction, broken internal link detection, score calculation, and AI-generated recommendations.

The application was tested using multiple website URLs through the React frontend.

## 2. Website Testing

The following websites were used for testing:

| Website | Purpose | Result |
|---|---|---|
| https://example.com | Basic website testing | Successful |
| https://www.python.org | Content-rich website testing | Successful |
| https://www.w3schools.com | Larger website testing | Successful |

The application successfully returned SEO audit results for the tested websites.

## 3. SEO Metrics Tested

The application was tested for the following five SEO metrics:

| Metric | Expected Behaviour | Result |
|---|---|---|
| Title and Meta Description | Check presence and character length | Working |
| Broken Internal Links | Identify HTTP 4xx and 5xx links | Working |
| H1 Heading | Check H1 presence | Working |
| Canonical Tag | Check canonical URL presence | Working |
| Structured Data | Check valid JSON-LD | Working |

## 4. Overall SEO Score

The application calculates an SEO score out of 100.

Each of the five metrics contributes a maximum of 20 points.

The score is calculated by the backend based on the crawler results. Gemini AI does not calculate or modify the score.

## 5. AI Recommendations

Google Gemini API was integrated successfully.

The AI receives the SEO audit findings and generates prioritized recommendations to help improve website SEO.

The recommendations are displayed along with the audit results in the React application.

## 6. Automated Testing Results

The project uses xUnit for automated testing.

| Test Area | Result |
|---|---|
| Valid website URL | Passed |
| Invalid website URL | Passed |
| SEO information extraction | Passed |
| Missing SEO tags | Passed |
| Invalid JSON-LD | Passed |
| Internal link extraction | Passed |
| SEO score calculation | Passed |
| Empty page scenario | Passed |
| Additional template test | Passed |

**Total tests:** 9

**Passed:** 9

**Failed:** 0

## 7. Performance Improvements

The crawler was updated to improve performance:

- Limited crawling to 10 pages.
- Limited internal link checks to 20 unique links.
- Added concurrent HTTP requests, with a maximum of 5 at a time.
- Avoided checking duplicate links.

After these changes, the application successfully returned results for the tested websites.

## 8. Conclusion

The application successfully crawls websites, extracts the selected SEO metrics, calculates an overall SEO score, and generates AI-based recommendations.

The React frontend and ASP.NET Core backend are connected successfully, and all 9 automated tests passed.