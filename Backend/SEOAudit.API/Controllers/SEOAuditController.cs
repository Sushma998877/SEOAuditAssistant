
using Microsoft.AspNetCore.Mvc;
using SEOAudit.API.Models;
using SEOAudit.API.Services;

namespace SEOAudit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SEOAuditController : ControllerBase
    {
        private readonly WebsiteCrawlerService _crawlerService;
        private readonly GeminiRecommendationService _geminiService;

        public SEOAuditController(
            WebsiteCrawlerService crawlerService,
            GeminiRecommendationService geminiService)
        {
            _crawlerService = crawlerService;
            _geminiService = geminiService;
        }

        // API endpoint to perform a complete SEO audit
        [HttpPost("audit")]
        public async Task<IActionResult> AuditWebsite(
            [FromBody] SEOAuditRequest request)
        {
            // Validate the website URL
            if (!Uri.TryCreate(
                request.WebsiteUrl,
                UriKind.Absolute,
                out var websiteUri) ||
                (websiteUri.Scheme != Uri.UriSchemeHttp &&
                 websiteUri.Scheme != Uri.UriSchemeHttps))
            {
                return BadRequest(new
                {
                    Message = "Please enter a valid HTTP or HTTPS website URL."
                });
            }

            SEOAuditResponse result;

            // Step 1: Crawl the website
            try
            {
                result = await _crawlerService.CrawlWebsiteAsync(
                    request.WebsiteUrl);
            }
            catch (HttpRequestException)
            {
                return StatusCode(502, new
                {
                    Message = "Unable to retrieve the website."
                });
            }
            catch (TaskCanceledException)
            {
                return StatusCode(504, new
                {
                    Message = "The website request timed out."
                });
            }

            // Step 2: Generate AI recommendations
            try
            {
                result.AiRecommendations =
                    await _geminiService.GenerateRecommendationsAsync(result);
            }
            catch (Exception ex)
            {
                result.AiRecommendationError =
                    ex.GetType().Name + ": " + ex.Message;
            }

            // Step 3: Return the complete report
            return Ok(result);
        }
    }
}
