/* eslint-disable react-refresh/only-export-components */
/**
 * Logo Components - Usage Examples
 *
 * This file demonstrates common usage patterns for the Logo components.
 * These examples can be used as references or adapted for your use case.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Flex, Space, Typography } from 'antd';

const { Title } = Typography;
import { Logo, LogoIcon, LogoWordmark } from './Logo';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

// =============================================================================
// Example 1: Basic Header with Full Logo
// =============================================================================

export function BasicHeader() {
  return (
    <header style={{ padding: 'var(--spacing-5)', backgroundcolor: 'var(--text-on-dark)', borderBottom: '1px solid var(--color-gray-200)' }}>
      <Logo width={200} />
    </header>
  );
}

// =============================================================================
// Example 2: Responsive Header (Desktop Full Logo, Mobile Icon)
// =============================================================================

export function ResponsiveHeader() {
  return (
    <header className="header">
      <style>{`
        .desktop-logo { display: block; }
        .mobile-logo { display: none; }

        @media (max-width: 768px) {
          .desktop-logo { display: none; }
          .mobile-logo { display: block; }
        }
      `}</style>

      <div className="desktop-logo">
        <Logo width={250} />
      </div>

      <div className="mobile-logo">
        <LogoIcon size={48} />
      </div>
    </header>
  );
}

// =============================================================================
// Example 3: Clickable Navigation Logo
// =============================================================================

export function NavigationLogo() {
  const navigate = useNavigate();
  const { t } = useTypedTranslation();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <Logo
      width={200}
      onClick={handleLogoClick}
      className="cursor-pointer"
      alt={t('examples.logo.returnToHomepage')}
    />
  );
}

// =============================================================================
// Example 4: Dark Background with White Logo
// =============================================================================

export function DarkHeroSection() {
  return (
    <section
      style={{
        backgroundColor: 'var(--color-gray-900)',
        color: 'var(--color-text-inverse)',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      {/* eslint-disable-next-line vitalflow/no-hardcoded-colors */}
      <LogoWordmark wordmarkStyle="mono" theme="white" width={250} />
      <h1 style={{ marginTop: 'var(--spacing-5)', color: 'var(--color-text-inverse)' }}>
        Welcome to VitalFlow
      </h1>
    </section>
  );
}

// =============================================================================
// Example 5: Logo Icon as Avatar
// =============================================================================

export function CompanyAvatar() {
  return (
    <Space>
      <Avatar size={32} src={<LogoIcon size={32} />} />
      <Avatar size={48} src={<LogoIcon size={48} />} />
      <Avatar size={64} src={<LogoIcon size={64} />} />
      <Avatar size={128} src={<LogoIcon size={128} />} />
    </Space>
  );
}

// =============================================================================
// Example 6: Logo Variants Showcase
// =============================================================================

export function LogoShowcase() {
  const { t } = useTypedTranslation();

  return (
    <div style={{ padding: 'var(--spacing-10)' }}>
      <Title level={2}>{t('examples.logo.logoVariants')}</Title>

      <Card title={t('examples.logo.fullHorizontalColor')} style={{ marginBottom: 'var(--spacing-5)' }}>
        <Space direction="vertical" size="large">
          <div>
            <p>{t('examples.logo.lightTheme')}</p>
            <Logo logoStyle="color" theme="light" width={300} />
          </div>
          <div>
            <p>{t('examples.logo.darkTheme')}</p>
            <div style={{ backgroundColor: 'var(--color-gray-900)', padding: 'var(--spacing-5)' }}>
              <Logo logoStyle="color" theme="dark" width={300} />
            </div>
          </div>
        </Space>
      </Card>

      <Card title={t('examples.logo.icons')} style={{ marginBottom: 'var(--spacing-5)' }}>
        <Space size="large">
          <LogoIcon size={32} />
          <LogoIcon size={48} />
          <LogoIcon size={64} />
          <LogoIcon size={128} />
        </Space>
      </Card>

      <Card title={t('examples.logo.wordmarks')} style={{ marginBottom: 'var(--spacing-5)' }}>
        <Space direction="vertical" size="large">
          <div>
            <p>{t('examples.logo.colorLight')}</p>
            <LogoWordmark wordmarkStyle="color" theme="light" width={200} />
          </div>
          <div style={{ backgroundColor: 'var(--color-gray-900)', padding: 'var(--spacing-5)' }}>
            <p style={{ color: 'var(--color-text-inverse)' }}>{t('examples.logo.monoWhite')}</p>
            {/* eslint-disable-next-line vitalflow/no-hardcoded-colors */}
            <LogoWordmark wordmarkStyle="mono" theme="white" width={200} />
          </div>
        </Space>
      </Card>
    </div>
  );
}

