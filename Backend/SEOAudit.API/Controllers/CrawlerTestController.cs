
using Microsoft.AspNetCore.Mvc;
using SEOAudit.API.Services;

namespace SEOAudit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CrawlerTestController : ControllerBase
    {
        private readonly WebsiteCrawlerService _crawlerService;

        public CrawlerTestController(WebsiteCrawlerService crawlerService)
        {
            _crawlerService = crawlerService;
        }

        // Endpoint 1: Download website HTML
        [HttpGet("html")]
        public async Task<IActionResult> GetWebsiteHtml(string url)
        {
            try
            {
                if (!Uri.TryCreate(url, UriKind.Absolute, out var websiteUri) ||
                    (websiteUri.Scheme != Uri.UriSchemeHttp &&
                     websiteUri.Scheme != Uri.UriSchemeHttps))
                {
                    return BadRequest("Please enter a valid HTTP or HTTPS website URL.");
                }

                string html = await _crawlerService.GetWebsiteHtmlAsync(url);

                return Ok(new
                {
                    Message = "Website HTML downloaded successfully.",
                    WebsiteUrl = url,
                    HtmlContent = html
                });
            }
            catch (HttpRequestException)
            {
                return StatusCode(502, "Unable to retrieve the website.");
            }
            catch (TaskCanceledException)
            {
                return StatusCode(504, "The website request timed out.");
            }
        }

        // Endpoint 2: Extract title and meta description
        [HttpGet("seo")]
        public async Task<IActionResult> GetPageSeo(string url)
        {
            if (!Uri.TryCreate(url, UriKind.Absolute, out var websiteUri) ||
                (websiteUri.Scheme != Uri.UriSchemeHttp &&
                 websiteUri.Scheme != Uri.UriSchemeHttps))
            {
                return BadRequest("Please enter a valid website URL.");
            }

            try
            {
                var result = await _crawlerService.GetPageSeoResultAsync(url);

                return Ok(result);
            }
            catch (HttpRequestException)
            {
                return StatusCode(502, "Unable to retrieve the website.");
            }
            catch (TaskCanceledException)
            {
                return StatusCode(504, "Website request timed out.");
            }
        }
    }
}
