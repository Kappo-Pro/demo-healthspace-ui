import { useEffect, useState } from 'react';
import { UntitledIcon } from '@atoms/Icon';
import { Button, Card, Checkbox, Dropdown, Flex, message, Popover, Typography } from 'antd';
import type { MenuProps } from 'antd';

const { Paragraph } = Typography;
import { useTheme } from '@providers/ThemeProvider';

import { postTheme } from '@stores/shared/settings/settings';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { THEME } from '@stores/constants';

const themeColors = {
	default: 'var(--brand-primary)',
	dark: 'var(--color-gray-900)',
};

const themes = [
	{ name: THEME.DEFAULT, file: '/assets/default.svg', color: 'var(--brand-primary)' },
	{ name: THEME.DARK, file: '/assets/dark.svg', color: 'var(--color-gray-900)' },
];

const ThemeSelector = ({
	isSettings,
	setProfileDropdownVisible,
	setProfileMenuOpen,
}: {
	isSettings?: boolean;
	setProfileDropdownVisible?:
		| ((value: boolean) => void | undefined)
		| undefined;
	setProfileMenuOpen?: ((value: boolean) => void | undefined) | undefined;
}) => {
	const { setTheme: setThemeProvider } = useTheme();
	const { t } = useTranslation();
	const getThemeDetails = useTypedSelector(
		state => state.settings.appearance.theme,
	);
	const [theme, setTheme] = useState('');
	const [selectedTheme, setSelectedTheme] = useState(getThemeDetails.name);
	const dispatch = useTypedDispatch();
	const [isLocked, setLocked] = useState(false);
	const handleThemeChange = async (value: string) => {
		setTheme(value);
		setThemeProvider(value as 'light' | 'dark' | 'default' | 'vibrant' | 'system');
		const payload = {
			name: value,
			locked: isLocked,
		};
		if (isSettings) {
			await dispatch(postTheme(payload));
			message.success(
				t('Admin.data.theme.themeChanged')
			);
		}

	};

	useEffect(() => {
		const theme =
			getThemeDetails?.name || Cookies?.get('theme') || THEME.DEFAULT;
		setTheme(theme);
		setLocked(getThemeDetails.locked);
	}, [getThemeDetails]);

	const healthStatus = () => {
		const menuItems: MenuProps['items'] = Object.entries(themeColors).map(([status, color]) => {
			const isActive = theme === status;
			return {
				key: status,
				label: (
					<Flex align="center" gap={8} className="hover:text-black">
						<span
							className="hover:bg-slate-200 inline-block" style={{
								width: 'var(--spacing-5)',
								height: 'var(--spacing-5)',
								borderRadius: 'var(--radius-full)',
								backgroundColor: color,
								marginTop: 'var(--spacing-1-5)' }}
						/>
						<span>
							{status.charAt(0).toUpperCase() + status.slice(1)}
						</span>
					</Flex>
				),
				onClick: () => {
					handleThemeChange(status);
					setProfileDropdownVisible?.(false);
					setProfileMenuOpen?.(false);
				},
				className: isActive ? 'bg-gray-100' : '',
				style: { color: isActive ? 'var(--text-color-root)' : '' },
			};
		});

		return (
			<Flex justify="space-between" align="center">
				<div className="align-middle mt-[0.20rem] pr-2">
					<Popover placement="right" showArrow={false}>
						<Dropdown
							menu={{
								items: menuItems,
								onMouseLeave: () => {
									setProfileDropdownVisible?.(false);
								},
							}}
							placement="right"
							trigger={['hover']}
							onOpenChange={visible => {
								setProfileDropdownVisible?.(visible);
							}}
							overlayStyle={{
								position: 'absolute',
								left: '210px',
							}}
							dropdownRender={(menu) => (
								<Flex align="center" justify="center" className="custom-dropdown-menu-sidebar">
									<div
										style={{
											right: '95.9%',
											position: 'absolute',
										}}>
										{<UntitledIcon name="chevronLeft" size={16} />}
									</div>
									<div>
										<Paragraph className="p-2 font-semibold">
											{t('Admin.data.theme.changeTheme')}
										</Paragraph>
										<hr />
										{menu}
									</div>
								</Flex>
							)}>
							<Paragraph>{t('Admin.data.theme.applyTheme')}</Paragraph>
						</Dropdown>
					</Popover>
				</div>
			</Flex>
		);
	};

	return (
		<>
			{isSettings ? (
				<div className="mt-5 text-center">
					<Flex gap={20} justify="center">
						{themes.map(item => (
							<>
								<Card
									key={item.name}
									onClick={() => {
										setSelectedTheme(item.name);
										document.documentElement.setAttribute(
											'data-theme',
											item.name,
										);
									}}
									className="theme-card"
									style={{
										border:
											selectedTheme === item.name
												? `2px solid ${item.color}`
												: '1px solid var(--color-gray-300)',
										borderRadius: '10px',
										cursor: 'pointer',
										padding: 'var(--spacing-0-5)',
										textAlign: 'center',
									}}>
									<img
										src={item.file}
										alt={item.name}
										className="w-full"
									/>
									<p
										className="mt-2"
										style={{
											fontWeight:
												selectedTheme === item.name ? 'bold' : 'normal',
										}}>
										{item.name.charAt(0).toUpperCase() + item.name.slice(1)}
									</p>
								</Card>
							</>
						))}
					</Flex>
					<Flex align="center" justify="center" gap={8} className="mt-4">
						<Checkbox checked={isLocked} onClick={() => setLocked(!isLocked)} />
						<Paragraph>{t('Admin.data.theme.blockUser')}</Paragraph>
					</Flex>
					<Flex gap={8} align="center" justify="center">
						<Button
							className="mt-2.5"
							style={{
								backgroundColor: 'var(--settings-button-bg-color)',
								color: 'var(--settings-button-text-color)',
								border: 'none'
							}}
							onClick={() => handleThemeChange(selectedTheme)}>
							{t('Admin.data.menu.patientDetail.aiAssistantPrograms.save')}
						</Button>
					</Flex>
				</div>
			) : (
				<Flex
					align="center"
					gap={10}
					justify="center">
					{healthStatus()}
				</Flex>
			)}
		</>
	);
};

export default ThemeSelector;
