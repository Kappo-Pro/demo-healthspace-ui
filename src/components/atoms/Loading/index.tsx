import { Flex, Layout, Spin } from 'antd'
import { Content } from 'antd/lib/layout/layout'

const fullpage = {}
const partialPage = { paddingTop: '50%' }

const Loading = ({ topbar = false }) => {
	return (
		<Layout>
			<Content>
				<Flex
					align="center"
					justify="center"
					className={topbar ? '' : 'min-h-screen'}
					style={topbar ? partialPage : fullpage}
				>
					<Spin size="large"  />
				</Flex>
			</Content>
		</Layout>
	)
}

export default Loading
