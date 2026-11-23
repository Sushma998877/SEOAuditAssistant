
import { useState } from 'react'
import './App.css'

function App() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [auditResult, setAuditResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')
  const [copiedItem, setCopiedItem] = useState('')
  const [selectedAutoFixPage, setSelectedAutoFixPage] = useState(0)
  const [reviewedPages, setReviewedPages] = useState([])

  const navigation = [
    { name: 'Overview', icon: '▦' },
    { name: 'SEO Metrics', icon: '◈' },
    { name: 'Crawled Pages', icon: '▤' },
    { name: 'Broken Links', icon: '↗' },
    { name: 'AI Insights', icon: '✦' },
    { name: 'SEO Auto-Fix', icon: '⚡' },
  ]

  const validateWebsiteUrl = (url) => {
    if (!url.trim()) return 'Please enter a website URL.'

    try {
      const parsedUrl = new URL(url.trim())

      if (
        parsedUrl.protocol !== 'http:' &&
        parsedUrl.protocol !== 'https:'
      ) {
        return 'Please enter a valid HTTP or HTTPS website URL.'
      }

      if (!parsedUrl.hostname || !parsedUrl.hostname.includes('.')) {
        return 'Please enter a valid website URL, such as https://example.com.'
      }

      if (parsedUrl.hostname === 'localhost') {
        return 'Please enter a valid public website URL.'
      }

      return ''
    } catch {
      return 'Invalid website URL. Please enter a valid URL, such as https://example.com.'
    }
  }

  const handleAudit = async () => {
    const trimmedUrl = websiteUrl.trim()
    const validationError = validateWebsiteUrl(trimmedUrl)

    if (validationError) {
      setError(validationError)
      setAuditResult(null)
      return
    }

    setLoading(true)
    setError('')
    setAuditResult(null)
    setActiveTab('Overview')
    setCopiedItem('')
    setSelectedAutoFixPage(0)
    setReviewedPages([])

    try {
      const apiUrl = import.meta.env.VITE_API_URL

      if (!apiUrl) {
        throw new Error(
          'API URL is not configured. Please check your frontend .env file.'
        )
      }

      const response = await fetch(`${apiUrl}/api/SEOAudit/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: trimmedUrl,
        }),
      })

      const responseText = await response.text()
      let data = {}

      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error(
          'The server returned an unexpected response. Please try again.'
        )
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.title ||
          'Unable to audit the website. Please check the URL and try again.'
        )
      }

      setAuditResult(data)
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          'Unable to connect to the backend. Please check whether your API is running.'
        )
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getRecommendations = () => {
    if (!auditResult?.aiRecommendations) return []

    try {
      const data =
        typeof auditResult.aiRecommendations === 'string'
          ? JSON.parse(auditResult.aiRecommendations)
          : auditResult.aiRecommendations

      return Array.isArray(data.recommendations)
        ? data.recommendations
        : []
    } catch {
      return []
    }
  }

  const getSeoFixSuggestions = () => {
    return Array.isArray(auditResult?.seoFixSuggestions)
      ? auditResult.seoFixSuggestions
      : []
  }

  const handleCopy = async (text, itemId) => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemId)

      setTimeout(() => {
        setCopiedItem((current) =>
          current === itemId ? '' : current
        )
      }, 2000)
    } catch {
      setError(
        'Unable to copy the text. Please select and copy it manually.'
      )
    }
  }

  const getTitleMetaPassed = () => {
    return (auditResult?.pageResults || []).filter(
      (page) =>
        page.isTitleLengthValid &&
        page.isMetaDescriptionLengthValid
    ).length
  }

  const getMetricStatus = (passed, total) => {
    if (total === 0) return 'Not available'
    return passed === total ? 'Passed' : 'Needs improvement'
  }

  const getPriorityClass = (priority) => {
    const value = priority?.toLowerCase()

    if (value === 'high') return 'priority-high'
    if (value === 'medium') return 'priority-medium'
    return 'priority-low'
  }

  const renderMetricCard = (name, description, passed, total, icon) => {
    const percentage = total
      ? Math.round((passed / total) * 100)
      : 0

    return (
      <div className="metric-card" key={name}>
        <div className="metric-card-top">
          <span className="metric-icon">{icon}</span>
          <span
            className={`status-pill ${
              total > 0 && passed === total
                ? 'status-good'
                : 'status-warning'
            }`}
          >
            {getMetricStatus(passed, total)}
          </span>
        </div>

        <h3>{name}</h3>
        <p className="metric-description">{description}</p>

        <div className="metric-count">
          <strong>{passed}</strong>
          <span> / {total} pages passed</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  const renderSeoFlowchart = () => {
    const totalPages = auditResult?.totalPagesCrawled || 0
    const score = auditResult?.overallScore || 0
    const recommendations = getRecommendations()

    const metrics = [
      {
        name: 'Title & Meta',
        passed: getTitleMetaPassed(),
        total: totalPages,
        color: 'blue',
        icon: 'T',
      },
      ...(auditResult?.additionalMetrics || []).map(
        (metric, index) => ({
          name: metric.metricName,
          passed: metric.pagesPassed,
          total: metric.totalPages,
          color: ['cyan', 'purple', 'pink', 'orange'][index % 4],
          icon: metric.metricName?.charAt(0).toUpperCase() || '✓',
        })
      ),
    ]

    return (
      <section className="seo-flow-section">
        <div className="flow-heading">
          <div>
            <span className="flow-eyebrow">SEO ANALYSIS JOURNEY</span>
            <h2>How your SEO score is evaluated</h2>
            <p>
              Follow the audit process from website crawling to
              AI-powered recommendations.
            </p>
          </div>

          <span className="flow-live-tag">
            <span />
            Audit completed
          </span>
        </div>

        <div className="seo-flowchart">
          <div className="flow-main-node">
            <div className="flow-node-icon website-icon">⌕</div>
            <div>
              <span className="flow-step">STEP 01</span>
              <h3>Website Crawling</h3>
              <p>{totalPages} pages analyzed</p>
            </div>
          </div>

          <div className="flow-connector">
            <span />
            <span className="connector-arrow">↓</span>
          </div>

          <div className="flow-main-node score-flow-node">
            <div className="flow-score-circle">
              <strong>{score}</strong>
              <span>/100</span>
            </div>
            <div>
              <span className="flow-step">STEP 02</span>
              <h3>Overall SEO Score</h3>
              <p>
                {score >= 80
                  ? 'Good SEO foundation'
                  : score >= 50
                    ? 'Room for improvement'
                    : 'Needs attention'}
              </p>
            </div>
          </div>

          <div className="flow-connector">
            <span />
            <span className="connector-arrow">↓</span>
          </div>

          <div className="flow-metrics-stage">
            <div className="flow-stage-heading">
              <span className="flow-step">STEP 03</span>
              <h3>SEO Metric Analysis</h3>
              <p>Individual checks from your website audit</p>
            </div>

            <div className="flow-metric-grid">
              {metrics.map((metric, index) => {
                const percentage = metric.total
                  ? Math.round((metric.passed / metric.total) * 100)
                  : 0

                return (
                  <div
                    className={`flow-metric-node ${metric.color}`}
                    key={`${metric.name}-${index}`}
                  >
                    <div className="flow-metric-top">
                      <span className="flow-metric-icon">
                        {metric.icon}
                      </span>
                      <span className="flow-metric-percent">
                        {metric.total ? `${percentage}%` : '—'}
                      </span>
                    </div>

                    <h4>{metric.name}</h4>

                    <div className="flow-progress-track">
                      <div
                        className="flow-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p>
                      {metric.total
                        ? `${metric.passed} of ${metric.total} pages passed`
                        : 'No data available'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flow-connector">
            <span />
            <span className="connector-arrow">↓</span>
          </div>

          <div className="flow-main-node ai-flow-node">
            <div className="flow-node-icon ai-flow-icon">✦</div>

            <div className="ai-flow-content">
              <span className="flow-step">STEP 04</span>
              <h3>AI SEO Analysis</h3>
              <p>
                {recommendations.length} recommendations generated
                by Gemini
              </p>
            </div>

            <button
              className="flow-action-button"
              onClick={() => setActiveTab('AI Insights')}
            >
              Explore insights →
            </button>
          </div>
        </div>
      </section>
    )
  }

  const renderOverview = () => {
    const pages = auditResult.pageResults || []
    const totalPages = auditResult.totalPagesCrawled || 0
    const score = auditResult.overallScore || 0
    const brokenCount = auditResult.brokenLinks?.length || 0
    const recommendations = getRecommendations()
    const fixSuggestions = getSeoFixSuggestions()

    return (
      <>
        <div className="welcome-heading">
          <div>
            <p className="eyebrow">WEBSITE PERFORMANCE</p>
            <h1>SEO Audit Overview</h1>
            <p className="section-subtitle">
              Here's a summary of your website's SEO health.
            </p>
          </div>
          <span className="report-tag">Audit completed</span>
        </div>

        <div className="overview-grid">
          <div className="score-panel">
            <div className="score-panel-content">
              <p className="panel-label">OVERALL SEO SCORE</p>
              <div className="score-number">
                {score}<span>/100</span>
              </div>
              <p className="score-caption">
                {score >= 80
                  ? 'Your website has a good SEO foundation.'
                  : score >= 50
                    ? 'Some improvements can strengthen your SEO.'
                    : 'Your website needs SEO improvements.'}
              </p>
            </div>

            <div
              className="score-ring"
              style={{ '--score': `${score * 3.6}deg` }}
            >
              <div className="score-ring-inner">
                <strong>{score}</strong>
                <span>Score</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon purple">▤</div>
            <p>Pages crawled</p>
            <h2>{totalPages}</h2>
            <span>Website pages analyzed</span>
          </div>

          <div className="summary-card">
            <div className="summary-icon orange">↗</div>
            <p>Broken links</p>
            <h2>{brokenCount}</h2>
            <span>HTTP 4xx / 5xx responses detected</span>
          </div>

          <div className="summary-card">
            <div className="summary-icon green">✦</div>
            <p>AI recommendations</p>
            <h2>{recommendations.length}</h2>
            <span>Suggested improvements</span>
          </div>
        </div>

        {renderSeoFlowchart()}

        <div className="section-heading">
          <div>
            <h2>SEO Performance</h2>
            <p>Quick view of your five SEO metrics.</p>
          </div>
          <button
            className="text-button"
            onClick={() => setActiveTab('SEO Metrics')}
          >
            View all metrics →
          </button>
        </div>

        <div className="metric-grid">
          {renderMetricCard(
            'Title & Meta',
            'Recommended character lengths',
            getTitleMetaPassed(),
            totalPages,
            'T'
          )}

          {(auditResult.additionalMetrics || []).map((metric) =>
            renderMetricCard(
              metric.metricName,
              metric.description,
              metric.pagesPassed,
              metric.totalPages,
              metric.metricName === 'H1 Heading'
                ? 'H'
                : metric.metricName === 'Canonical Tag'
                  ? 'C'
                  : 'S'
            )
          )}
        </div>

        <div className="quick-insight">
          <div className="quick-insight-content">
            <span className="insight-icon">✦</span>
            <div>
              <h3>AI SEO Insights</h3>
              <p>
                {recommendations.length > 0
                  ? `${recommendations.length} recommendations are available to improve your website.`
                  : 'AI recommendations are not available for this audit.'}
              </p>
            </div>
          </div>

          <button onClick={() => setActiveTab('AI Insights')}>
            View recommendations →
          </button>
        </div>

        <div className="quick-insight">
          <div className="quick-insight-content">
            <span className="insight-icon">⚡</span>
            <div>
              <h3>SEO Auto-Fix Assistant</h3>
              <p>
                {fixSuggestions.length > 0
                  ? `${fixSuggestions.length} pages have AI-generated SEO suggestions.`
                  : 'View AI-generated title and meta description suggestions.'}
              </p>
            </div>
          </div>

          <button onClick={() => setActiveTab('SEO Auto-Fix')}>
            View Auto-Fix →
          </button>
        </div>

        {pages.length > 0 && (
          <div className="section-heading pages-section-heading">
            <div>
              <h2>Website analyzed</h2>
              <p>{auditResult.websiteUrl}</p>
            </div>
            <button
              className="text-button"
              onClick={() => setActiveTab('Crawled Pages')}
            >
              View pages →
            </button>
          </div>
        )}
      </>
    )
  }

  const renderMetrics = () => {
    const total = auditResult.totalPagesCrawled || 0

    return (
      <>
        <div className="welcome-heading">
          <div>
            <p className="eyebrow">DETAILED ANALYSIS</p>
            <h1>SEO Metrics</h1>
            <p className="section-subtitle">
              Detailed results for all five SEO checks.
            </p>
          </div>
        </div>

        <div className="metric-grid">
          {renderMetricCard(
            'Title & Meta Description',
            'Title: 30–60 characters. Meta: 70–160 characters.',
            getTitleMetaPassed(),
            total,
            'T'
          )}

          {(auditResult.additionalMetrics || []).map((metric) =>
            renderMetricCard(
              metric.metricName,
              metric.description,
              metric.pagesPassed,
              metric.totalPages,
              '✓'
            )
          )}
        </div>

        <div className="info-note">
          <strong>How the score works</strong>
          <p>
            Each of the five metrics contributes up to 20 points.
            The backend calculates the final score using the
            crawler findings.
          </p>
        </div>
      </>
    )
  }

  const renderPages = () => (
    <>
      <div className="welcome-heading">
        <div>
          <p className="eyebrow">CRAWL REPORT</p>
          <h1>Crawled Pages</h1>
          <p className="section-subtitle">
            SEO details extracted from each page.
          </p>
        </div>
        <span className="report-tag">
          {auditResult.totalPagesCrawled} pages
        </span>
      </div>

      {(auditResult.pageResults || []).map((page, index) => (
        <div className="page-card" key={page.pageUrl || index}>
          <div className="page-card-header">
            <div>
              <span className="page-number">PAGE {index + 1}</span>
              <h3>{page.pageUrl}</h3>
            </div>
          </div>

          <div className="page-details-grid">
            <div className="detail-item">
              <span>Title</span>
              <strong>{page.title || 'Missing'}</strong>
              <small>{page.titleLength} characters</small>
              <span className={`mini-status ${page.isTitleLengthValid ? 'good' : 'bad'}`}>
                {page.isTitleLengthValid ? 'Valid length' : 'Invalid length'}
              </span>
            </div>

            <div className="detail-item">
              <span>Meta description</span>
              <strong>{page.metaDescription || 'Missing'}</strong>
              <small>{page.metaDescriptionLength} characters</small>
              <span className={`mini-status ${page.isMetaDescriptionLengthValid ? 'good' : 'bad'}`}>
                {page.isMetaDescriptionLengthValid ? 'Valid length' : 'Invalid length'}
              </span>
            </div>

            <div className="detail-item">
              <span>H1 heading</span>
              <strong>{page.h1Heading || 'Missing'}</strong>
              <span className={`mini-status ${page.hasH1Heading ? 'good' : 'bad'}`}>
                {page.hasH1Heading ? 'Present' : 'Missing'}
              </span>
            </div>

            <div className="detail-item">
              <span>Canonical tag</span>
              <strong>{page.canonicalUrl || 'Missing'}</strong>
              <span className={`mini-status ${page.hasCanonicalTag ? 'good' : 'bad'}`}>
                {page.hasCanonicalTag ? 'Present' : 'Missing'}
              </span>
            </div>

            <div className="detail-item">
              <span>Structured data</span>
              <strong>
                {page.structuredDataCount} valid JSON-LD blocks
              </strong>
              <span className={`mini-status ${page.hasStructuredData ? 'good' : 'bad'}`}>
                {page.hasStructuredData ? 'Present' : 'Missing'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  )

  const renderBrokenLinks = () => (
    <>
      <div className="welcome-heading">
        <div>
          <p className="eyebrow">LINK ANALYSIS</p>
          <h1>Broken Internal Links</h1>
          <p className="section-subtitle">
            Internal links returning HTTP 4xx or 5xx responses.
          </p>
        </div>
        <span className="report-tag">
          {auditResult.brokenLinks?.length || 0} found
        </span>
      </div>

      {auditResult.brokenLinks?.length > 0 ? (
        auditResult.brokenLinks.map((link, index) => (
          <div className="broken-link-card" key={index}>
            <span className="broken-status">
              HTTP {link.statusCode ?? 'Error'}
            </span>
            <h3>{link.brokenLinkUrl}</h3>
            <p>Found on: {link.sourcePageUrl}</p>
            <p>Status: {link.statusMessage || 'HTTP error response'}</p>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <span className="empty-icon">✓</span>
          <h2>No broken internal links detected</h2>
          <p>
            The crawler did not detect any internal links returning
            HTTP 4xx or 5xx responses among the links it checked.
          </p>
        </div>
      )}

      <p className="small-note">
        Note: The crawler checks a maximum of 20 unique internal
        links per audit.
      </p>
    </>
  )

  const renderAIInsights = () => {
    const recommendations = getRecommendations()

    return (
      <>
        <div className="welcome-heading">
          <div>
            <p className="eyebrow">GEMINI AI ANALYSIS</p>
            <h1>AI Recommendations</h1>
            <p className="section-subtitle">
              Prioritized actions based on your actual SEO audit findings.
            </p>
          </div>
          <span className="ai-tag">✦ Powered by Gemini</span>
        </div>

        {auditResult.aiRecommendationError && (
          <div className="error">
            AI recommendation issue: {auditResult.aiRecommendationError}
          </div>
        )}

        {recommendations.length > 0 ? (
          <div className="recommendation-list">
            {recommendations.map((item, index) => (
              <div className="recommendation-card" key={index}>
                <div className="recommendation-top">
                  <span className="recommendation-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`priority-badge ${getPriorityClass(item.priority)}`}
                  >
                    {item.priority} Priority
                  </span>
                </div>

                <h3>{item.issue}</h3>

                <div className="recommendation-detail">
                  <span>WHAT THE AUDIT FOUND</span>
                  <p>{item.evidence}</p>
                </div>

                <div className="recommendation-action">
                  <span>RECOMMENDED ACTION</span>
                  <p>{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">✦</span>
            <h2>AI recommendations unavailable</h2>
            <p>
              {auditResult.aiRecommendationError ||
                'No recommendations were returned. Please check the Gemini API configuration and try again.'}
            </p>
          </div>
        )}

        <p className="small-note">
          AI recommendations are suggestions based on crawler findings.
          The SEO score and metric values are calculated by the backend.
        </p>
      </>
    )
  }

  // Match a suggestion to its crawled page URL.
  const normalizePageUrl = (url) => {
    return (url || '').trim().replace(/\/+$/, '').toLowerCase()
  }

  const getAutoFixPages = () => {
    const pages = auditResult?.pageResults || []
    const suggestions = getSeoFixSuggestions()

    return pages.map((page) => {
      const suggestion = suggestions.find(
        (item) =>
          normalizePageUrl(item.pageUrl) ===
          normalizePageUrl(page.pageUrl)
      )

      return {
        pageUrl: page.pageUrl,
        originalTitle:
          suggestion?.originalTitle ?? page.title ?? '',
        suggestedTitle: suggestion?.suggestedTitle ?? '',
        originalMetaDescription:
          suggestion?.originalMetaDescription ??
          page.metaDescription ??
          '',
        suggestedMetaDescription:
          suggestion?.suggestedMetaDescription ?? '',
        originalH1:
          suggestion?.originalH1 ?? page.h1Heading ?? '',
        suggestedH1: suggestion?.suggestedH1 ?? '',
        reason: suggestion?.reason ?? '',
      }
    })
  }

  // =========================================
  // SEO AUTO-FIX - UPDATED UI
  // =========================================

  const renderSeoAutoFix = () => {
    const pages = getAutoFixPages()

    const pagesWithSuggestions = pages.filter(
      (page) =>
        page.suggestedTitle ||
        page.suggestedMetaDescription ||
        page.suggestedH1
    )

    const currentPage = pages[selectedAutoFixPage] || null
    const currentPageKey = currentPage?.pageUrl || ''

    const isCurrentPageReviewed =
      reviewedPages.includes(currentPageKey)

    const reviewPercentage = pages.length
      ? Math.round((reviewedPages.length / pages.length) * 100)
      : 0

    const renderSuggestionField = (
      label,
      original,
      suggested,
      itemId,
      minLength,
      maxLength
    ) => (
      <div className="autofix-field" key={itemId}>
        <div className="autofix-field-heading">
          <h3>{label}</h3>
          <span className="autofix-field-tag">SEO CONTENT</span>
        </div>

        <div className="autofix-comparison">
          <div className="autofix-original">
            <div className="autofix-label-row">
              <span className="autofix-label">
                <span className="autofix-label-dot original-dot" />
                ORIGINAL CONTENT
              </span>

              <span className="autofix-character-count">
                {original
                  ? `${original.length} characters`
                  : 'Missing'}
              </span>
            </div>

            <p>{original || 'No original content found.'}</p>
          </div>

          <div className="autofix-suggested">
            <div className="autofix-label-row">
              <span className="autofix-label">
                <span className="autofix-label-dot suggestion-dot" />
                AI SUGGESTION
              </span>

              {suggested && (
                <span className="autofix-character-count suggestion-count">
                  {suggested.length} characters
                </span>
              )}
            </div>

            {suggested ? (
              <>
                <p>{suggested}</p>

                {minLength && maxLength && (
                  <span className="autofix-recommendation">
                    Recommended length: {minLength}–{maxLength} characters
                  </span>
                )}

                <button
                  type="button"
                  className="autofix-copy-button"
                  onClick={() => handleCopy(suggested, itemId)}
                >
                  {copiedItem === itemId
                    ? '✓ Copied'
                    : '▢ Copy suggestion'}
                </button>
              </>
            ) : (
              <p className="autofix-no-suggestion">
                No AI suggestion available for this field.
              </p>
            )}
          </div>
        </div>
      </div>
    )

    return (
      <section className="autofix-container">

        {/* Hero Header */}

        <div className="autofix-hero">
          <div className="autofix-hero-content">
            <span className="autofix-eyebrow">
              ✦ GEMINI AI CONTENT OPTIMIZATION
            </span>

            <h1>SEO Auto-Fix Assistant</h1>

            <p>
              Improve your website content with AI-powered SEO
              suggestions. Review each change before using it
              on your website.
            </p>
          </div>

          <div className="autofix-hero-icon">✦</div>
        </div>

        {/* Information Banner */}

        <div className="autofix-info-banner">
          <span className="autofix-info-icon">ⓘ</span>

          <div>
            <strong>Your website content is safe</strong>
            <p>
              These are AI-generated recommendations only.
              Your actual website content will not be changed
              automatically.
            </p>
          </div>
        </div>

        {auditResult.autoFixError && (
          <div className="error">
            Auto-Fix issue: {auditResult.autoFixError}
          </div>
        )}

        {/* Summary Cards */}

        <div className="autofix-summary-grid">

          <div className="autofix-summary-card analyzed-card">
            <div className="autofix-summary-icon">▤</div>

            <div>
              <p>Pages analyzed</p>
              <strong>{pages.length}</strong>
              <span>Total crawled pages</span>
            </div>
          </div>

          <div className="autofix-summary-card suggestions-card">
            <div className="autofix-summary-icon">✦</div>

            <div>
              <p>Pages with suggestions</p>
              <strong>{pagesWithSuggestions.length}</strong>
              <span>AI recommendations available</span>
            </div>
          </div>

          <div className="autofix-summary-card reviewed-card">
            <div className="autofix-summary-icon">✓</div>

            <div>
              <p>Pages reviewed</p>
              <strong>{reviewedPages.length}</strong>
              <span>Pages marked as reviewed</span>
            </div>
          </div>

        </div>

        {/* Review Progress */}

        <div className="autofix-progress-card">
          <div className="autofix-progress-heading">

            <div>
              <h3>Review progress</h3>
              <p>Track your SEO content review</p>
            </div>

            <strong>{reviewPercentage}%</strong>

          </div>

          <div className="autofix-progress-track">
            <div
              className="autofix-progress-fill"
              style={{ width: `${reviewPercentage}%` }}
            />
          </div>

          <div className="autofix-progress-footer">
            <span>
              {reviewedPages.length} of {pages.length} pages reviewed
            </span>

            <span>
              {Math.max(pages.length - reviewedPages.length, 0)} remaining
            </span>
          </div>
        </div>

        {/* Main Workspace */}

        {pages.length > 0 ? (
          <div className="autofix-workspace">

            {/* Page Navigation */}

            <aside className="autofix-page-list">

              <div className="autofix-list-heading">
                <div>
                  <h3>Analyzed pages</h3>
                  <p>Select a page to review its suggestions</p>
                </div>

                <span className="autofix-page-count">
                  {pages.length}
                </span>
              </div>

              <div className="autofix-page-items">

                {pages.map((page, index) => {
                  const hasSuggestions =
                    page.suggestedTitle ||
                    page.suggestedMetaDescription ||
                    page.suggestedH1

                  const isReviewed = reviewedPages.includes(page.pageUrl)

                  return (
                    <button
                      type="button"
                      key={`${page.pageUrl}-${index}`}
                      className={`autofix-page-item ${
                        selectedAutoFixPage === index ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedAutoFixPage(index)}
                    >
                      <div className="autofix-page-item-top">

                        <span>
                          PAGE {String(index + 1).padStart(2, '0')}
                        </span>

                        {isReviewed ? (
                          <span className="autofix-page-status reviewed-status">
                            ✓ Reviewed
                          </span>
                        ) : (
                          <span
                            className={`autofix-page-status ${
                              hasSuggestions
                                ? 'has-suggestions'
                                : 'no-suggestions'
                            }`}
                          >
                            {hasSuggestions
                              ? 'Suggestions'
                              : 'No suggestions'}
                          </span>
                        )}

                      </div>

                      <strong>{page.pageUrl}</strong>

                      <span className="autofix-page-open">
                        {selectedAutoFixPage === index
                          ? 'Currently selected'
                          : 'View suggestions →'}
                      </span>

                    </button>
                  )
                })}

              </div>
            </aside>

            {/* Selected Page Details */}

            {currentPage && (
              <section className="autofix-detail-panel">

                <div className="autofix-detail-header">

                  <div className="autofix-detail-title">
                    <span className="autofix-page-label">
                      PAGE {String(selectedAutoFixPage + 1).padStart(2, '0')}
                    </span>

                    <h2>SEO Content Review</h2>

                    <a
                      href={currentPage.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="autofix-page-url"
                    >
                      {currentPage.pageUrl} ↗
                    </a>
                  </div>

                  <span
                    className={`autofix-review-status ${
                      isCurrentPageReviewed ? 'reviewed' : 'pending'
                    }`}
                  >
                    {isCurrentPageReviewed
                      ? '✓ Reviewed'
                      : '● Pending review'}
                  </span>

                </div>

                {/* Content Heading */}

                <div className="autofix-section-intro">

                  <div>
                    <h3>Content recommendations</h3>
                    <p>
                      Compare your existing content with the AI suggestions.
                    </p>
                  </div>

                  <span className="autofix-ai-badge">
                    ✦ AI Generated
                  </span>

                </div>

                {/* Suggestions */}

                {currentPage.suggestedTitle ||
                currentPage.suggestedMetaDescription ||
                currentPage.suggestedH1 ? (

                  <div className="autofix-fields">

                    {renderSuggestionField(
                      'SEO Title',
                      currentPage.originalTitle,
                      currentPage.suggestedTitle,
                      `title-${selectedAutoFixPage}`,
                      30,
                      60
                    )}

                    {renderSuggestionField(
                      'Meta Description',
                      currentPage.originalMetaDescription,
                      currentPage.suggestedMetaDescription,
                      `meta-${selectedAutoFixPage}`,
                      70,
                      160
                    )}

                    {renderSuggestionField(
                      'H1 Heading',
                      currentPage.originalH1,
                      currentPage.suggestedH1,
                      `h1-${selectedAutoFixPage}`
                    )}

                  </div>

                ) : (

                  <div className="autofix-empty-suggestion">
                    <span>✦</span>

                    <h3>No AI suggestions available</h3>

                    <p>
                      Gemini did not return suggestions for this page.
                      You can check the original SEO content in the
                      Crawled Pages section.
                    </p>
                  </div>

                )}

                {/* Why These Changes */}

                {currentPage.reason && (
                  <div className="autofix-reason">

                    <div className="autofix-reason-icon">
                      ✦
                    </div>

                    <div>
                      <strong>Why these changes?</strong>
                      <p>{currentPage.reason}</p>
                    </div>

                  </div>
                )}

                {/* Review Actions */}

                <div className="autofix-review-footer">

                  <div>
                    <strong>
                      {isCurrentPageReviewed
                        ? 'This page has been reviewed'
                        : 'Finished reviewing this page?'}
                    </strong>

                    <p>
                      Mark this page as reviewed to track your progress.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`autofix-review-button ${
                      isCurrentPageReviewed ? 'completed' : ''
                    }`}
                    onClick={() => {
                      setReviewedPages((current) =>
                        currentPageKey
                          ? current.includes(currentPageKey)
                            ? current.filter((url) => url !== currentPageKey)
                            : [...current, currentPageKey]
                          : current
                      )
                    }}
                  >
                    {isCurrentPageReviewed
                      ? '✓ Reviewed'
                      : '✓ Mark as reviewed'}
                  </button>

                </div>

                {/* Previous / Next Navigation */}

                <div className="autofix-navigation-actions">

                  <button
                    type="button"
                    disabled={selectedAutoFixPage === 0}
                    onClick={() =>
                      setSelectedAutoFixPage((current) => current - 1)
                    }
                  >
                    ← Previous page
                  </button>

                  <span>
                    {selectedAutoFixPage + 1} / {pages.length}
                  </span>

                  <button
                    type="button"
                    disabled={selectedAutoFixPage === pages.length - 1}
                    onClick={() =>
                      setSelectedAutoFixPage((current) => current + 1)
                    }
                  >
                    Next page →
                  </button>

                </div>

              </section>
            )}

          </div>
        ) : (

          <div className="empty-state">
            <span className="empty-icon">⚡</span>
            <h2>SEO Auto-Fix suggestions unavailable</h2>

            <p>
              {auditResult.autoFixError ||
                'No crawled pages are available for review. Please check the backend response and try another audit.'}
            </p>
          </div>

        )}

        {/* Bottom Note */}

        <div className="autofix-bottom-note">
          <span>ⓘ</span>

          <p>
            AI-generated content should be checked for accuracy before use.
            Copying suggestions does not automatically update your website.
            Your original website content remains unchanged.
          </p>
        </div>

      </section>
    )
  }

  const renderActiveSection = () => {
    if (!auditResult) return null

    switch (activeTab) {
      case 'Overview':
        return renderOverview()
      case 'SEO Metrics':
        return renderMetrics()
      case 'Crawled Pages':
        return renderPages()
      case 'Broken Links':
        return renderBrokenLinks()
      case 'AI Insights':
        return renderAIInsights()
      case 'SEO Auto-Fix':
        return renderSeoAutoFix()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">✦</div>

          <div>
            <h2>SEO Intelligence</h2>
            <span>MARKETING ASSISTANT</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activeTab === item.name ? 'active' : ''
              }`}
              onClick={() => {
                if (auditResult) setActiveTab(item.name)
              }}
              disabled={!auditResult}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-ai-icon">✦</div>
          <strong>AI-powered SEO</strong>

          <p>
            Understand your website. Improve your visibility.
          </p>
        </div>

      </aside>

      <main className="main-area">

        <header className="topbar">

          <div className="breadcrumb-area">
            <span className="breadcrumb">Workspace /</span>
            <strong>{auditResult ? activeTab : 'New Audit'}</strong>
          </div>

          <span className="topbar-status">
            <span className="status-dot" />
            SEO Analysis Platform
          </span>

        </header>

        <div className="content-area">

          <section className="audit-intro">

            <div className="intro-copy">
              <p className="eyebrow">WEBSITE ANALYSIS TOOL</p>

              <h1>Discover your website's SEO health.</h1>

              <p>
                Enter a website URL to analyze SEO performance and
                receive actionable AI recommendations.
              </p>
            </div>

            <div className="audit-form">

              <label htmlFor="websiteUrl">Website URL</label>

              <div className="input-area">

                <span className="url-icon">↗</span>

                <input
                  id="websiteUrl"
                  type="text"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => {
                    setWebsiteUrl(e.target.value)
                    if (error) setError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) handleAudit()
                  }}
                />

                <button onClick={handleAudit} disabled={loading}>
                  {loading ? 'Analyzing...' : '✦  Audit Website'}
                </button>

              </div>

              <p className="form-hint">
                Supports public websites using HTTP or HTTPS.
              </p>

            </div>

          </section>

          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-card">
              <div className="loader" />
              <h3>Analyzing your website...</h3>

              <p>
                Crawling pages, checking SEO metrics and generating
                recommendations. This may take a little time.
              </p>
            </div>
          )}

          {auditResult && !loading && (
            <section className="dashboard-content">
              {renderActiveSection()}
            </section>
          )}

          {!auditResult && !loading && !error && (
            <div className="empty-dashboard">

              <div className="empty-dashboard-icon">⌕</div>

              <h2>Your SEO report will appear here</h2>

              <p>
                Enter a website URL above and start an audit to explore
                detailed SEO results and AI insights.
              </p>

              <div className="feature-chips">
                <span>✓ 5 SEO metrics</span>
                <span>✓ Website crawling</span>
                <span>✦ Gemini AI insights</span>
                <span>⚡ SEO Auto-Fix</span>
              </div>

            </div>
          )}

          <footer className="footer">
            <span>AI Marketing Intelligence Assistant</span>
            <span>Website SEO Analysis · React + ASP.NET Core</span>
          </footer>

        </div>
      </main>
    </div>
  )
}

export default App
