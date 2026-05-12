import { enhanceNavigationWithBadges, getBadgeColor, BadgeMapping } from '../badgeIntegration';
import { NavigationConfig } from '@components/layouts/AppLayout/types';

describe('badgeIntegration', () => {
  describe('enhanceNavigationWithBadges', () => {
    it('should enhance top-level items with badge counts', () => {
      const config: NavigationConfig = {
        primary: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: null,
            path: '/dashboard',
          },
          {
            id: 'patients',
            label: 'Patients',
            icon: null,
            path: '/patients',
          },
        ],
      };

      const badges: BadgeMapping = {
        'patients': 25,
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.primary[1].badge).toBe(25);
      expect(result.primary[0].badge).toBeUndefined();
    });

    it('should enhance nested children with badge counts', () => {
      const config: NavigationConfig = {
        primary: [
          {
            id: 'patients',
            label: 'Patients',
            icon: null,
            children: [
              {
                id: 'all-patients',
                label: 'All Patients',
                icon: null,
                path: '/patients',
              },
              {
                id: 'new-patients',
                label: 'New Patients',
                icon: null,
                path: '/patients/new',
              },
            ],
          },
        ],
      };

      const badges: BadgeMapping = {
        'all-patients': 25,
        'new-patients': 5,
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.primary[0].children?.[0].badge).toBe(25);
      expect(result.primary[0].children?.[1].badge).toBe(5);
    });

    it('should handle deeply nested navigation items', () => {
      const config: NavigationConfig = {
        primary: [
          {
            id: 'level1',
            label: 'Level 1',
            icon: null,
            children: [
              {
                id: 'level2',
                label: 'Level 2',
                icon: null,
                children: [
                  {
                    id: 'level3',
                    label: 'Level 3',
                    icon: null,
                    path: '/level3',
                  },
                ],
              },
            ],
          },
        ],
      };

      const badges: BadgeMapping = {
        'level3': 10,
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.primary[0].children?.[0].children?.[0].badge).toBe(10);
    });

    it('should preserve existing badges when not in mapping', () => {
      const config: NavigationConfig = {
        primary: [
          {
            id: 'item1',
            label: 'Item 1',
            icon: null,
            badge: 'NEW',
          },
        ],
      };

      const badges: BadgeMapping = {
        'item2': 10, // Different ID
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.primary[0].badge).toBe('NEW'); // Preserved
    });

    it('should override existing badges with mapping values', () => {
      const config: NavigationConfig = {
        primary: [
          {
            id: 'item1',
            label: 'Item 1',
            icon: null,
            badge: 5,
          },
        ],
      };

      const badges: BadgeMapping = {
        'item1': 10, // Override
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.primary[0].badge).toBe(10); // Updated
    });

    it('should handle empty badge values', () => {
      const config: NavigationConfig = {
        primary: [
          {
            id: 'item1',
            label: 'Item 1',
            icon: null,
          },
        ],
      };

      const badges: BadgeMapping = {
        'item1': undefined,
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.primary[0].badge).toBeUndefined();
    });

    it('should handle zero badge counts', () => {
      const config: NavigationConfig = {
        primary: [
          {
            id: 'item1',
            label: 'Item 1',
            icon: null,
          },
        ],
      };

      const badges: BadgeMapping = {
        'item1': 0,
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.primary[0].badge).toBe(0);
    });

    it('should handle footer items', () => {
      const config: NavigationConfig = {
        primary: [],
        footer: [
          {
            id: 'help',
            label: 'Help',
            icon: null,
          },
        ],
      };

      const badges: BadgeMapping = {
        'help': 2,
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.footer?.[0].badge).toBe(2);
    });

    it('should handle missing footer gracefully', () => {
      const config: NavigationConfig = {
        primary: [
          {
            id: 'item1',
            label: 'Item 1',
            icon: null,
          },
        ],
      };

      const badges: BadgeMapping = {
        'item1': 5,
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.footer).toBeUndefined();
      expect(result.primary[0].badge).toBe(5);
    });

    it('should handle empty config', () => {
      const config: NavigationConfig = {
        primary: [],
      };

      const badges: BadgeMapping = {
        'item1': 5,
      };

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.primary).toEqual([]);
    });

    it('should handle empty badges mapping', () => {
      const config: NavigationConfig = {
        primary: [
          {
            id: 'item1',
            label: 'Item 1',
            icon: null,
            badge: 5,
          },
        ],
      };

      const badges: BadgeMapping = {};

      const result = enhanceNavigationWithBadges(config, badges);

      expect(result.primary[0].badge).toBe(5); // Preserved
    });
  });

  describe('getBadgeColor', () => {
    it('should return green for zero count', () => {
      expect(getBadgeColor(0)).toBe('green');
    });

    it('should return blue for low counts', () => {
      expect(getBadgeColor(1)).toBe('blue');
      expect(getBadgeColor(5)).toBe('blue');
      expect(getBadgeColor(9)).toBe('blue');
    });

    it('should return orange for warning threshold', () => {
      expect(getBadgeColor(10)).toBe('orange');
      expect(getBadgeColor(15)).toBe('orange');
      expect(getBadgeColor(19)).toBe('orange');
    });

    it('should return red for danger threshold', () => {
      expect(getBadgeColor(20)).toBe('red');
      expect(getBadgeColor(25)).toBe('red');
      expect(getBadgeColor(100)).toBe('red');
    });

    it('should respect custom warning threshold', () => {
      expect(getBadgeColor(5, { warning: 5, danger: 10 })).toBe('orange');
      expect(getBadgeColor(4, { warning: 5, danger: 10 })).toBe('blue');
    });

    it('should respect custom danger threshold', () => {
      expect(getBadgeColor(10, { warning: 5, danger: 10 })).toBe('red');
      expect(getBadgeColor(9, { warning: 5, danger: 10 })).toBe('orange');
    });

    it('should handle partial threshold overrides', () => {
      expect(getBadgeColor(5, { warning: 5 })).toBe('orange');
      expect(getBadgeColor(20, { warning: 5 })).toBe('red'); // Uses default danger=20
    });

    it('should handle negative counts', () => {
      expect(getBadgeColor(-1)).toBe('green'); // Treated as <= 0
    });
  });
});
