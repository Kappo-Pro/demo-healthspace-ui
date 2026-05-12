import { ReactNode, CSSProperties } from "react";

// eslint-disable-next-line vitalflow/no-hardcoded-colors
type BadgeColorKeys = Exclude<Colors, "white">;

type SizeKeys = "sm" | "md" | "lg" | "xl" | "full"
type Sizes = Record<SizeKeys, string>

type TButtonProps = {
    children?: string | ReactNode
    onClick?: () => void
    color?: BadgeColorKeys
    disabled?: boolean
    size?: SizeKeys
}

// Color style configuration using design system tokens
type ColorStyle = {
    bg: string;
    bgHover: string;
    text: string;
    border?: string;
}

type BadgeColors = Record<BadgeColorKeys, ColorStyle>;

const colors: BadgeColors = {
    // Semantic colors - using design system badge tokens (WCAG AA compliant)
    success: {
        bg: 'var(--badge-bg-success)',
        bgHover: 'var(--color-success-200)',
        text: 'var(--badge-text-success)',
    },
    warning: {
        bg: 'var(--badge-bg-warning)',
        bgHover: 'var(--color-warning-200)',
        text: 'var(--badge-text-warning)',
    },
    error: {
        bg: 'var(--badge-bg-error)',
        bgHover: 'var(--color-error-200)',
        text: 'var(--badge-text-error)',
    },

    // Brand/Primary - using design system badge tokens
    primary: {
        bg: 'var(--badge-bg-brand)',
        bgHover: 'var(--color-purple-200)',
        text: 'var(--badge-text-brand)',
    },
    purple: {
        bg: 'var(--badge-bg-brand)',
        bgHover: 'var(--color-purple-200)',
        text: 'var(--badge-text-brand)',
    },

    // Default/Neutral badges - using design system tokens
    gray: {
        bg: 'var(--badge-bg-default)',
        bgHover: 'var(--color-gray-200)',
        text: 'var(--badge-text-default)',
    },
    black: {
        bg: 'var(--color-gray-900)',
        bgHover: 'var(--color-gray-700)',
        text: 'var(--text-on-dark)',
    },
    "white-bg": {
        bg: 'var(--surface-primary)',
        bgHover: 'var(--color-gray-100)',
        text: 'var(--text-secondary)',
        border: 'var(--border-default)',
    },

    // Extended color palette - using semantic tokens where available
    'gray-blue': {
        bg: 'var(--color-info-100)',
        bgHover: 'var(--color-info-200)',
        text: 'var(--color-info-700)',
    },
    'gray-modern': {
        bg: 'var(--color-gray-100)',
        bgHover: 'var(--color-gray-200)',
        text: 'var(--color-gray-700)',
    },
    'gray-neutral': {
        bg: 'var(--color-gray-100)',
        bgHover: 'var(--color-gray-200)',
        text: 'var(--color-gray-700)',
    },
    'gray-iron': {
        bg: 'var(--color-gray-200)',
        bgHover: 'var(--color-gray-300)',
        text: 'var(--color-gray-800)',
    },
    'gray-true': {
        bg: 'var(--color-gray-200)',
        bgHover: 'var(--color-gray-300)',
        text: 'var(--color-gray-800)',
    },
    'gray-warm': {
        bg: 'var(--color-gray-100)',
        bgHover: 'var(--color-gray-200)',
        text: 'var(--color-gray-700)',
    },
    moss: {
        bg: 'var(--color-success-200)',
        bgHover: 'var(--color-success-300)',
        text: 'var(--color-success-800)',
    },
    'green-light': {
        bg: 'var(--color-success-100)',
        bgHover: 'var(--color-success-200)',
        text: 'var(--color-success-700)',
    },
    green: {
        bg: 'var(--color-success-100)',
        bgHover: 'var(--color-success-200)',
        text: 'var(--color-success-700)',
    },
    teal: {
        bg: 'var(--color-info-100)',
        bgHover: 'var(--color-info-200)',
        text: 'var(--color-info-800)',
    },
    cyan: {
        bg: 'var(--color-info-100)',
        bgHover: 'var(--color-info-200)',
        text: 'var(--color-info-800)',
    },
    'blue-light': {
        bg: 'var(--color-info-100)',
        bgHover: 'var(--color-info-200)',
        text: 'var(--color-info-700)',
    },
    blue: {
        bg: 'var(--color-info-100)',
        bgHover: 'var(--color-info-200)',
        text: 'var(--color-info-700)',
    },
    'blue-dark': {
        bg: 'var(--color-info-200)',
        bgHover: 'var(--color-info-300)',
        text: 'var(--color-info-800)',
    },
    indigo: {
        bg: 'var(--color-purple-100)',
        bgHover: 'var(--color-purple-200)',
        text: 'var(--color-purple-800)',
    },
    violet: {
        bg: 'var(--color-purple-100)',
        bgHover: 'var(--color-purple-200)',
        text: 'var(--color-purple-700)',
    },
    fuchsia: {
        bg: 'var(--color-purple-50)',
        bgHover: 'var(--color-purple-200)',
        text: 'var(--color-purple-700)',
    },
    pink: {
        bg: 'var(--color-error-100)',
        bgHover: 'var(--color-error-200)',
        text: 'var(--color-error-700)',
    },
    rose: {
        bg: 'var(--color-error-100)',
        bgHover: 'var(--color-error-200)',
        text: 'var(--color-error-700)',
    },
    'orange-dark': {
        bg: 'var(--color-orange-100)',
        bgHover: 'var(--color-orange-200)',
        text: 'var(--color-orange-700)',
    },
    orange: {
        bg: 'var(--color-warning-100)',
        bgHover: 'var(--color-warning-200)',
        text: 'var(--color-warning-700)',
    },
    yellow: {
        bg: 'var(--color-warning-100)',
        bgHover: 'var(--color-warning-200)',
        text: 'var(--color-warning-700)',
    },
};

