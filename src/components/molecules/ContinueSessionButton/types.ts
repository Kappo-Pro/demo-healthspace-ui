/**
 * ContinueSessionButton Component Types
 *
 * Props for the ContinueSessionButton molecule component
 * that allows users to resume their last incomplete rehab session.
 */

export interface ContinueSessionButtonProps {
  /**
   * The name of the program to display in the button label
   * @example "Lower Back Program"
   */
  programName: string;

  /**
   * Unique identifier for the program
   */
  programId: string;

  /**
   * Unique identifier for the session to resume
   */
  sessionId: string;

  /**
   * Optional click handler for testing purposes
   * Navigation logic will be added in EPIC-011-S2
   */
  onClick?: () => void;
}
