/**
 * ContinueSessionButton Component Examples
 *
 * Usage examples for the ContinueSessionButton molecule component
 */

import React from 'react';
import { ContinueSessionButton } from './ContinueSessionButton';
import type { ContinueSessionButtonProps } from './types';

/**
 * Basic usage example
 */
export const BasicExample: React.FC = () => {
  return (
    <div style={{ padding: 'var(--spacing-6)', maxWidth: '400px' }}>
      <ContinueSessionButton
        programName="Lower Back Program"
        programId="123"
        sessionId="456"
      />
    </div>
  );
};

/**
 * Example with click handler
 */
export const WithClickHandler: React.FC = () => {
  const handleClick = () => {
    alert('Continuing session...');
  };

  return (
    <div style={{ padding: 'var(--spacing-6)', maxWidth: '400px' }}>
      <ContinueSessionButton
        programName="Shoulder Mobility Program"
        programId="789"
        sessionId="101112"
        onClick={handleClick}
      />
    </div>
  );
};

/**
 * Example with long program name (will be truncated)
 */
export const LongProgramName: React.FC = () => {
  return (
    <div style={{ padding: 'var(--spacing-6)', maxWidth: '400px' }}>
      <ContinueSessionButton
        programName="Comprehensive Lower Back Pain Relief and Rehabilitation Program"
        programId="456"
        sessionId="789"
      />
    </div>
  );
};

/**
 * Mobile responsive example
 */
export const MobileExample: React.FC = () => {
  return (
    <div style={{ padding: 'var(--spacing-6)', maxWidth: '375px' }}>
      <h3>Mobile View (≤768px)</h3>
      <ContinueSessionButton
        programName="Knee Recovery Program"
        programId="321"
        sessionId="654"
      />
    </div>
  );
};

/**
 * Multiple buttons example
 */
export const MultipleButtons: React.FC = () => {
  const programs: ContinueSessionButtonProps[] = [
    {
      programName: 'Lower Back Program',
      programId: '1',
      sessionId: '101',
    },
    {
      programName: 'Shoulder Mobility',
      programId: '2',
      sessionId: '102',
    },
    {
      programName: 'Knee Recovery',
      programId: '3',
      sessionId: '103',
    },
  ];

  return (
    <div style={{ padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', maxWidth: '400px' }}>
      <h3>Multiple Programs</h3>
      {programs.map((program) => (
        <ContinueSessionButton key={program.programId} {...program} />
      ))}
    </div>
  );
};

/**
 * All examples in a showcase
 */
export const AllExamples: React.FC = () => {
  return (
    <div style={{ padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
      <section>
        <h2>Basic Example</h2>
        <BasicExample />
      </section>

      <section>
        <h2>With Click Handler</h2>
        <WithClickHandler />
      </section>

      <section>
        <h2>Long Program Name (Truncated)</h2>
        <LongProgramName />
      </section>

      <section>
        <h2>Mobile View</h2>
        <MobileExample />
      </section>

      <section>
        <h2>Multiple Buttons</h2>
        <MultipleButtons />
      </section>
    </div>
  );
};

export default AllExamples;