const colorsDisabled: Record<BadgeColorKeys, ColorStyle> = {
    success: {
        bg: 'var(--color-success-50)',
        bgHover: 'var(--color-success-50)',
        text: 'var(--color-success-400)',
    },
    warning: {
        bg: 'var(--color-warning-50)',
        bgHover: 'var(--color-warning-50)',
        text: 'var(--color-warning-400)',
    },
    error: {
        bg: 'var(--color-error-50)',
        bgHover: 'var(--color-error-50)',
        text: 'var(--color-error-400)',
    },
    primary: {
        bg: 'var(--color-purple-50)',
        bgHover: 'var(--color-purple-50)',
        text: 'var(--color-purple-400)',
    },
    purple: {
        bg: 'var(--color-purple-50)',
        bgHover: 'var(--color-purple-50)',
        text: 'var(--color-purple-400)',
    },
    gray: {
        bg: 'var(--color-gray-100)',
        bgHover: 'var(--color-gray-100)',
        text: 'var(--color-gray-400)',
    },
    black: {
        bg: 'var(--color-gray-100)',
        bgHover: 'var(--color-gray-100)',
        text: 'var(--color-gray-400)',
    },
    "white-bg": {
        bg: 'var(--surface-primary)',
        bgHover: 'var(--surface-primary)',
        text: 'var(--text-disabled)',
        border: 'var(--border-disabled)',
    },
    'gray-blue': {
        bg: 'var(--color-info-50)',
        bgHover: 'var(--color-info-50)',
        text: 'var(--color-info-400)',
    },
    'gray-modern': {
        bg: 'var(--color-gray-50)',
        bgHover: 'var(--color-gray-50)',
        text: 'var(--color-gray-400)',
    },
    'gray-neutral': {
        bg: 'var(--color-gray-50)',
        bgHover: 'var(--color-gray-50)',
        text: 'var(--color-gray-400)',
    },
    'gray-iron': {
        bg: 'var(--color-gray-100)',
        bgHover: 'var(--color-gray-100)',
        text: 'var(--color-gray-400)',
    },
    'gray-true': {
        bg: 'var(--color-gray-100)',
        bgHover: 'var(--color-gray-100)',
        text: 'var(--color-gray-400)',
    },
    'gray-warm': {
        bg: 'var(--color-gray-50)',
        bgHover: 'var(--color-gray-50)',
        text: 'var(--color-gray-400)',
    },
    moss: {
        bg: 'var(--color-success-50)',
        bgHover: 'var(--color-success-50)',
        text: 'var(--color-success-400)',
    },
    'green-light': {
        bg: 'var(--color-success-50)',
        bgHover: 'var(--color-success-50)',
        text: 'var(--color-success-400)',
    },
    green: {
        bg: 'var(--color-success-50)',
        bgHover: 'var(--color-success-50)',
        text: 'var(--color-success-400)',
    },
    teal: {
        bg: 'var(--color-info-50)',
        bgHover: 'var(--color-info-50)',
        text: 'var(--color-info-400)',
    },
    cyan: {
        bg: 'var(--color-info-50)',
        bgHover: 'var(--color-info-50)',
        text: 'var(--color-info-400)',
    },
    'blue-light': {
        bg: 'var(--color-info-50)',
        bgHover: 'var(--color-info-50)',
        text: 'var(--color-info-400)',
    },
    blue: {
        bg: 'var(--color-info-50)',
        bgHover: 'var(--color-info-50)',
        text: 'var(--color-info-400)',
    },
    'blue-dark': {
        bg: 'var(--color-info-100)',
        bgHover: 'var(--color-info-100)',
        text: 'var(--color-info-400)',
    },
    indigo: {
        bg: 'var(--color-purple-50)',
        bgHover: 'var(--color-purple-50)',
        text: 'var(--color-purple-400)',
    },
    violet: {
        bg: 'var(--color-purple-50)',
        bgHover: 'var(--color-purple-50)',
        text: 'var(--color-purple-400)',
    },
    fuchsia: {
        bg: 'var(--color-purple-50)',
        bgHover: 'var(--color-purple-50)',
        text: 'var(--color-purple-400)',
    },
    pink: {
        bg: 'var(--color-error-50)',
        bgHover: 'var(--color-error-50)',
        text: 'var(--color-error-400)',
    },
    rose: {
        bg: 'var(--color-error-50)',
        bgHover: 'var(--color-error-50)',
        text: 'var(--color-error-400)',
    },
    'orange-dark': {
        bg: 'var(--color-orange-50)',
        bgHover: 'var(--color-orange-50)',
        text: 'var(--color-orange-400)',
    },
    orange: {
        bg: 'var(--color-warning-50)',
        bgHover: 'var(--color-warning-50)',
        text: 'var(--color-warning-400)',
    },
    yellow: {
        bg: 'var(--color-warning-50)',
        bgHover: 'var(--color-warning-50)',
        text: 'var(--color-warning-400)',
    },
};

const sizes: Sizes = {
    sm: "w-3 h-3 text-sm",
    md: "w-4 h-4 text-sm",
    lg: "w-5 h-5 text-md",
    xl: "w-6 h-6 text-md",
    full: 'w-full p-2'
}

function Badge(props: TButtonProps) {
    const { children, color = 'primary', onClick, disabled = false, size = "md" } = props

    const sizesCss = sizes[size as keyof Sizes]
    const colorStyle = disabled ? colorsDisabled[color as keyof BadgeColors] : colors[color as keyof BadgeColors]

    // Base CSS classes (non-color)
    let css = 'inline-block rounded-full active:shadow-button transition-colors'
    css = `${css} ${sizesCss}`

    // Add border class if border is defined
    if (colorStyle.border) {
        css = `${css} border-2`
    }

    // Inline styles for design system colors
    const inlineStyles: CSSProperties = {
        backgroundColor: colorStyle.bg,
        color: colorStyle.text,
        ...(colorStyle.border && { borderColor: colorStyle.border }),
    };

    return (
        <button
            className={css}
            onClick={onClick}
            disabled={disabled}
            style={inlineStyles}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = colorStyle.bgHover;
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colorStyle.bg;
            }}
        >
            {children}
        </button>
    )
}

export default Badge