// =============================================================================
// Example 7: Loading Placeholder
// =============================================================================

export function LoadingScreen() {
  return (
    <Flex
      justify="center"
      align="center"
      style={{
        height: '100vh',
        backgroundColor: 'var(--color-gray-100)' }}
    >
      <div className="text-center">
        <LogoIcon size={128} />
        <p style={{ marginTop: 'var(--spacing-5)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          Loading...
        </p>
      </div>
    </Flex>
  );
}

// =============================================================================
// Example 8: Footer Branding
// =============================================================================

export function BrandedFooter() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-gray-900)',
        color: 'var(--text-on-dark)',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      {/* eslint-disable-next-line vitalflow/no-hardcoded-colors */}
      <LogoWordmark wordmarkStyle="mono" theme="white" width={180} />
      <p style={{ marginTop: 'var(--spacing-5)', color: 'var(--text-secondary)' }}>
        © 2025 VitalFlow. All rights reserved.
      </p>
    </footer>
  );
}

// =============================================================================
// Example 9: Email Signature (PNG for compatibility)
// =============================================================================

export function EmailSignature() {
  const { t } = useTypedTranslation();

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-gray-900)',
      }}
    >
      <Logo format="png" width={200} retina={true} />
      <p style={{ marginTop: 'var(--spacing-2-5)', marginBottom: '5px' }}>
        <strong>{t('examples.logo.johnDoe')}</strong>
      </p>
      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
        {t('examples.logo.productManager')}
      </p>
    </div>
  );
}

// =============================================================================
// Example 10: Multi-Theme Support
// =============================================================================

export function ThemeAwareLogo() {
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark'>('light');
  const { t } = useTypedTranslation();

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div
      style={{
        backgroundColor: currentTheme === 'light' ? 'var(--surface-primary)' : 'var(--color-gray-900)',
        padding: 'var(--spacing-10)',
        minHeight: '300px',
        transition: 'background-color 0.3s',
      }}
    >
      <Logo width={250} theme={currentTheme} />
      <button
        onClick={toggleTheme}
        style={{
          marginTop: 'var(--spacing-5)',
          padding: '10px 20px',
          cursor: 'pointer',
        }}
      >
        {t('examples.logo.toggleTheme')}
      </button>
    </div>
  );
}

// =============================================================================
// Example 11: Logo Grid (All Variants)
// =============================================================================

export function LogoGrid() {
  const { t } = useTypedTranslation();

  return (
    <div className="grid" style={{ padding: 'var(--spacing-10)' }}>
      <Flex vertical gap={40}>
        <div>
          <Title level={3}>{t('examples.logo.fullLogos')}</Title>
          <Space direction="vertical" size="large" className="w-full">
            <Logo logoStyle="color" theme="light" width={300} />
            <Logo logoStyle="mono" theme="dark" width={300} />
          </Space>
        </div>

        <div>
          <Title level={3}>{t('examples.logo.iconsVariousSizes')}</Title>
          <Space size="large" align="center">
            {[16, 32, 48, 64, 128].map((size) => (
              <div key={size} className="text-center">
                <LogoIcon size={size as unknown} />
                <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)' }}>{size}px</p>
              </div>
            ))}
          </Space>
        </div>

        <div>
          <Title level={3}>{t('examples.logo.wordmarks')}</Title>
          <Space direction="vertical" size="large" className="w-full">
            <LogoWordmark wordmarkStyle="color" theme="light" width={200} />
            <div style={{ backgroundColor: 'var(--color-gray-900)', padding: 'var(--spacing-5)' }}>
              {/* eslint-disable-next-line vitalflow/no-hardcoded-colors */}
              <LogoWordmark wordmarkStyle="mono" theme="white" width={200} />
            </div>
          </Space>
        </div>
      </Flex>
    </div>
  );
}

// =============================================================================
// Example 12: Card with Logo
// =============================================================================

export function CompanyCard() {
  const { t } = useTypedTranslation();

  return (
    <Card
      style={{ width: 300 }}
      cover={
        <div style={{ padding: 'var(--spacing-10)', backgroundColor: 'var(--color-gray-100)', textAlign: 'center' }}>
          <LogoIcon size={128} />
        </div>
      }
    >
      <Card.Meta
        title={t('examples.logo.vitalflow')}
        description={t('examples.logo.description')}
      />
    </Card>
  );
}

// =============================================================================
// Export all examples for easy testing
// =============================================================================

export const examples = {
  BasicHeader,
  ResponsiveHeader,
  NavigationLogo,
  DarkHeroSection,
  CompanyAvatar,
  LogoShowcase,
  LoadingScreen,
  BrandedFooter,
  EmailSignature,
  ThemeAwareLogo,
  LogoGrid,
  CompanyCard,
};

export default examples;
