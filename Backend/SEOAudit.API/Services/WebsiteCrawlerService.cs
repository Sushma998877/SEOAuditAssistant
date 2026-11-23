
using HtmlAgilityPack;
using SEOAudit.API.Models;
using System.Text.Json;
using System.Linq;

namespace SEOAudit.API.Services
{
    public class WebsiteCrawlerService
    {
        private readonly HttpClient _httpClient;

        private const int MaxPagesToCrawl = 10;

        public WebsiteCrawlerService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // Download website HTML
        public async Task<string> GetWebsiteHtmlAsync(string websiteUrl)
        {
            var response = await _httpClient.GetAsync(websiteUrl);

            response.EnsureSuccessStatusCode();

            string html = await response.Content.ReadAsStringAsync();

            return html;
        }

        // Download HTML and extract SEO information
        public async Task<PageSeoResult> GetPageSeoResultAsync(string websiteUrl)
        {
            string html = await GetWebsiteHtmlAsync(websiteUrl);

            return ExtractPageSeoResult(html, websiteUrl);
        }

        // Extract SEO information from downloaded HTML
        public PageSeoResult ExtractPageSeoResult(string html, string websiteUrl)
        {
            var document = new HtmlDocument();

            document.LoadHtml(html);

            // Extract page title
            string? title = document.DocumentNode
                .SelectSingleNode("//title")?.InnerText.Trim();

            // Extract meta description
            string? metaDescription = document.DocumentNode
                .SelectSingleNode(
                    "//meta[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='description']")
                ?.GetAttributeValue("content", null)?
                .Trim();

            // Extract H1 heading
            var h1Node = document.DocumentNode
                .SelectSingleNode("//h1");

            string? h1Heading = h1Node?.InnerText.Trim();

            // Extract canonical URL
            var canonicalNode = document.DocumentNode
                .SelectSingleNode(
                    "//link[contains(concat(' ', normalize-space(@rel), ' '), ' canonical ')]");

            string? canonicalUrl = canonicalNode?
                .GetAttributeValue("href", null)?
                .Trim();

            // Extract and validate structured data
            var structuredDataNodes = document.DocumentNode
                .SelectNodes("//script[@type='application/ld+json']");

            int structuredDataCount = 0;

            if (structuredDataNodes != null)
            {
                foreach (var node in structuredDataNodes)
                {
                    string jsonContent = node.InnerHtml.Trim();

                    try
                    {
                        using JsonDocument jsonDocument =
                            JsonDocument.Parse(jsonContent);

                        structuredDataCount++;
                    }
                    catch (JsonException)
                    {
                        // Ignore invalid JSON-LD content
                    }
                }
            }

            // Create SEO result
            return new PageSeoResult
            {
                PageUrl = websiteUrl,
                Title = title,
                MetaDescription = metaDescription,
                HasH1Heading = !string.IsNullOrWhiteSpace(h1Heading),
                H1Heading = h1Heading,
                HasCanonicalTag = !string.IsNullOrWhiteSpace(canonicalUrl),
                CanonicalUrl = canonicalUrl,
                HasStructuredData = structuredDataCount > 0,
                StructuredDataCount = structuredDataCount
            };
        }

