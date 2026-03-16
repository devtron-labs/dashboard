import DOMPurify from 'dompurify'

import {
    ClipboardButton,
    FiltersTypeEnum,
    highlightSearchText,
    statusColor,
    TableCellComponentProps,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { App, Environment, TableAdditionalPropsType } from './types'

export const NameCellComponent = ({
    row: { data },
    filterConfig: { searchKey: searchText },
    isExpandedRow,
}: TableCellComponentProps<App | Environment, FiltersTypeEnum.URL, TableAdditionalPropsType>) => {
    if (isExpandedRow) {
        const color = statusColor[(data as Environment).appStatus.toLowerCase()] || 'var(--N500)'

        return (
            <div className="flex left dc__overflow-hidden">
                <svg className="app-status" preserveAspectRatio="none" viewBox="0 0 200 40">
                    <line x1="0" y1="20" x2="100%" y2="20" stroke={color} strokeWidth="1" />
                    <line x1="0" y1="15" x2="0" y2="25" stroke={color} strokeWidth="1" />
                </svg>
            </div>
        )
    }

    const app = data as App

    const { name } = app

    return (
        <div className="flex left dc__gap-4 dc__visible-hover dc__visible-hover--parent">
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <Tooltip content={name}>
                <span
                    className="dc__link cursor dc__truncate"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                            highlightSearchText({
                                searchText,
                                text: String(name),
                                highlightClasses: 'p-0 fw-6 bcy-2',
                            }),
                        ),
                    }}
                />
            </Tooltip>
            <ClipboardButton content={String(name)} rootClassName="p-2 dc__visible-hover--child" iconSize={16} />
        </div>
    )
}
