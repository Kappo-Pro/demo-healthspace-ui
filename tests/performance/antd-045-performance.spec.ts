/**
 * ANTD-045 Phase 7: Performance Measurement Tests
 *
 * Tests Core Web Vitals and performance metrics to measure the impact
 * of optimization phases 0-6 (code splitting, lazy loading, image optimization,
 * bundle analysis, tree shaking, and ML library lazy loading).
 *
 * Metrics measured:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - TTI (Time to Interactive)
 * - TBT (Total Blocking Time)
 * - FCP (First Contentful Paint)
 * - Speed Index
 */

import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import * as fs from 'fs';
import * as path from 'path';

// Performance thresholds based on Google's Core Web Vitals recommendations
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  'largest-contentful-paint': 2500, // Good: < 2.5s
  'cumulative-layout-shift': 0.1,    // Good: < 0.1
  'total-blocking-time': 300,        // Good: < 300ms

  // Other important metrics
  'first-contentful-paint': 1800,    // Good: < 1.8s
  'speed-index': 3400,                // Good: < 3.4s
  'interactive': 3800,                // TTI Good: < 3.8s

  // Overall scores (0-100)
  'performance': 70,                  // Minimum acceptable
  'accessibility': 90,
  'best-practices': 80,
  'seo': 90,
};

// Pages to test
const TEST_PAGES = [
  {
    name: 'Login Page',
    url: '/login',
    description: 'Initial load (non-authenticated)',
    expectMLLibraries: false,
  },
  {
    name: 'Patient Dashboard',
    url: '/dashboard',
    description: 'Main dashboard (authenticated, no AI)',
    expectMLLibraries: false,
  },
];