        // Find internal links from webpage HTML
        public List<string> GetInternalLinks(string html, string pageUrl)
        {
            var document = new HtmlDocument();

            document.LoadHtml(html);

            var links = new List<string>();

            if (!Uri.TryCreate(pageUrl, UriKind.Absolute, out var baseUri))
            {
                return links;
            }

            var linkNodes = document.DocumentNode.SelectNodes("//a[@href]");

            if (linkNodes == null)
            {
                return links;
            }

            foreach (var linkNode in linkNodes)
            {
                string? href = linkNode.GetAttributeValue("href", null);

                if (string.IsNullOrWhiteSpace(href))
                {
                    continue;
                }

                // Convert relative links into complete URLs
                if (!Uri.TryCreate(baseUri, href, out var linkUri))
                {
                    continue;
                }

                // Allow only HTTP and HTTPS
                if (linkUri.Scheme != Uri.UriSchemeHttp &&
                    linkUri.Scheme != Uri.UriSchemeHttps)
                {
                    continue;
                }

                // Keep links from the same website host
                if (!string.Equals(
                    linkUri.Host,
                    baseUri.Host,
                    StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                // Remove URL fragments
                var builder = new UriBuilder(linkUri)
                {
                    Fragment = string.Empty
                };

                string normalizedUrl = builder.Uri.AbsoluteUri;

                if (!links.Contains(normalizedUrl))
                {
                    links.Add(normalizedUrl);
                }
            }

            return links;
        }

        // Crawl multiple internal pages and check broken links
        public async Task<SEOAuditResponse> CrawlWebsiteAsync(string websiteUrl)
        {
            var auditResponse = new SEOAuditResponse
            {
                WebsiteUrl = websiteUrl
            };

            // Store pages waiting to be visited
            var pagesToVisit = new Queue<(string Url, string Html)>();

            // Prevent duplicate page visits
            var scheduledUrls = new HashSet<string>(
                StringComparer.OrdinalIgnoreCase);

            // Download homepage
            var homeResponse = await _httpClient.GetAsync(websiteUrl);

            homeResponse.EnsureSuccessStatusCode();

            string homeHtml =
                await homeResponse.Content.ReadAsStringAsync();

            pagesToVisit.Enqueue((websiteUrl, homeHtml));

            scheduledUrls.Add(websiteUrl);

            // Visit pages until the limit is reached
            while (pagesToVisit.Count > 0 &&
                   auditResponse.PageResults.Count < MaxPagesToCrawl)
            {
                var currentPage = pagesToVisit.Dequeue();

                // Extract SEO information
                var pageResult = ExtractPageSeoResult(
                    currentPage.Html,
                    currentPage.Url);

                auditResponse.PageResults.Add(pageResult);

                // Find internal links
                List<string> internalLinks = GetInternalLinks(
                    currentPage.Html,
                    currentPage.Url);

                foreach (string link in internalLinks)
                {
                    if (scheduledUrls.Contains(link))
                    {
                        continue;
                    }

                    try
                    {
                        // Check the link response
                        var linkResponse = await _httpClient.GetAsync(link);

                        int statusCode = (int)linkResponse.StatusCode;

                        // Identify broken links
                        if (statusCode >= 400 && statusCode <= 599)
                        {
                            auditResponse.BrokenLinks.Add(new BrokenLinkResult
                            {
                                SourcePageUrl = currentPage.Url,
                                BrokenLinkUrl = link,
                                StatusCode = statusCode,
                                StatusMessage = linkResponse.ReasonPhrase
                                    ?? "HTTP error"
                            });

                            continue;
                        }

                        // Ignore unsuccessful responses
                        if (!linkResponse.IsSuccessStatusCode)
                        {
                            continue;
                        }

                        // Check page limit
                        if (scheduledUrls.Count >= MaxPagesToCrawl)
                        {
                            continue;
                        }

                        string linkedPageHtml =
                            await linkResponse.Content.ReadAsStringAsync();

                        scheduledUrls.Add(link);

                        pagesToVisit.Enqueue((link, linkedPageHtml));
                    }
                    catch (HttpRequestException)
                    {
                        // Ignore unreachable links for now
                    }
                    catch (TaskCanceledException)
                    {
                        // Ignore links that time out
                    }
                }
            }

            // Store total number of pages crawled
            auditResponse.TotalPagesCrawled =
                auditResponse.PageResults.Count;

            // Calculate the three additional SEO metrics
            CalculateAdditionalMetrics(auditResponse);

            // Calculate the overall SEO score
            CalculateOverallScore(auditResponse);

            return auditResponse;
        }

        // Calculate H1, Canonical and Structured Data metrics
        private void CalculateAdditionalMetrics(SEOAuditResponse response)
        {
            int totalPages = response.TotalPagesCrawled;

            if (totalPages == 0)
            {
                return;
            }

            // H1 heading metric
            var h1Pages = response.PageResults
                .Where(page => page.HasH1Heading)
                .ToList();

            response.AdditionalMetrics.Add(new AdditionalMetricResult
            {
                MetricName = "H1 Heading",
                Description = "Checks whether each page contains an H1 heading.",
                PagesPassed = h1Pages.Count,
                TotalPages = totalPages,
                Status = h1Pages.Count == totalPages
                    ? "Passed"
                    : "Needs improvement",
                AffectedPages = response.PageResults
                    .Where(page => !page.HasH1Heading)
                    .Select(page => page.PageUrl)
                    .ToList()
            });

            // Canonical tag metric
            var canonicalPages = response.PageResults
                .Where(page => page.HasCanonicalTag)
                .ToList();

            response.AdditionalMetrics.Add(new AdditionalMetricResult
            {
                MetricName = "Canonical Tag",
                Description = "Checks whether each page contains a canonical URL.",
                PagesPassed = canonicalPages.Count,
                TotalPages = totalPages,
                Status = canonicalPages.Count == totalPages
                    ? "Passed"
                    : "Needs improvement",
                AffectedPages = response.PageResults
                    .Where(page => !page.HasCanonicalTag)
                    .Select(page => page.PageUrl)
                    .ToList()
            });

            // Structured data metric
            var structuredDataPages = response.PageResults
                .Where(page => page.HasStructuredData)
                .ToList();

            response.AdditionalMetrics.Add(new AdditionalMetricResult
            {
                MetricName = "Structured Data",
                Description = "Checks whether each page contains valid JSON-LD structured data.",
                PagesPassed = structuredDataPages.Count,
                TotalPages = totalPages,
                Status = structuredDataPages.Count == totalPages
                    ? "Passed"
                    : "Needs improvement",
                AffectedPages = response.PageResults
                    .Where(page => !page.HasStructuredData)
                    .Select(page => page.PageUrl)
                    .ToList()
            });
        }

        // Calculate overall SEO score out of 100
        public void CalculateOverallScore(SEOAuditResponse response)
        {
            int totalPages = response.TotalPagesCrawled;

            if (totalPages == 0)
            {
                response.OverallScore = 0;
                return;
            }

            // Metric 1: Title and meta description
            int validTitleAndMetaPages = response.PageResults.Count(page =>
                page.IsTitleLengthValid &&
                page.IsMetaDescriptionLengthValid);

            double titleAndMetaScore =
                (double)validTitleAndMetaPages / totalPages * 20;

            // Metric 2: Broken internal links
            double brokenLinksScore =
                response.BrokenLinks.Count == 0 ? 20 : 0;

            // Metric 3: H1 heading
            var h1Metric = response.AdditionalMetrics
                .First(metric => metric.MetricName == "H1 Heading");

            double h1Score =
                (double)h1Metric.PagesPassed / totalPages * 20;

            // Metric 4: Canonical tag
            var canonicalMetric = response.AdditionalMetrics
                .First(metric => metric.MetricName == "Canonical Tag");

            double canonicalScore =
                (double)canonicalMetric.PagesPassed / totalPages * 20;

            // Metric 5: Structured data
            var structuredDataMetric = response.AdditionalMetrics
                .First(metric => metric.MetricName == "Structured Data");

            double structuredDataScore =
                (double)structuredDataMetric.PagesPassed / totalPages * 20;

            // Calculate total score
            double totalScore =
                titleAndMetaScore +
                brokenLinksScore +
                h1Score +
                canonicalScore +
                structuredDataScore;

            response.OverallScore = (int)Math.Round(totalScore);
        }
    }
}
