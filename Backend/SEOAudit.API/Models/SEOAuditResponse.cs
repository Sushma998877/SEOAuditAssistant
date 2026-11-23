
namespace SEOAudit.API.Models
{
    public class SEOAuditResponse
    {
        public string WebsiteUrl { get; set; } = string.Empty;

        public int TotalPagesCrawled { get; set; }

        public List<PageSeoResult> PageResults { get; set; } = new();

        public List<BrokenLinkResult> BrokenLinks { get; set; } = new();

        public List<AdditionalMetricResult> AdditionalMetrics { get; set; } = new();

        public int OverallScore { get; set; }

        public string? AiRecommendations { get; set; }

        public string? AiRecommendationError { get; set; }
    }
}
