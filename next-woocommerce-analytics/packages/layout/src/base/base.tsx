/**
 * External dependencies
 */
import { Stack } from '@automattic/design-system';

type BaseLayoutProps = {
	header: React.ReactNode;
	children: React.ReactNode;
};

export function BaseLayout( { header, children }: BaseLayoutProps ) {
	return (
		<Stack gap={ 4 } direction="column">
			{ header }
			{ children }
		</Stack>
	);
}
