/**
 * TrendIndicator Component Examples
 *
 * Visual examples demonstrating all three trend states
 * and percentage formatting.
 */

import React from 'react';
import { TrendIndicator } from './TrendIndicator';

export const TrendIndicatorExamples: React.FC = () => {
  return (
    <div style={{ padding: 'var(--spacing-5)', fontFamily: 'Arial, sans-serif' }}>
      <h2>TrendIndicator Component Examples</h2>

      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <h3>AC-003: Positive Trends (Green, ↑)</h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center' }}>
          <div>
            <div>value={'{5.234}'}</div>
            <TrendIndicator value={5.234} />
          </div>
          <div>
            <div>value={'{12.5}'}</div>
            <TrendIndicator value={12.5} />
          </div>
          <div>
            <div>value={'{0.1}'}</div>
            <TrendIndicator value={0.1} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <h3>AC-004: Negative Trends (Red, ↓)</h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center' }}>
          <div>
            <div>value={'{-3.1}'}</div>
            <TrendIndicator value={-3.1} />
          </div>
          <div>
            <div>value={'{-8.7}'}</div>
            <TrendIndicator value={-8.7} />
          </div>
          <div>
            <div>value={'{-15.234}'}</div>
            <TrendIndicator value={-15.234} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <h3>AC-005: Neutral Trend (Gray, —)</h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center' }}>
          <div>
            <div>value={'{0}'}</div>
            <TrendIndicator value={0} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <h3>AC-006: Decimal Formatting (1 decimal place)</h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center' }}>
          <div>
            <div>value={'{5.234}'} → +5.2%</div>
            <TrendIndicator value={5.234} />
          </div>
          <div>
            <div>value={'{5.678}'} → +5.7%</div>
            <TrendIndicator value={5.678} />
          </div>
          <div>
            <div>value={'{5}'} → +5.0%</div>
            <TrendIndicator value={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendIndicatorExamples;
