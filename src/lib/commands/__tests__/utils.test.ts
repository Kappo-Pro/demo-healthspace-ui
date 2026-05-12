/**
 * Validation Utilities Test Suite
 * Story 1.5: Validation & Testing Framework
 *
 * Tests for validateCommand() and type guard functions
 */

import {
  validateCommand,
  isCommand,
  isUserContext,
  isProgramContext,
  isAssessmentContext,
  isReportContext,
  isGlobalContext,
} from '../utils';
import {
  Command,
  CommandContext,
  UserContext,
  ProgramContext,
  AssessmentContext,
  ReportContext,
  GlobalContext,
} from '../types';

describe('Validation Utilities', () => {
  describe('validateCommand()', () => {
    const validCommand: Command = {
      id: 'test-cmd',
      label: 'Test Command',
      availableInContexts: ['global'],
      category: 'navigation',
      handler: jest.fn(),
    };

    it('should not throw for valid command', () => {
      expect(() => validateCommand(validCommand)).not.toThrow();
    });

    it('should throw for null', () => {
      expect(() => validateCommand(null)).toThrow('Command must be a valid object');
    });

    it('should throw for undefined', () => {
      expect(() => validateCommand(undefined)).toThrow('Command must be a valid object');
    });

    it('should throw for non-object', () => {
      expect(() => validateCommand('not-an-object')).toThrow('Command must be a valid object');
      expect(() => validateCommand(123)).toThrow('Command must be a valid object');
    });

    it('should throw for missing id', () => {
      const cmd = { ...validCommand, id: undefined };
      expect(() => validateCommand(cmd)).toThrow('Command must have a valid id');
    });

    it('should throw for empty id', () => {
      const cmd = { ...validCommand, id: '' };
      expect(() => validateCommand(cmd)).toThrow('Command must have a valid id');
    });

    it('should throw for non-string id', () => {
      const cmd = { ...validCommand, id: 123 as unknown as string };
      expect(() => validateCommand(cmd)).toThrow('Command must have a valid id');
    });

    it('should throw for missing label', () => {
      const cmd = { ...validCommand, label: undefined };
      expect(() => validateCommand(cmd)).toThrow('Command must have a valid label');
    });

    it('should throw for empty label', () => {
      const cmd = { ...validCommand, label: '' };
      expect(() => validateCommand(cmd)).toThrow('Command must have a valid label');
    });

    it('should throw for non-string label', () => {
      const cmd = { ...validCommand, label: 123 as unknown as string };
      expect(() => validateCommand(cmd)).toThrow('Command must have a valid label');
    });

    it('should throw for missing availableInContexts', () => {
      const cmd = { ...validCommand, availableInContexts: undefined };
      expect(() => validateCommand(cmd)).toThrow('Command must have at least one context');
    });

    it('should throw for empty availableInContexts array', () => {
      const cmd = { ...validCommand, availableInContexts: [] };
      expect(() => validateCommand(cmd)).toThrow('Command must have at least one context');
    });

    it('should throw for non-array availableInContexts', () => {
      const cmd = { ...validCommand, availableInContexts: 'global' as unknown as string[] };
      expect(() => validateCommand(cmd)).toThrow('Command must have at least one context');
    });

    it('should throw for missing category', () => {
      const cmd = { ...validCommand, category: undefined };
      expect(() => validateCommand(cmd)).toThrow('Command must have a valid category');
    });

    it('should throw for empty category', () => {
      const cmd = { ...validCommand, category: '' };
      expect(() => validateCommand(cmd)).toThrow('Command must have a valid category');
    });

    it('should throw for non-string category', () => {
      const cmd = { ...validCommand, category: 123 as unknown as string };
      expect(() => validateCommand(cmd)).toThrow('Command must have a valid category');
    });

    it('should throw for missing handler', () => {
      const cmd = { ...validCommand, handler: undefined };
      expect(() => validateCommand(cmd)).toThrow('Command must have a handler function');
    });

    it('should throw for non-function handler', () => {
      const cmd = { ...validCommand, handler: 'not-a-function' as unknown as () => void };
      expect(() => validateCommand(cmd)).toThrow('Command must have a handler function');
    });

    it('should throw for null handler', () => {
      const cmd = { ...validCommand, handler: null as unknown as () => void };
      expect(() => validateCommand(cmd)).toThrow('Command must have a handler function');
    });
  });

  describe('isCommand()', () => {
    const validCommand: Command = {
      id: 'test-cmd',
      label: 'Test Command',
      availableInContexts: ['global'],
      category: 'navigation',
      handler: jest.fn(),
    };

    it('should return true for valid command', () => {
      expect(isCommand(validCommand)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isCommand(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isCommand(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isCommand('not-an-object')).toBe(false);
      expect(isCommand(123)).toBe(false);
      expect(isCommand(true)).toBe(false);
    });

    it('should return false for missing id', () => {
      const cmd = { ...validCommand, id: undefined };
      expect(isCommand(cmd)).toBe(false);
    });

    it('should return false for empty id', () => {
      const cmd = { ...validCommand, id: '' };
      expect(isCommand(cmd)).toBe(false);
    });

    it('should return false for missing label', () => {
      const cmd = { ...validCommand, label: undefined };
      expect(isCommand(cmd)).toBe(false);
    });

    it('should return false for empty availableInContexts', () => {
      const cmd = { ...validCommand, availableInContexts: [] };
      expect(isCommand(cmd)).toBe(false);
    });

    it('should return false for missing category', () => {
      const cmd = { ...validCommand, category: undefined };
      expect(isCommand(cmd)).toBe(false);
    });

    it('should return false for missing handler', () => {
      const cmd = { ...validCommand, handler: undefined };
      expect(isCommand(cmd)).toBe(false);
    });

    it('should return false for non-function handler', () => {
      const cmd = { ...validCommand, handler: 'not-a-function' as unknown as () => void };
      expect(isCommand(cmd)).toBe(false);
    });

    it('should return true for command with optional fields', () => {
      const cmdWithOptionals: Command = {
        ...validCommand,
        description: 'Optional description',
        shortcut: 'g h',
        icon: 'home-icon',
        allowedRoles: ['admin'],
        keywords: ['go', 'home'],
        enabled: true,
        hidden: false,
        priority: 100,
        closeOnExecute: true,
        badge: '5',
        badgeColor: 'blue',
      };
      expect(isCommand(cmdWithOptionals)).toBe(true);
    });
  });

  describe('Context Type Guards', () => {
    const globalContext: GlobalContext = {
      type: 'global',
      userId: 'user-123',
      userRole: 'admin',
    };

    const userContext: UserContext = {
      type: 'user',
      userId: 'user-123',
      userName: 'John Doe',
      userRole: 'admin',
    };

    const programContext: ProgramContext = {
      type: 'program',
      programId: 'prog-456',
      programName: 'PT Program',
    };

    const assessmentContext: AssessmentContext = {
      type: 'assessment',
      assessmentId: 'assess-789',
      assessmentType: 'rom',
    };

    const reportContext: ReportContext = {
      type: 'report',
      reportId: 'report-101',
      patientId: 'patient-202',
    };

    describe('isGlobalContext()', () => {
      it('should return true for GlobalContext', () => {
        expect(isGlobalContext(globalContext)).toBe(true);
      });

      it('should return false for other contexts', () => {
        expect(isGlobalContext(userContext)).toBe(false);
        expect(isGlobalContext(programContext)).toBe(false);
        expect(isGlobalContext(assessmentContext)).toBe(false);
        expect(isGlobalContext(reportContext)).toBe(false);
      });
    });

    describe('isUserContext()', () => {
      it('should return true for UserContext', () => {
        expect(isUserContext(userContext)).toBe(true);
      });

      it('should return false for other contexts', () => {
        expect(isUserContext(globalContext)).toBe(false);
        expect(isUserContext(programContext)).toBe(false);
        expect(isUserContext(assessmentContext)).toBe(false);
        expect(isUserContext(reportContext)).toBe(false);
      });

      it('should narrow type to UserContext', () => {
        const ctx: CommandContext = userContext;
        if (isUserContext(ctx)) {
          // TypeScript should know ctx is UserContext here
          expect(ctx.userId).toBe('user-123');
          expect(ctx.userName).toBe('John Doe');
        }
      });
    });

    describe('isProgramContext()', () => {
      it('should return true for ProgramContext', () => {
        expect(isProgramContext(programContext)).toBe(true);
      });

      it('should return false for other contexts', () => {
        expect(isProgramContext(globalContext)).toBe(false);
        expect(isProgramContext(userContext)).toBe(false);
        expect(isProgramContext(assessmentContext)).toBe(false);
        expect(isProgramContext(reportContext)).toBe(false);
      });

      it('should narrow type to ProgramContext', () => {
        const ctx: CommandContext = programContext;
        if (isProgramContext(ctx)) {
          // TypeScript should know ctx is ProgramContext here
          expect(ctx.programId).toBe('prog-456');
          expect(ctx.programName).toBe('PT Program');
        }
      });
    });

    describe('isAssessmentContext()', () => {
      it('should return true for AssessmentContext', () => {
        expect(isAssessmentContext(assessmentContext)).toBe(true);
      });

      it('should return false for other contexts', () => {
        expect(isAssessmentContext(globalContext)).toBe(false);
        expect(isAssessmentContext(userContext)).toBe(false);
        expect(isAssessmentContext(programContext)).toBe(false);
        expect(isAssessmentContext(reportContext)).toBe(false);
      });

      it('should narrow type to AssessmentContext', () => {
        const ctx: CommandContext = assessmentContext;
        if (isAssessmentContext(ctx)) {
          // TypeScript should know ctx is AssessmentContext here
          expect(ctx.assessmentId).toBe('assess-789');
          expect(ctx.assessmentType).toBe('rom');
        }
      });
    });

    describe('isReportContext()', () => {
      it('should return true for ReportContext', () => {
        expect(isReportContext(reportContext)).toBe(true);
      });

      it('should return false for other contexts', () => {
        expect(isReportContext(globalContext)).toBe(false);
        expect(isReportContext(userContext)).toBe(false);
        expect(isReportContext(programContext)).toBe(false);
        expect(isReportContext(assessmentContext)).toBe(false);
      });

      it('should narrow type to ReportContext', () => {
        const ctx: CommandContext = reportContext;
        if (isReportContext(ctx)) {
          // TypeScript should know ctx is ReportContext here
          expect(ctx.reportId).toBe('report-101');
          expect(ctx.patientId).toBe('patient-202');
        }
      });
    });
  });
});
