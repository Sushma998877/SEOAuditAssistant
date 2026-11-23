
namespace SEOAudit.API.Models
{
    public class BrokenLinkResult
    {
        public string SourcePageUrl { get; set; } = string.Empty;

        public string BrokenLinkUrl { get; set; } = string.Empty;

        public int? StatusCode { get; set; }

        public string StatusMessage { get; set; } = string.Empty;
    }
}
