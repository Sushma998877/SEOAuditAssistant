
namespace SEOAudit.API.Models
{
    public class AdditionalMetricResult
    {
        public string MetricName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int PagesPassed { get; set; }

        public int TotalPages { get; set; }

        public string Status { get; set; } = string.Empty;

        public List<string> AffectedPages { get; set; } = new();
    }
}
