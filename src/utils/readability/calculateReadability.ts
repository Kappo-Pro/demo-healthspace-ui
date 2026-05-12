/**
 * calculateReadability.ts
 *
 * Flesch Reading Ease calculator for clinical content readability
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 *
 * Flesch Reading Ease Formula:
 * 206.835 - 1.015 × (total words / total sentences) - 84.6 × (total syllables / total words)
 *
 * Score Interpretation:
 * - 90-100: Very easy (5th grade)
 * - 60-70: Plain English (8th-9th grade) ← TARGET for clinical content
 * - 50-60: Fairly difficult (10th-12th grade)
 * - 0-30: Very difficult (college graduate)
 */

/**
 * Count syllables in a word using vowel groups
 */
function countSyllables(word: string): number {
	word = word.toLowerCase().trim();

	// Handle empty or very short words
	if (word.length <= 2) return 1;

	// Remove trailing 'e' if present (silent e)
	if (word.endsWith('e')) {
		word = word.slice(0, -1);
	}

	// Count vowel groups (consecutive vowels count as one syllable)
	const vowelGroups = word.match(/[aeiouy]+/g);
	const syllableCount = vowelGroups ? vowelGroups.length : 1;

	// Ensure at least 1 syllable
	return Math.max(syllableCount, 1);
}

/**
 * Count sentences in text
 * Looks for sentence-ending punctuation: . ! ?
 */
function countSentences(text: string): number {
	// Match sentence-ending punctuation
	const sentencePattern = /[.!?]+/g;
	const matches = text.match(sentencePattern);

	// Ensure at least 1 sentence
	return Math.max(matches ? matches.length : 1, 1);
}

/**
 * Count words in text
 * Splits on whitespace and filters empty strings
 */
function countWords(text: string): number {
	const words = text
		.trim()
		.split(/\s+/)
		.filter(word => word.length > 0);

	return Math.max(words.length, 1);
}

/**
 * Count total syllables in text
 */
function countTotalSyllables(text: string): number {
	const words = text
		.trim()
		.split(/\s+/)
		.filter(word => word.length > 0);

	return words.reduce((total, word) => {
		// Remove punctuation
		const cleanWord = word.replace(/[^\w]/g, '');
		return total + countSyllables(cleanWord);
	}, 0);
}

export interface ReadabilityMetrics {
	score: number; // Flesch Reading Ease score (0-100)
	grade: string; // Reading level description
	totalWords: number;
	totalSentences: number;
	totalSyllables: number;
	avgWordsPerSentence: number;
	avgSyllablesPerWord: number;
	passesThreshold: boolean; // True if score >= 60
}

/**
 * Calculate Flesch Reading Ease score and related metrics
 *
 * @param text - Text content to analyze
 * @returns ReadabilityMetrics object with score and details
 *
 * @example
 * ```ts
 * const metrics = calculateReadability(
 *   "This stretch helps correct forward head posture. It strengthens neck muscles."
 * );
 *  // ~85 (plain English)
 *  // true
 * ```
 */
export function calculateReadability(text: string): ReadabilityMetrics {
	if (!text || text.trim().length === 0) {
		return {
			score: 0,
			grade: 'N/A',
			totalWords: 0,
			totalSentences: 0,
			totalSyllables: 0,
			avgWordsPerSentence: 0,
			avgSyllablesPerWord: 0,
			passesThreshold: false,
		};
	}

	const totalWords = countWords(text);
	const totalSentences = countSentences(text);
	const totalSyllables = countTotalSyllables(text);

	const avgWordsPerSentence = totalWords / totalSentences;
	const avgSyllablesPerWord = totalSyllables / totalWords;

	// Flesch Reading Ease formula
	const score =
		206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

	// Clamp score between 0 and 100
	const clampedScore = Math.max(0, Math.min(100, score));

	// Determine grade level
	let grade: string;
	if (clampedScore >= 90) {
		grade = 'Very easy (5th grade)';
	} else if (clampedScore >= 80) {
		grade = 'Easy (6th grade)';
	} else if (clampedScore >= 70) {
		grade = 'Fairly easy (7th grade)';
	} else if (clampedScore >= 60) {
		grade = 'Plain English (8th-9th grade)';
	} else if (clampedScore >= 50) {
		grade = 'Fairly difficult (10th-12th grade)';
	} else if (clampedScore >= 30) {
		grade = 'Difficult (college level)';
	} else {
		grade = 'Very difficult (graduate level)';
	}

	return {
		score: Math.round(clampedScore * 10) / 10, // Round to 1 decimal
		grade,
		totalWords,
		totalSentences,
		totalSyllables,
		avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
		avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
		passesThreshold: clampedScore >= 60,
	};
}

/**
 * Common medical jargon terms to watch for
 */
export const MEDICAL_JARGON: string[] = [
	'cervical lordosis',
	'thoracic kyphosis',
	'lumbar lordosis',
	'anterior pelvic tilt',
	'posterior pelvic tilt',
	'musculature imbalance',
	'proprioceptive awareness',
	'biomechanical',
	'pathology',
	'etiology',
	'contraindication',
	'comorbidity',
	'myofascial',
	'neuromuscular',
];

/**
 * Count medical jargon terms in text
 *
 * @param text - Text to analyze
 * @returns Count of medical jargon terms found
 */
export function countMedicalJargon(text: string): number {
	const lowerText = text.toLowerCase();
	return MEDICAL_JARGON.filter(term => lowerText.includes(term)).length;
}

/**
 * Plain language alternatives for medical terms
 */
export const PLAIN_LANGUAGE_MAP: Record<string, string> = {
	'cervical lordosis': 'forward head posture',
	'thoracic kyphosis': 'rounded upper back',
	'lumbar lordosis': 'lower back curve',
	'anterior pelvic tilt': 'forward pelvic tilt',
	'posterior pelvic tilt': 'backward pelvic tilt',
	'musculature imbalance': 'muscle weakness',
	'proprioceptive awareness': 'body awareness',
	biomechanical: 'movement-related',
	pathology: 'condition',
	etiology: 'cause',
	contraindication: 'reason to avoid',
	comorbidity: 'related condition',
	myofascial: 'muscle and tissue',
	neuromuscular: 'nerve and muscle',
};

/**
 * Suggest plain language alternatives for medical jargon
 *
 * @param text - Text to analyze
 * @returns Array of suggestions with original term and plain alternative
 */
export function suggestPlainLanguage(
	text: string,
): Array<{ term: string; alternative: string }> {
	const lowerText = text.toLowerCase();
	const suggestions: Array<{ term: string; alternative: string }> = [];

	MEDICAL_JARGON.forEach(term => {
		if (lowerText.includes(term) && PLAIN_LANGUAGE_MAP[term]) {
			suggestions.push({
				term,
				alternative: PLAIN_LANGUAGE_MAP[term],
			});
		}
	});

	return suggestions;
}
