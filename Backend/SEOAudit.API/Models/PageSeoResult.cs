
namespace SEOAudit.API.Models
{
    public class PageSeoResult
    {
        public string PageUrl { get; set; } = string.Empty;

        public string? Title { get; set; }

        public string? MetaDescription { get; set; }

        public int TitleLength =>
            Title?.Length ?? 0;

        public int MetaDescriptionLength =>
            MetaDescription?.Length ?? 0;

        public bool HasTitle =>
            !string.IsNullOrWhiteSpace(Title);

        public bool HasMetaDescription =>
            !string.IsNullOrWhiteSpace(MetaDescription);

        public bool IsTitleLengthValid =>
            TitleLength >= 30 && TitleLength <= 60;

        public bool IsMetaDescriptionLengthValid =>
            MetaDescriptionLength >= 70 &&
            MetaDescriptionLength <= 160;

        public bool HasH1Heading { get; set; }

        public string? H1Heading { get; set; }
        public bool HasCanonicalTag { get; set; }

        public string? CanonicalUrl { get; set; }

        public bool HasStructuredData { get; set; }

        public int StructuredDataCount { get; set; }
    }
}
