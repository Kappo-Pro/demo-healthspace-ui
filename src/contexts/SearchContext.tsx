import {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	useEffect,
	useMemo} from 'react';

interface SearchHandler {
	id: string;
	placeholder: string;
	onSearch: (query: string) => void;
	onClear?: () => void;
	priority?: number; // Higher priority takes precedence
}

interface SearchContextType {
	registerSearchHandler: (handler: SearchHandler) => void;
	unregisterSearchHandler: (id: string) => void;
	activeHandler: SearchHandler | null;
	performSearch: (query: string) => void;
	clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [_handlers, setHandlers] = useState<Map<string, SearchHandler>>(
		new Map(),
	);
	const [activeHandler, setActiveHandler] = useState<SearchHandler | null>(
		null,
	);

	const registerSearchHandler = useCallback((handler: SearchHandler) => {
		setHandlers(prev => {
			const newMap = new Map(prev);
			newMap.set(handler.id, handler);

			// Auto-activate if this is the highest priority handler
			setActiveHandler(current => {
				const shouldActivate =
					!current || (handler.priority || 0) > (current.priority || 0);
				if (shouldActivate) {
					return handler;
				}
				return current;
			});

			return newMap;
		});
	}, []);

	const unregisterSearchHandler = useCallback((id: string) => {
		setHandlers(prev => {
			const newMap = new Map(prev);
			newMap.delete(id);

			setActiveHandler(current => {
				if (current?.id === id) {
					// Find next highest priority handler
					const remaining = Array.from(newMap.values());
					const next =
						remaining.sort(
							(a, b) => (b.priority || 0) - (a.priority || 0),
						)[0] || null;
					return next;
				}
				return current;
			});

			return newMap;
		});
	}, []);

	const performSearch = useCallback(
		(query: string) => {
			activeHandler?.onSearch(query);
		},
		[activeHandler],
	);

	const clearSearch = useCallback(() => {
		activeHandler?.onClear?.();
	}, [activeHandler]);

	const value = useMemo(
		() => ({
			registerSearchHandler,
			unregisterSearchHandler,
			activeHandler,
			performSearch,
			clearSearch,
		}),
		[
			registerSearchHandler,
			unregisterSearchHandler,
			activeHandler,
			performSearch,
			clearSearch,
		],
	);

	return (
		<SearchContext.Provider value={value}>{children}</SearchContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSearchContext = () => {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error('useSearchContext must be used within SearchProvider');
	}
	return context;
};

/**
 * Hook for components to register themselves as search handlers
 * Automatically handles registration/unregistration on mount/unmount
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useSearchHandler = (
	handler: Omit<SearchHandler, 'id'>,
	dependencies: React.DependencyList = [],
) => {
	const { registerSearchHandler, unregisterSearchHandler } = useSearchContext();
	const handlerId = useRef(Math.random().toString(36).substring(2));
	const handlerIdRef = handlerId.current;

	useEffect(() => {
		registerSearchHandler({ ...handler, id: handlerIdRef });
		return () => {
			unregisterSearchHandler(handlerIdRef);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		registerSearchHandler,
		unregisterSearchHandler,
		handlerIdRef,
		...dependencies, // Spread dependencies - dynamic array cannot be statically verified
	]);
};
