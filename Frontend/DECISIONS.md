# Technical Decisions – AI Marketing Intelligence Assistant

## 1. Backend – ASP.NET Core Web API

**Decision:** Selected C# and ASP.NET Core Web API.

**Reason:** It provides a structured way to build APIs, handle HTTP requests, and process website audit operations.

## 2. Frontend – React with Vite

**Decision:** Selected React with Vite.

**Reason:** React helps build an interactive user interface, while Vite provides a simple and fast development setup.

## 3. HTML Parsing – HtmlAgilityPack

**Decision:** Selected HtmlAgilityPack for reading website HTML.

**Reason:** It helps extract page titles, meta descriptions, H1 headings, canonical tags, links, and structured data from HTML.

## 4. Website Crawling – HttpClient

**Decision:** Used HttpClient to download website pages and check internal links.

**Reason:** It supports HTTP requests and allows the application to retrieve website content and check response status codes.

## 5. Crawling Limits and Performance

**Decision:** Limited crawling to 10 pages and 20 unique internal links, with up to 5 concurrent link checks.

**Reason:** These limits help control the number of requests and reduce waiting time during an audit.

## 6. AI Integration – Google Gemini

**Decision:** Selected Google Gemini API for generating SEO recommendations.

**Reason:** It converts the crawler findings into simple, prioritized suggestions. The actual SEO metrics and score are calculated by backend code.

## 7. Testing – xUnit

**Decision:** Selected xUnit for automated testing.

**Reason:** It helps verify important functions such as URL validation, SEO extraction, internal link processing, and score calculation.

## 8. No Database

**Decision:** Did not use a database.

**Reason:** The application processes website information and returns audit results directly. Persistent storage was not required for the current project scope.