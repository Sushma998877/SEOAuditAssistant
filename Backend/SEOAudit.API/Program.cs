
using SEOAudit.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Register controllers
builder.Services.AddControllers();

// Register website crawler service
builder.Services.AddHttpClient<WebsiteCrawlerService>(client =>
{
    // Maximum time allowed for a website request
    client.Timeout = TimeSpan.FromSeconds(15);

    // Identify our application when sending requests
    client.DefaultRequestHeaders.UserAgent.ParseAdd(
        "SEOAuditAssistant/1.0");
})
.ConfigurePrimaryHttpMessageHandler(() =>
{
    return new HttpClientHandler
    {
        // Do not automatically follow website redirects
        AllowAutoRedirect = false
    };
});

// Register Gemini recommendation service
builder.Services.AddHttpClient<GeminiRecommendationService>();

// Add Swagger support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Configure HTTP request pipeline
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
