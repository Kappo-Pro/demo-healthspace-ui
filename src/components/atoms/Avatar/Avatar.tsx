import React from 'react';
import { Avatar as AntdAvatar } from 'antd';
import { UserWithSession } from '@types';
import { tableDataType } from '@atoms/TableList/TableIterfaces';

interface IUserSession {
	user: UserWithSession | tableDataType;
	size?: number;
}
const Avatar = (props: IUserSession) => {
	const { user, size } = props;
	return (
		<>
			{user?.profile?.imageUrl ? (
				<AntdAvatar
					src={user?.profile?.imageUrl}
					alt="avatar"
					size={size ? size : 35}
				/>
			) : (
				<AntdAvatar
					style={{ backgroundColor: user?.profile?.avatarColor }}
					className="custom-inline-flex"
					alt="avatar"
					size={size ? size : 35}>
					{user?.profile?.firstName
						? user?.profile?.firstName?.charAt(0)?.toUpperCase()
						: 'U'}
				</AntdAvatar>
			)}
		</>
	);
};

export default Avatar;
