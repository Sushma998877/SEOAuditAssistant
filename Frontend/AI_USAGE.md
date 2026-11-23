# AI Usage – AI Marketing Intelligence Assistant

## 1. AI Tool Used

Google Gemini API was used to generate SEO improvement recommendations.

## 2. Where AI Is Used

AI is integrated into the backend through the GeminiRecommendationService.

After the website crawler completes the SEO audit, the application sends the audit findings to the Gemini API.

Gemini analyzes the findings and generates simple, prioritized recommendations to help improve website SEO.

## 3. What AI Does

- Reviews the SEO audit findings.
- Identifies areas that need improvement.
- Suggests important SEO improvements.
- Provides recommendations in simple language.
- Helps prioritize the issues that should be addressed first.

## 4. What AI Does Not Do

The crawler and backend code are responsible for:

- Extracting SEO information.
- Checking title and meta description lengths.
- Identifying broken internal links.
- Checking H1 headings, canonical tags, and structured data.
- Calculating the overall SEO score.

Gemini does not calculate, change, or invent the SEO metrics or overall score.

## 5. AI Testing and Verification

The Gemini integration was tested using website audit results.

During initial integration, an incorrect model selection caused an API error. The model configuration was updated, and the integration was tested again successfully.

The generated recommendations were displayed in the React application.

The recommendations were treated as suggestions, and the actual SEO findings and score were taken from the backend crawler.

## 6. Limitations

- AI recommendations depend on the quality of the crawler findings.
- AI-generated suggestions may not always be completely accurate.
- Recommendations should be reviewed before making website changes.
- AI output does not replace the actual SEO checks performed by the application.

## 7. Conclusion

Google Gemini is used as an assistant to explain SEO issues and suggest improvements. The backend remains responsible for all SEO measurements and score calculations.