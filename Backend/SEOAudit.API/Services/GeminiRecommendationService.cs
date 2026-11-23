
using SEOAudit.API.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace SEOAudit.API.Services
{
    public class GeminiRecommendationService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public GeminiRecommendationService(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        // Generate SEO recommendations using Gemini
        public async Task<string> GenerateRecommendationsAsync(
            SEOAuditResponse auditResponse)
        {
            // Read Gemini API key from User Secrets
            string? apiKey =
                _configuration["Gemini:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException(
                    "Gemini API key is missing.");
            }

            // Prepare SEO findings for Gemini
            string prompt = BuildPrompt(auditResponse);

            // Gemini API endpoint
            string apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new
                            {
                                text = prompt
                            }
                        }
                    }
                }
            };

            string jsonRequest =
                JsonSerializer.Serialize(requestBody);

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                apiUrl);

            request.Headers.Add("x-goog-api-key", apiKey);

            request.Content = new StringContent(
                jsonRequest,
                Encoding.UTF8,
                "application/json");

            // Send request to Gemini
            using var response =
                await _httpClient.SendAsync(request);

            string responseContent =
                await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"Gemini API request failed with status code {(int)response.StatusCode}.");
            }

            // Read Gemini response
            using JsonDocument jsonDocument =
                JsonDocument.Parse(responseContent);

            if (!jsonDocument.RootElement.TryGetProperty(
                "candidates", out var candidates) ||
                candidates.GetArrayLength() == 0)
            {
                throw new InvalidOperationException(
                    "Gemini did not return any recommendations.");
            }

            var parts = candidates[0]
                .GetProperty("content")
                .GetProperty("parts");

            var recommendations = new StringBuilder();

            foreach (var part in parts.EnumerateArray())
            {
                if (part.TryGetProperty("text", out var text))
                {
                    recommendations.AppendLine(text.GetString());
                }
            }

            if (recommendations.Length == 0)
            {
                throw new InvalidOperationException(
                    "Gemini returned an empty recommendation.");
            }

            return recommendations.ToString().Trim();
        }

        // Prepare the SEO report as a prompt
        private string BuildPrompt(SEOAuditResponse response)
        {
            var prompt = new StringBuilder();

            prompt.AppendLine(
                "You are an SEO marketing assistant.");

            prompt.AppendLine(
                "Analyse the following website SEO audit results.");

            prompt.AppendLine(
                "Create a short, prioritised action list for the marketing team.");

            prompt.AppendLine(
                "Use only the findings provided below. Do not invent missing data.");

            prompt.AppendLine(
                "For each recommendation, explain what needs to be improved and why it matters.");

            prompt.AppendLine(
                "Keep the language simple and practical.");

            prompt.AppendLine(
                "Do not calculate or change the SEO score.");

            prompt.AppendLine();

            prompt.AppendLine(
                $"Website: {response.WebsiteUrl}");

            prompt.AppendLine(
                $"Pages crawled: {response.TotalPagesCrawled}");

            prompt.AppendLine(
                $"Overall SEO score: {response.OverallScore}/100");

            prompt.AppendLine();
            prompt.AppendLine("PAGE SEO RESULTS:");

            foreach (var page in response.PageResults)
            {
                prompt.AppendLine($"Page: {page.PageUrl}");
                prompt.AppendLine(
                    $"Title: {page.Title ?? "Missing"}");

                prompt.AppendLine(
                    $"Title length valid: {page.IsTitleLengthValid}");

                prompt.AppendLine(
                    $"Meta description: {page.MetaDescription ?? "Missing"}");

                prompt.AppendLine(
                    $"Meta description length valid: {page.IsMetaDescriptionLengthValid}");

                prompt.AppendLine(
                    $"H1 heading present: {page.HasH1Heading}");

                prompt.AppendLine(
                    $"Canonical tag present: {page.HasCanonicalTag}");

                prompt.AppendLine(
                    $"Valid structured data present: {page.HasStructuredData}");

                prompt.AppendLine();
            }

            prompt.AppendLine("BROKEN INTERNAL LINKS:");

            if (response.BrokenLinks.Count == 0)
            {
                prompt.AppendLine("No broken links were detected.");
            }
            else
            {
                foreach (var link in response.BrokenLinks)
                {
                    prompt.AppendLine(
                        $"Link: {link.BrokenLinkUrl}, " +
                        $"Status: {link.StatusCode}, " +
                        $"Found on: {link.SourcePageUrl}");
                }
            }

            prompt.AppendLine();
            prompt.AppendLine("ADDITIONAL METRICS:");

            foreach (var metric in response.AdditionalMetrics)
            {
                prompt.AppendLine(
                    $"{metric.MetricName}: " +
                    $"{metric.PagesPassed}/{metric.TotalPages} pages passed. " +
                    $"Status: {metric.Status}");
            }

            prompt.AppendLine();
            prompt.AppendLine(
                "Return the top 5 improvements in priority order.");

            return prompt.ToString();
        }
    }
}
