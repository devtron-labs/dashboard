import { URLS } from '../../../config';

export const NavigationList = [
	{
		title: 'Search (⌘+/)',
		type: 'button',
		iconClass: 'nav-short-search',
		href: URLS.APP,
	},
	{
		title: 'Applications',
		type: 'link',
		iconClass: 'nav-short-apps',
		href: URLS.APP,
	},
	{
		title: 'Charts',
		type: 'link',
		iconClass: 'nav-short-helm',
		href: URLS.CHARTS,
	},
	{
		title: 'Deployment Groups',
		type: 'link',
		iconClass: 'nav-short-bulk-actions',
		href: URLS.DEPLOYMENT_GROUPS,
	},
	{
		title: 'Security',
		type: 'link',
		href: URLS.SECURITY,
		iconClass: 'nav-security',
	},
	{
		title: 'Global Configurations',
		type: 'link',
		href: URLS.GLOBAL_CONFIG,
		iconClass: 'nav-short-global'
	},
];


export const NavigationListBottom = [
	{
		title: 'View on Github',
		iconClass: 'nav-short-github',
		href: 'https://github.com/devtron-labs/devtron',
	},
	{
		title: 'Discord Community',
		iconClass: 'nav-short-discord',
		href: 'https://discord.gg/jsRG5qx2gp',
	},
];
