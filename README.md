# AI Marketing Intelligence Assistant

An AI-powered SEO auditing tool that analyzes websites, identifies common SEO issues, calculates an overall SEO score, and provides AI-generated recommendations to improve search engine visibility.

The application combines website crawling, SEO analysis, automated scoring, and Google Gemini AI to help users understand their website's SEO performance.

---

## 1. Project Overview

The AI Marketing Intelligence Assistant is a web-based application designed to help marketing managers and website owners evaluate the SEO performance of their websites.

Users can enter a website URL, and the application crawls its pages to collect SEO-related information. It checks important SEO elements, identifies common issues, and calculates an overall SEO score out of 100.

Google Gemini AI is integrated to generate clear and prioritized recommendations based on the audit results. This helps users understand the identified issues and the improvements they can make.

The application provides an easy-to-use React interface and an ASP.NET Core Web API backend.

## 2. What It Does

- Accepts a website URL for SEO auditing.
- Crawls up to 10 pages from the same website.
- Extracts page titles and meta descriptions.
- Identifies broken internal links.
- Checks H1 heading presence.
- Checks canonical tags.
- Identifies JSON-LD structured data.
- Calculates an overall SEO score out of 100.
- Generates AI-powered SEO improvement recommendations.
- Displays audit results in a user-friendly dashboard.
- Provides suggestions for improving identified SEO issues.
- Displays clear error messages for invalid or unreachable websites.

## 3. How It Works

The application follows a simple workflow:

1. **Enter Website URL:** The user enters the website URL in the React application.
2. **Send Audit Request:** The frontend sends the URL to the ASP.NET Core Web API.
3. **Crawl Website:** The backend uses HttpClient and HtmlAgilityPack to retrieve and analyze website pages.
4. **Check SEO Metrics:** The application checks titles, meta descriptions, broken internal links, H1 headings, canonical tags, and structured data.
5. **Calculate SEO Score:** Each of the five SEO metrics contributes up to 20 points to the overall score.
6. **Generate AI Recommendations:** The Gemini API analyzes the available audit information and generates improvement suggestions.
7. **Display Results:** The frontend displays the SEO score, identified issues, page details, and recommendations.

## 4. SEO Metrics

The application evaluates five important SEO metrics.

| SEO Metric | What It Checks |
|---|---|
| Title and Meta Description | Checks title tags and meta descriptions against the configured character-length ranges |
| Broken Internal Links | Identifies internal links returning HTTP 4xx or 5xx responses |
| H1 Heading | Checks whether each crawled page contains an H1 heading |
| Canonical Tag | Checks whether each crawled page contains a canonical URL |
| Structured Data | Checks for JSON-LD structured data and validates its JSON syntax |

Each metric contributes up to 20 points, giving a maximum SEO score of 100.

## 5. AI-Powered Recommendations

The application integrates Google Gemini AI to provide recommendations based on the SEO audit results.

It helps users:

- Understand the SEO issues identified during the audit.
- Identify areas that need improvement.
- Get suggested title and meta description improvements.
- Receive clear and prioritized recommendations.

The AI recommendations are suggestions. They do not automatically modify the actual website.

## 6. Auto-Fix Suggestions

The application provides an interface to review SEO improvement suggestions.

Users can:

- View the original content.
- Review AI-generated suggestions.
- Copy suggested content.
- Mark suggestions as reviewed.

**Note:** The current implementation helps users review and copy recommendations. Automatically applying changes to a live website would require additional website or CMS integration and appropriate permissions.

## 7. Technologies Used

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

### Version Control
- Git
- GitHub

## 8. Project Structure

```text
SEOAuditAssistant/
│
├── Backend/
│   ├── SEOAudit.API/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Properties/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   │
│   ├── SEOAudit.API.Tests/
│   │
│   └── SEOAuditAssistant.slnx
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## 9. How to Run the Project

### Prerequisites

Make sure you have the following installed:

- .NET 10 SDK
- Visual Studio or VS Code
- Node.js and npm
- Google Gemini API key

### Backend Setup

1. Open the `Backend/SEOAuditAssistant.slnx` solution in Visual Studio.
2. Restore the required NuGet packages.
3. Configure your Gemini API key using Visual Studio User Secrets.
4. Set `SEOAudit.API` as the startup project.
5. Run the backend application.
6. Note the HTTPS URL displayed in the application output.

### Frontend Setup

1. Open the `Frontend` folder in VS Code.
2. Open the terminal.
3. Install the required dependencies:

```bash
npm install
```

4. Create a `.env` file in the `Frontend` folder and configure the backend URL:

```env
VITE_API_URL=https://localhost:7290
```

Replace the URL with the actual backend address configured on your machine.

5. Start the frontend:

```bash
npm run dev
```

6. Open the local URL displayed in the terminal.

**Important:** Run the backend before starting an SEO audit from the frontend.

## 10. API Endpoint

The backend exposes an API endpoint for performing SEO audits.

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

The API returns structured JSON containing crawled page details, SEO metrics, broken-link information, the overall SEO score, and AI recommendations.

## 11. Automated Testing

The backend uses xUnit for automated testing.

The tests cover:

- Valid and invalid website URLs.
- SEO information extraction.
- Missing SEO tags.
- Invalid structured data.
- Internal link identification.
- Overall SEO score calculation.
- Empty-page scenarios.

**Current test result: 9 tests passed.**

## 12. Limitations

- The crawler processes a maximum of 10 pages per audit.
- It checks a maximum of 20 unique internal links per audit.
- Up to 5 link requests are processed concurrently.
- Structured data checking validates JSON syntax, not the complete schema.
- The audit analyzes the HTML returned by the website and does not execute browser-based JavaScript.
- AI recommendations depend on the availability and configuration of the Gemini API.
- Suggested content is not automatically published to the actual website.

## 13. Future Improvements

- Support larger websites with configurable crawl limits.
- Add more advanced SEO checks.
- Improve broken-link detection.
- Generate downloadable SEO audit reports.
- Add charts and historical audit results.
- Support automatic SEO updates through CMS integrations.
- Improve recommendation tracking and reporting.

## 14. Conclusion

The AI Marketing Intelligence Assistant combines website crawling, SEO analysis, automated scoring, and AI-powered recommendations in a single application.

It helps users identify common SEO problems, understand website performance, and discover practical ways to improve search engine visibility.

The project demonstrates the integration of React, ASP.NET Core Web API, website crawling, automated testing, and Generative AI to build a practical AI-powered marketing tool.