// Results storage
const resultsDir = path.join(__dirname, '../../docs/implementation-reports/4-antd-audit/tickets/phase-6/performance-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

test.describe('ANTD-045 Phase 7: Performance Measurement', () => {

  test.beforeAll(async () => {
    console.log('\n🚀 Starting ANTD-045 Performance Measurement Tests\n');
    console.log('Testing pages:');
    TEST_PAGES.forEach(page => {
      console.log(`  - ${page.name}: ${page.url}`);
    });
    console.log('');
  });

  for (const page of TEST_PAGES) {
    test(`Lighthouse audit: ${page.name}`, async ({ page: browserPage, browserName }) => {
      test.skip(browserName !== 'chromium', 'Lighthouse only works with Chromium');

      console.log(`\n📊 Running Lighthouse audit for: ${page.name}`);
      console.log(`   URL: ${page.url}`);
      console.log(`   Description: ${page.description}`);

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const fullUrl = `${baseUrl}${page.url}`;

      // Navigate to page
      await browserPage.goto(fullUrl, { waitUntil: 'networkidle' });

      // Run Lighthouse audit
      const audit = await playAudit({
        page: browserPage,
        thresholds: {
          performance: PERFORMANCE_THRESHOLDS.performance,
          accessibility: PERFORMANCE_THRESHOLDS.accessibility,
          'best-practices': PERFORMANCE_THRESHOLDS['best-practices'],
          seo: PERFORMANCE_THRESHOLDS.seo,
        },
        reports: {
          formats: {
            html: true,
            json: true,
          },
          name: `${page.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
          directory: resultsDir,
        },
      });

      // Extract metrics
      const metrics = audit.lhr.audits;
      const scores = audit.lhr.categories;

      // Log results
      console.log('\n📈 Performance Metrics:');
      console.log(`   Performance Score: ${scores.performance.score * 100}/100`);
      console.log(`   LCP: ${metrics['largest-contentful-paint'].numericValue.toFixed(0)}ms`);
      console.log(`   FCP: ${metrics['first-contentful-paint'].numericValue.toFixed(0)}ms`);
      console.log(`   TBT: ${metrics['total-blocking-time'].numericValue.toFixed(0)}ms`);
      console.log(`   CLS: ${metrics['cumulative-layout-shift'].numericValue.toFixed(3)}`);
      console.log(`   TTI: ${metrics['interactive'].numericValue.toFixed(0)}ms`);
      console.log(`   Speed Index: ${metrics['speed-index'].numericValue.toFixed(0)}ms`);

      console.log('\n🎯 Other Scores:');
      console.log(`   Accessibility: ${scores.accessibility.score * 100}/100`);
      console.log(`   Best Practices: ${scores['best-practices'].score * 100}/100`);
      console.log(`   SEO: ${scores.seo.score * 100}/100`);

      // Verify Core Web Vitals meet thresholds
      expect(
        metrics['largest-contentful-paint'].numericValue,
        `LCP should be < ${PERFORMANCE_THRESHOLDS['largest-contentful-paint']}ms`
      ).toBeLessThan(PERFORMANCE_THRESHOLDS['largest-contentful-paint']);

      expect(
        metrics['cumulative-layout-shift'].numericValue,
        `CLS should be < ${PERFORMANCE_THRESHOLDS['cumulative-layout-shift']}`
      ).toBeLessThan(PERFORMANCE_THRESHOLDS['cumulative-layout-shift']);

      expect(
        metrics['total-blocking-time'].numericValue,
        `TBT should be < ${PERFORMANCE_THRESHOLDS['total-blocking-time']}ms`
      ).toBeLessThan(PERFORMANCE_THRESHOLDS['total-blocking-time']);

      // Performance score should be acceptable
      expect(
        scores.performance.score * 100,
        'Performance score should meet minimum threshold'
      ).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.performance);

      console.log('\n✅ Lighthouse audit passed!\n');
    });

    test(`Bundle size verification: ${page.name} should not load ML libraries`, async ({ page: browserPage, browserName }) => {
      test.skip(page.expectMLLibraries, 'This page expects ML libraries');

      console.log(`\n📦 Verifying bundle size for: ${page.name}`);

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const fullUrl = `${baseUrl}${page.url}`;

      // Track network requests
      const loadedChunks: string[] = [];
      let totalJSSize = 0;

      browserPage.on('response', async (response) => {
        const url = response.url();
        if (url.includes('.chunk.js') || url.includes('main.') && url.endsWith('.js')) {
          const chunkName = url.split('/').pop() || '';
          loadedChunks.push(chunkName);

          // Try to get size from Content-Length header
          const contentLength = response.headers()['content-length'];
          if (contentLength) {
            totalJSSize += parseInt(contentLength, 10);
          }
        }
      });

      // Navigate to page
      await browserPage.goto(fullUrl, { waitUntil: 'networkidle' });

      // Wait for any additional lazy-loaded chunks
      await browserPage.waitForTimeout(2000);

      console.log(`   Loaded ${loadedChunks.length} JS chunks`);
      console.log(`   Total JS size: ${(totalJSSize / 1024 / 1024).toFixed(2)} MB`);

      // Verify ML library chunks are NOT loaded
      const mlChunkPatterns = ['119.', '8205.', '2458.', '1206.']; // Known ML chunks from Phase 4 & 6
      const loadedMLChunks = loadedChunks.filter(chunk =>
        mlChunkPatterns.some(pattern => chunk.includes(pattern))
      );

      console.log(`   ML chunks loaded: ${loadedMLChunks.length}`);
      if (loadedMLChunks.length > 0) {
        console.log(`   ⚠️  Loaded ML chunks: ${loadedMLChunks.join(', ')}`);
      }

      expect(
        loadedMLChunks.length,
        `${page.name} should not load ML library chunks (MediaPipe/TensorFlow)`
      ).toBe(0);

      // Verify total bundle size is reasonable
      const maxBundleSizeMB = 5; // Should be much less than 12.9 MB (before optimization)
      expect(
        totalJSSize / 1024 / 1024,
        `Total JS size should be < ${maxBundleSizeMB} MB (was 12.9 MB before Phase 6)`
      ).toBeLessThan(maxBundleSizeMB);

      console.log('\n✅ Bundle size verification passed!\n');
    });

    test(`Core Web Vitals: ${page.name}`, async ({ page: browserPage }) => {
      console.log(`\n⚡ Measuring Core Web Vitals for: ${page.name}`);

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const fullUrl = `${baseUrl}${page.url}`;

      // Inject web vitals measurement script
      await browserPage.goto(fullUrl);

      // Measure performance metrics using Performance API
      const metrics = await browserPage.evaluate(() => {
        return new Promise((resolve) => {
          // Wait for page to be fully loaded
          if (document.readyState === 'complete') {
            const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            resolve({
              // Navigation timing
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
              domInteractive: perfData.domInteractive,

              // Resource timing
              resourceCount: performance.getEntriesByType('resource').length,

              // Paint timing
              firstPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime || 0,
            });
          } else {
            window.addEventListener('load', () => {
              const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

              resolve({
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                domInteractive: perfData.domInteractive,
                resourceCount: performance.getEntriesByType('resource').length,
                firstPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime || 0,
              });
            });
          }
        });
      });

      console.log('   Performance API Metrics:');
      console.log(`   DOM Interactive: ${Math.round(metrics.domInteractive)}ms`);
      console.log(`   DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`);
      console.log(`   Load Complete: ${Math.round(metrics.loadComplete)}ms`);
      console.log(`   First Paint: ${Math.round(metrics.firstPaint)}ms`);
      console.log(`   First Contentful Paint: ${Math.round(metrics.firstContentfulPaint)}ms`);
      console.log(`   Resources Loaded: ${metrics.resourceCount}`);

      // Basic assertions
      expect(metrics.domInteractive).toBeGreaterThan(0);
      expect(metrics.firstContentfulPaint).toBeGreaterThan(0);
      expect(metrics.firstContentfulPaint).toBeLessThan(5000); // Should be < 5s

      console.log('\n✅ Core Web Vitals measurement complete!\n');
    });
  }

  test.afterAll(async () => {
    console.log('\n✅ All ANTD-045 Performance Measurement Tests Complete!\n');
    console.log(`📁 Results saved to: ${resultsDir}\n`);
  });
});
