
using SEOAudit.API.Services;
using SEOAudit.API.Models;
using Xunit;

namespace SEOAudit.API.Tests
{
    public class WebsiteCrawlerTests
    {
        [Fact]
        public void ExtractPageSeoResult_ShouldExtractSeoDetails()
        {
            // Arrange: Create sample HTML
            string html = @"
                <html>
                    <head>
                        <title>Best Healthcare Products for Your Family</title>
                        <meta name='description'
                              content='Explore our healthcare products and services for your family today.' />
                        <link rel='canonical'
                              href='https://example.com/products' />
                        <script type='application/ld+json'>
                            { ""name"": ""Healthcare Product"", ""@type"": ""Product"" }
                        </script>
                    </head>
                    <body>
                        <h1>Healthcare Products</h1>
                    </body>
                </html>";

            var httpClient = new HttpClient();
            var crawler = new WebsiteCrawlerService(httpClient);

            // Act: Extract SEO information
            var result = crawler.ExtractPageSeoResult(
                html,
                "https://example.com/products");

            // Assert: Check extracted values
            Assert.Equal(
                "Best Healthcare Products for Your Family",
                result.Title);

            Assert.True(result.HasMetaDescription);
            Assert.True(result.HasH1Heading);
            Assert.Equal("Healthcare Products", result.H1Heading);
            Assert.True(result.HasCanonicalTag);
            Assert.True(result.HasStructuredData);
            Assert.Equal(1, result.StructuredDataCount);
        }

        [Fact]
        public void ExtractPageSeoResult_WhenSeoTagsAreMissing_ShouldReturnFalse()
        {
            // Arrange: HTML without SEO tags
            string html = @"
                <html>
                    <head></head>
                    <body>
                        <p>Welcome to our website.</p>
                    </body>
                </html>";

            var httpClient = new HttpClient();
            var crawler = new WebsiteCrawlerService(httpClient);

            // Act
            var result = crawler.ExtractPageSeoResult(
                html,
                "https://example.com");

            // Assert
            Assert.Null(result.Title);
            Assert.False(result.HasMetaDescription);
            Assert.False(result.HasH1Heading);
            Assert.False(result.HasCanonicalTag);
            Assert.False(result.HasStructuredData);
        }

        [Fact]
        public void ExtractPageSeoResult_WithInvalidJsonLd_ShouldNotCountStructuredData()
        {
            // Arrange: HTML containing invalid JSON-LD
            string html = @"
                <html>
                    <head>
                        <script type='application/ld+json'>
                            { invalid json content }
                        </script>
                    </head>
                    <body>
                        <h1>Test Website</h1>
                    </body>
                </html>";

            var crawler = new WebsiteCrawlerService(new HttpClient());

            // Act
            var result = crawler.ExtractPageSeoResult(
                html,
                "https://example.com");

            // Assert
            Assert.False(result.HasStructuredData);
            Assert.Equal(0, result.StructuredDataCount);
        }

        [Fact]
        public void GetInternalLinks_ShouldReturnOnlyInternalLinks()
        {
            // Arrange: HTML with internal and external links
            string html = @"
                <html>
                    <body>
                        <a href='/about'>About</a>
                        <a href='https://example.com/contact'>Contact</a>
                        <a href='https://google.com'>Google</a>
                    </body>
                </html>";

            var crawler = new WebsiteCrawlerService(new HttpClient());

            // Act
            var links = crawler.GetInternalLinks(
                html,
                "https://example.com");

            // Assert
            Assert.Equal(2, links.Count);

            Assert.Contains(
                "https://example.com/about",
                links);

            Assert.Contains(
                "https://example.com/contact",
                links);

            Assert.DoesNotContain(
                "https://google.com/",
                links);
        }

        [Fact]
        public void CalculateOverallScore_ShouldReturnCorrectScore()
        {
            // Arrange: Create sample SEO audit results
            var response = new SEOAuditResponse
            {
                WebsiteUrl = "https://example.com",
                TotalPagesCrawled = 1,

                PageResults = new List<PageSeoResult>
                {
                    new PageSeoResult
                    {
                        Title = "Best Healthcare Products for Your Family",
                        MetaDescription = "Explore our healthcare products and services for your family today online.",
                        HasH1Heading = true,
                        HasCanonicalTag = true,
                        HasStructuredData = true
                    }
                },

                BrokenLinks = new List<BrokenLinkResult>(),

                AdditionalMetrics = new List<AdditionalMetricResult>
                {
                    new AdditionalMetricResult
                    {
                        MetricName = "H1 Heading",
                        PagesPassed = 1,
                        TotalPages = 1
                    },
                    new AdditionalMetricResult
                    {
                        MetricName = "Canonical Tag",
                        PagesPassed = 1,
                        TotalPages = 1
                    },
                    new AdditionalMetricResult
                    {
                        MetricName = "Structured Data",
                        PagesPassed = 1,
                        TotalPages = 1
                    }
                }
            };

            var crawler = new WebsiteCrawlerService(new HttpClient());

            // Act: Calculate the SEO score
            crawler.CalculateOverallScore(response);

            // Assert: All five metrics should receive 20 points
            Assert.Equal(100, response.OverallScore);



        }
        [Fact]
        public void CalculateOverallScore_WhenNoPagesExist_ShouldReturnZero()
        {
            var response = new SEOAuditResponse
            {
                WebsiteUrl = "https://example.com",
                TotalPagesCrawled = 0,
                PageResults = new List<PageSeoResult>(),
                BrokenLinks = new List<BrokenLinkResult>(),
                AdditionalMetrics = new List<AdditionalMetricResult>()
            };

            var crawler = new WebsiteCrawlerService(new HttpClient());

            crawler.CalculateOverallScore(response);

            Assert.Equal(0, response.OverallScore);
        }
    }
}
