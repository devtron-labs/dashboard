/*
 *   Copyright (c) 2024 Devtron Inc.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { TippyProps } from '@tippyjs/react'

export interface CollapsibleListItem {
    /**
     * The title of the list item.
     */
    title: string
    /**
     * The subtitle of the list item.
     */
    subtitle?: string
    /**
     * A React component representing an icon to be displayed with the list item.
     */
    icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    /**
     * Properties for the icon component.
     */
    iconProps?: React.PropsWithChildren<React.SVGProps<SVGSVGElement>>
    /**
     * Properties for the tooltip component of the icon.
     */
    iconTooltipProps?: TippyProps
    /**
     * The URL of the nav link.
     */
    href?: string
}

export interface CollapsibleListConfig {
    /**
     * The unique identifier for the collapsible list.
     */
    id: string
    /**
     * The header text for the collapsible list.
     */
    header: string
    /**
     * A React component representing an icon to be displayed with the header.
     */
    headerIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    /**
     * Properties for the header icon component.
     */
    headerIconProps?: React.PropsWithChildren<React.SVGProps<SVGSVGElement>>
    /**
     * Properties for the tooltip component of the header icon.
     */
    headerIconTooltipProps?: TippyProps
    /**
     * Text to display when there are no items in the list.
     * @default 'No items found.'
     */
    noItemsText?: string
    /**
     * An array of items to be displayed in the collapsible list.
     */
    items: CollapsibleListItem[]
}

export interface CollapsibleListProps {
    /**
     * An array of collapsible list configurations.
     */
    config: CollapsibleListConfig[]
    /**
     * An array containing the IDs of the collapsible items that need to be expanded. \
     * Whenever this array is modified, the expanded state is updated internally.
     */
    expandedIds?: string[]
}
