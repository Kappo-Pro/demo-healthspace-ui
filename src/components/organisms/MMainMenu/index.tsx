import AdminMenu from '@atoms/AdminMenu';
import UserMenu from '@atoms/UserMenu';
import { SORT_KEYS, USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getUserReports } from '@stores/content/report/reports';
import { useEffect, useRef } from 'react';
import { Flex } from 'antd';

interface TLayout {
	isAdmin: boolean;
	onClick: (key: string) => void;
	toggleModal: () => void;
}

const MDMainMenu = (props: TLayout) => {
	const { isAdmin, onClick } = props;
	const elementRef = useRef<HTMLDivElement | null>(null);
	const user = useTypedSelector(state => state.user);
	const dispatch = useTypedDispatch();
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);
	const isSuperAdmin = user?.profile?.role === USER_ROLES.SUPER_ADMIN;
	const searchText = useTypedSelector(
		state => state.reports.searchTextForReports,
	);
	useEffect(() => {
		const payload = {
			userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
			limit: 1000,
			page: 1,
			search: searchText,
			sort: SORT_KEYS.CREATED_AT,
		};
		payload?.userId && dispatch(getUserReports(payload));
	}, [user, selectedUser, searchText, dispatch]);

	return (
		<Flex className="relative" ref={elementRef}>
			{isAdmin || isSuperAdmin ? <AdminMenu onClick={onClick} /> : <UserMenu />}
		</Flex>
	);
};

export default MDMainMenu;
