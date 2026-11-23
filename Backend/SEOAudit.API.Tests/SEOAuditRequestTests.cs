
using System.ComponentModel.DataAnnotations;
using SEOAudit.API.Models;
using Xunit;

namespace SEOAudit.API.Tests
{
    public class SEOAuditRequestTests
    {
        [Fact]
        public void ValidWebsiteUrl_ShouldPassValidation()
        {
            // Arrange: Create a valid website request
            var request = new SEOAuditRequest
            {
                WebsiteUrl = "https://example.com"
            };

            // Act: Validate the request
            var context = new ValidationContext(request);
            var results = new List<ValidationResult>();

            bool isValid = Validator.TryValidateObject(
                request,
                context,
                results,
                true);

            // Assert: The request should be valid
            Assert.True(isValid);
        }

        [Fact]
        public void InvalidWebsiteUrl_ShouldFailValidation()
        {
            // Arrange: Create a request with an invalid URL
            var request = new SEOAuditRequest
            {
                WebsiteUrl = "not-a-valid-url"
            };

            // Act: Validate the request
            var context = new ValidationContext(request);
            var results = new List<ValidationResult>();

            bool isValid = Validator.TryValidateObject(
                request,
                context,
                results,
                true);

            // Assert: The request should be invalid
            Assert.False(isValid);
        }
    }
}
