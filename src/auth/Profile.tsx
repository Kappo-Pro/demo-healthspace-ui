import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '@atoms/Loading';
import { UseAuth } from '@contexts/AuthContext';

function Profile() {
	const { userId } = useParams();
	const { isAuthenticated } = UseAuth();

	useEffect(() => {
		if (isAuthenticated) {
			window.location.replace(
				`${process.env.REACT_APP_ADMIN_HOST}/users/${userId}/profile?url=${window.location.origin}`,
			);
		}
	}, [isAuthenticated, userId]);

	return <Loading />;
}

export default Profile;
