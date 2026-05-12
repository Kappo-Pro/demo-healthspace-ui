import { Menu01 } from '@vitalflow-icons/general/menu01';
import { setCollapsible } from '@stores/shared/patientDetail/patientDetail';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import React from 'react';

const ToggleMenu = () => {
	const dispatch = useTypedDispatch();
	const isCollapsible = useTypedSelector(
		state => state.patientDetail.patientDetail.isCollapsible,
	);

	return (
		<div
			className="cursor-pointer"
			onClick={() => dispatch(setCollapsible(!isCollapsible))}>
			<Menu01 color="stroke-gray-400" />
		</div>
	);
};

export default ToggleMenu;
