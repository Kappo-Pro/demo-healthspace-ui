/**
 * calculateReadability.test.ts
 *
 * Unit tests for Flesch Reading Ease calculator
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 */

import {
	calculateReadability,
	countMedicalJargon,
	suggestPlainLanguage,
} from './calculateReadability';

describe('calculateReadability', () => {
	it('should calculate readability for simple text', () => {
		const text = 'This is a simple sentence. It is easy to read.';
		const metrics = calculateReadability(text);

		expect(metrics.score).toBeGreaterThan(60); // Should pass threshold
		expect(metrics.passesThreshold).toBe(true);
		expect(metrics.grade).toContain('easy');
		expect(metrics.totalWords).toBe(11);
		expect(metrics.totalSentences).toBe(2);
	});

	it('should calculate readability for plain English (target level)', () => {
		const text =
			'Your posture scan showed forward head posture. This stretch helps correct this by strengthening your neck muscles.';
		const metrics = calculateReadability(text);

		expect(metrics.score).toBeGreaterThanOrEqual(60);
		expect(metrics.passesThreshold).toBe(true);
		expect(metrics.avgWordsPerSentence).toBeLessThan(20); // Target: <20 words per sentence
	});

	it('should fail readability for complex medical text', () => {
		const text =
			'The biomechanical pathology of cervical lordosis, characterized by anterior pelvic tilt and thoracic kyphosis, necessitates comprehensive neuromuscular intervention to ameliorate musculature imbalance and restore proprioceptive awareness through myofascial release techniques.';
		const metrics = calculateReadability(text);

		expect(metrics.score).toBeLessThan(60); // Should fail threshold
		expect(metrics.passesThreshold).toBe(false);
		expect(metrics.grade).toContain('difficult');
	});

	it('should handle empty text', () => {
		const metrics = calculateReadability('');

		expect(metrics.score).toBe(0);
		expect(metrics.passesThreshold).toBe(false);
		expect(metrics.grade).toBe('N/A');
		expect(metrics.totalWords).toBe(0);
	});

	it('should handle single word', () => {
		const metrics = calculateReadability('Hello');

		expect(metrics.totalWords).toBe(1);
		expect(metrics.totalSentences).toBe(1);
	});

	it('should clamp score between 0 and 100', () => {
		// Very easy text (high score)
		const easyText = 'I go. You go. We go. They go.';
		const easyMetrics = calculateReadability(easyText);
		expect(easyMetrics.score).toBeLessThanOrEqual(100);

		// Very complex text (low score)
		const complexText =
			'The epistemological ramifications of phenomenological hermeneutics within poststructuralist discourse necessitate deconstructive methodologies.';
		const complexMetrics = calculateReadability(complexText);
		expect(complexMetrics.score).toBeGreaterThanOrEqual(0);
	});
});

describe('countMedicalJargon', () => {
	it('should count medical jargon terms', () => {
		const text =
			'Cervical lordosis and thoracic kyphosis are common biomechanical issues.';
		const count = countMedicalJargon(text);

		expect(count).toBeGreaterThan(0);
		expect(count).toBeLessThanOrEqual(3); // cervical lordosis, thoracic kyphosis, biomechanical
	});

	it('should be case-insensitive', () => {
		const text1 = 'Cervical Lordosis is common.';
		const text2 = 'cervical lordosis is common.';

		expect(countMedicalJargon(text1)).toBe(countMedicalJargon(text2));
	});

	it('should return 0 for plain language text', () => {
		const text = 'Forward head posture is when your head sits forward.';
		const count = countMedicalJargon(text);

		expect(count).toBe(0);
	});

	it('should handle empty text', () => {
		expect(countMedicalJargon('')).toBe(0);
	});
});

describe('suggestPlainLanguage', () => {
	it('should suggest alternatives for medical terms', () => {
		const text = 'Cervical lordosis and musculature imbalance detected.';
		const suggestions = suggestPlainLanguage(text);

		expect(suggestions.length).toBeGreaterThan(0);
		expect(suggestions[0]).toHaveProperty('term');
		expect(suggestions[0]).toHaveProperty('alternative');
	});

	it('should return empty array for plain language', () => {
		const text = 'Forward head posture and muscle weakness detected.';
		const suggestions = suggestPlainLanguage(text);

		expect(suggestions.length).toBe(0);
	});

	it('should suggest specific alternatives', () => {
		const text = 'Cervical lordosis is present.';
		const suggestions = suggestPlainLanguage(text);

		const cervicalSuggestion = suggestions.find(s =>
			s.term.includes('cervical lordosis'),
		);
		expect(cervicalSuggestion).toBeDefined();
		expect(cervicalSuggestion?.alternative).toBe('forward head posture');
	});

	it('should handle multiple jargon terms', () => {
		const text =
			'Cervical lordosis, thoracic kyphosis, and anterior pelvic tilt detected.';
		const suggestions = suggestPlainLanguage(text);

		expect(suggestions.length).toBeGreaterThanOrEqual(3);
	});
});

describe('Readability Examples (Real-world)', () => {
	it('should pass: Clinical explanation from Story Context', () => {
		const text =
			'Your posture scan showed that your head is positioned 15 degrees forward of your shoulders. This "forward head posture" puts extra strain on your neck muscles. Chin tucks help by strengthening the muscles that support your neck and retraining your head to sit in a more balanced position.';
		const metrics = calculateReadability(text);

		expect(metrics.passesThreshold).toBe(true);
		expect(metrics.score).toBeGreaterThanOrEqual(60);
	});

	it('should pass: Simple benefit statement', () => {
		const text =
			'This stretch helps correct forward head posture. It strengthens your neck muscles.';
		const metrics = calculateReadability(text);

		expect(metrics.passesThreshold).toBe(true);
		expect(metrics.avgSentenceLength).toBeLessThan(10); // Very short sentences
	});

	it('should fail: Medical textbook language', () => {
		const text =
			'The biomechanical pathology manifests as neuromuscular dysfunction secondary to proprioceptive deficits and myofascial restriction patterns.';
		const metrics = calculateReadability(text);

		expect(metrics.passesThreshold).toBe(false);
	});
});
