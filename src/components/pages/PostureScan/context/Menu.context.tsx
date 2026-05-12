import {
	createContext,
	useContext,
	useState,
	useMemo,
	useCallback,
	PropsWithChildren,
	useEffect,
} from 'react';

interface MenuContextData {
	isMenuOpened: boolean;
	onToggleMenu: () => void;
}

const MenuContext = createContext<MenuContextData>({
	isMenuOpened: false,
	onToggleMenu: () => {},
});

export function MenuProvider({ children }: Readonly<PropsWithChildren>) {
	const [menuOpen, setMenuOpen] = useState(false);

	const onToggleMenu = useCallback(() => {
		setMenuOpen(!menuOpen);
	}, [menuOpen]);

	useEffect(() => {
		() => {
			setMenuOpen(false);
		};
	}, []);

	const values = useMemo(
		() => ({ isMenuOpened: menuOpen, onToggleMenu }),
		[menuOpen, onToggleMenu],
	);

	return <MenuContext.Provider value={values}>{children}</MenuContext.Provider>;
}

export function UseMenu() {
	return useContext(MenuContext);
}
