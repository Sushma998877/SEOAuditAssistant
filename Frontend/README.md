# AI Marketing Intelligence Assistant

## 1. Project Overview

The AI Marketing Intelligence Assistant is a web-based application that helps marketing managers analyze the SEO performance of a website.

Users can enter a website URL, and the application crawls its pages to identify common SEO issues. It checks five SEO metrics, calculates an overall SEO score, and uses Google Gemini AI to provide simple and prioritized recommendations for improving website performance.

## 2. Features

- Accepts a website URL for SEO auditing.
- Crawls up to 10 pages from the same website.
- Checks title tags and meta descriptions.
- Identifies broken internal links.
- Checks H1 heading presence.
- Checks canonical tags.
- Checks JSON-LD structured data.
- Calculates an overall SEO score out of 100.
- Generates AI-based SEO improvement recommendations.
- Displays audit results through a React web interface.
- Provides clear error messages for invalid or unreachable websites.

## 3. Technologies Used

### Backend
- C#
- ASP.NET Core Web API (.NET 10)
- HttpClient
- HtmlAgilityPack

### Frontend
- React
- Vite
- JavaScript
- CSS

### AI Integration
- Google Gemini API

### Testing
- xUnit

## 4. SEO Metrics

The application evaluates five SEO metrics:

1. **Title and Meta Description:** Checks whether title tags contain 30–60 characters and meta descriptions contain 70–160 characters.
2. **Broken Internal Links:** Identifies internal links that return HTTP 4xx or 5xx responses.
3. **H1 Heading:** Checks whether each crawled page contains an H1 heading.
4. **Canonical Tag:** Checks whether each crawled page contains a canonical URL.
5. **Structured Data:** Checks for valid JSON-LD structured data.

Each metric contributes up to 20 points to the overall SEO score.

## 5. Project Structure

```text
SEOAuditAssistant/
│
├── SEOAudit.API/
│   ├── Controllers/
│   ├── Models/
│   └── Services/
│
├── SEOAudit.API.Tests/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── README.md
├── RESULTS.md
├── DECISIONS.md
└── AI_USAGE.md
```

## 6. How to Run the Project

### Backend Setup

1. Open the `SEOAuditAssistant` solution in Visual Studio.
2. Restore the required NuGet packages.
3. Configure the Gemini API key using Visual Studio User Secrets.
4. Run the `SEOAudit.API` project.
5. The API will start on the configured local HTTPS address.

### Frontend Setup

1. Open the `frontend` folder in VS Code.
2. Open the terminal.
3. Install the required packages:

```bash
npm install
```

4. Configure the backend URL in the frontend `.env` file:

```text
VITE_API_URL=https://localhost:7290
```

5. Start the frontend:

```bash
npm run dev
```

6. Open the local URL displayed in the terminal.

## 7. API Endpoint

**Method:** POST

**Endpoint:**

```text
/api/SEOAudit/audit
```

**Request Body:**

```json
{
  "websiteUrl": "https://example.com"
}
```

The API returns structured JSON containing crawled page details, SEO metrics, broken links, the overall score, and AI recommendations.

## 8. Automated Testing

The project uses xUnit for automated testing.

The test cases cover:
- Valid and invalid website URLs.
- Extraction of SEO information.
- Missing SEO tags.
- Invalid structured data.
- Internal link identification.
- Overall SEO score calculation.
- Empty-page scenarios.

**Current test result:** 9 tests passed.

## 9. Limitations

- The crawler processes a maximum of 10 pages.
- It checks a maximum of 20 unique internal links per audit.
- Up to 5 link requests are processed concurrently.
- Structured data checking validates JSON syntax, not the complete schema.
- The audit covers the HTML returned by the website and does not run browser-based JavaScript.

## 10. Future Improvements

- Support larger websites with configurable crawl limits.
- Add more SEO checks.
- Improve broken-link detection.
- Add downloadable SEO audit reports.
- Improve the dashboard with charts and historical audit results.

## 11. Conclusion

The AI Marketing Intelligence Assistant combines website crawling, SEO analysis, automated scoring, and AI-generated recommendations to help users understand and improve their website's SEO performance.