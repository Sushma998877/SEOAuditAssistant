
using System.ComponentModel.DataAnnotations;

namespace SEOAudit.API.Models
{
    public class SEOAuditRequest
    {
        [Required(ErrorMessage = "Website URL is required.")]
        [Url(ErrorMessage = "Please enter a valid website URL.")]
        public string WebsiteUrl { get; set; } = string.Empty;
    }
}
