import { useEffect } from 'react'
import { Meta, StoryObj } from '@storybook/react'
import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    FiltersTypeEnum,
    PaginationEnum,
    SearchBar,
    SelectAllDialogStatus,
    Table,
    TableCellComponentProps,
    TableProps,
    TableViewWrapperProps,
    TableSignalEnum,
    TABLE_ID_MAP,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICPlay } from '@Icons/ic-play-outline.svg'
import { ReactComponent as ICPause } from '@Icons/ic-pause.svg'
import { ReactComponent as ICWarning } from '@Icons/ic-warning-y6.svg'

const CellComponent = ({ field, value, signals, row, isRowActive }: TableCellComponentProps) => {
    const handleButtonClick = () => {
        alert(`Row ${value} clicked`)
    }

    useEffect(() => {
        const rowEnterPressedCallback = ({
            detail: {
                activeRowData: { id },
            },
        }) => {
            if (id === row.id && field === 'name') {
                handleButtonClick()
            }
        }

        const getCallback =
            (text: string) =>
            ({
                detail: {
                    activeRowData: { id },
                },
            }) => {
                if (id === row.id && field === 'name') {
                    alert(text)
                }
            }

        const deletePressedCallback = getCallback(`Delete pressed for ${value}`)
        const openContextMenuCallback = getCallback(`Open context menu for ${value}`)

        signals.addEventListener(TableSignalEnum.ENTER_PRESSED, rowEnterPressedCallback)
        signals.addEventListener(TableSignalEnum.DELETE_PRESSED, deletePressedCallback)
        signals.addEventListener(TableSignalEnum.OPEN_CONTEXT_MENU, openContextMenuCallback)

        return () => {
            signals.removeEventListener(TableSignalEnum.ENTER_PRESSED, rowEnterPressedCallback)
            signals.removeEventListener(TableSignalEnum.DELETE_PRESSED, deletePressedCallback)
            signals.addEventListener(TableSignalEnum.OPEN_CONTEXT_MENU, openContextMenuCallback)
        }
    }, [])

    if (field === 'name') {
        return (
            <div className="flexbox dc__align-items-center">
                <Button
                    variant={ButtonVariantType.text}
                    text={value as string}
                    dataTestId={`${field}-${row.id}`}
                    style={isRowActive ? ButtonStyleType.default : ButtonStyleType.neutral}
                    onClick={handleButtonClick}
                />
            </div>
        )
    }

    return (
        <div className="flexbox dc__gap-6 dc__align-items-center">
            <ICWarning className="dc__no-shrink icon-dim-18" />

            <span>{value}</span>
        </div>
    )
}

const COLUMNS: TableProps['columns'] = [
    {
        field: 'name',
        size: { fixed: 300 },
        label: 'Name',
        comparator: (a: string, b: string) => a.localeCompare(b),
        isSortable: true,
        CellComponent,
    },
    {
        field: 'value',
        size: {
            range: {
                startWidth: 180,
                minWidth: 100,
                maxWidth: 600,
            },
        },
        label: 'Value',
    },
    {
        field: 'message',
        size: {
            fixed: 200,
        },
        label: 'Message',
        CellComponent,
    },
]

type RowDataType = {
    name: string
    value: string
    message: string
}

const ROWS: TableProps['rows'] = [
    { id: '1', data: { name: 'Alice', value: '123', message: 'Something new' } },
    { id: '2', data: { name: 'Bob', value: '456', message: 'Another message' } },
    { id: '3', data: { name: 'Charlie', value: '789', message: 'Yet another one' } },
    { id: '4', data: { name: 'Diana', value: '101', message: 'Message here' } },
    { id: '5', data: { name: 'Eve', value: '202', message: 'Something else' } },
    { id: '6', data: { name: 'Frank', value: '303', message: 'New message' } },
    { id: '7', data: { name: 'Grace', value: '404', message: 'Important note' } },
    { id: '8', data: { name: 'Hank', value: '505', message: 'Final message' } },
    { id: '9', data: { name: 'Ivy', value: '606', message: 'Additional info' } },
    { id: '10', data: { name: 'Jack', value: '707', message: 'Critical update' } },
    { id: '11', data: { name: 'Karen', value: '808', message: 'New feature' } },
    { id: '12', data: { name: 'Leo', value: '909', message: 'Bug fix' } },
    { id: '13', data: { name: 'Mona', value: '1010', message: 'Performance improvement' } },
    { id: '14', data: { name: 'Nina', value: '1111', message: 'Security patch' } },
    { id: '15', data: { name: 'Oscar', value: '1212', message: 'UI enhancement' } },
    { id: '16', data: { name: 'Paul', value: '1313', message: 'Backend update' } },
    { id: '17', data: { name: 'Quinn', value: '1414', message: 'Database migration' } },
    { id: '18', data: { name: 'Rachel', value: '1515', message: 'API change' } },
    { id: '19', data: { name: 'Steve', value: '1616', message: 'Documentation update' } },
    { id: '20', data: { name: 'Tina', value: '1717', message: 'New integration' } },
    { id: '21', data: { name: 'Uma', value: '1818', message: 'Deprecated feature' } },
    { id: '22', data: { name: 'Victor', value: '1919', message: 'Hotfix applied' } },
    { id: '23', data: { name: 'Wendy', value: '2020', message: 'Code refactor' } },
    { id: '24', data: { name: 'Xander', value: '2121', message: 'New dependency' } },
    { id: '25', data: { name: 'Yara', value: '2222', message: 'Improved logging' } },
    { id: '26', data: { name: 'Zane', value: '2323', message: 'Monitoring added' } },
    { id: '27', data: { name: 'Amy', value: '2424', message: 'Analytics update' } },
    { id: '28', data: { name: 'Brian', value: '2525', message: 'Localization added' } },
    { id: '29', data: { name: 'Cathy', value: '2626', message: 'Accessibility fix' } },
    { id: '30', data: { name: 'David', value: '2727', message: 'New dashboard' } },
    { id: '31', data: { name: 'Ella', value: '2828', message: 'Improved UX' } },
    { id: '32', data: { name: 'Fred', value: '2929', message: 'Updated icons' } },
    { id: '33', data: { name: 'Gina', value: '3030', message: 'Enhanced security' } },
    { id: '34', data: { name: 'Harry', value: '3131', message: 'New theme' } },
    { id: '35', data: { name: 'Iris', value: '3232', message: 'Updated dependencies' } },
    { id: '36', data: { name: 'Jake', value: '3333', message: 'Improved performance' } },
    { id: '37', data: { name: 'Kara', value: '3434', message: 'New API endpoint' } },
    { id: '38', data: { name: 'Liam', value: '3535', message: 'Updated README' } },
]

const meta = {
    component: Table,
} satisfies Meta<TableProps>

export default meta

type Story = StoryObj<typeof meta>

const BulkActionsComponent = () => (
    <div className="flexbox dc__gap-4">
        <Button
            icon={<ICPause />}
            dataTestId="rb-bulk-action__action-widget--cordon"
            component={ButtonComponentType.button}
            style={ButtonStyleType.negativeGrey}
            variant={ButtonVariantType.borderLess}
            ariaLabel="Pause"
            size={ComponentSizeType.small}
            onClick={() => alert('Pause clicked')}
            showAriaLabelInTippy
        />

        <Button
            icon={<ICPlay />}
            dataTestId="rb-bulk-action__action-widget--uncordon"
            component={ButtonComponentType.button}
            style={ButtonStyleType.neutral}
            variant={ButtonVariantType.borderLess}
            ariaLabel="Play"
            size={ComponentSizeType.small}
            onClick={() => alert('Play clicked!')}
            showAriaLabelInTippy
        />
    </div>
)

const ViewWrapper = ({ children, handleSearch, searchKey }: TableViewWrapperProps) => (
    <div
        style={{ height: '800px' }}
        className="w-100 flexbox-col flex-grow-1 bg__primary dc__overflow-hidden dc__gap-16 py-12"
    >
        <div className="flexbox w-100 dc__align-start px-20">
            <SearchBar
                handleSearchChange={handleSearch}
                initialSearchText={searchKey}
                size={ComponentSizeType.medium}
                containerClassName="w-300"
            />
        </div>

        {children}
    </div>
)

export const TableTemplate: Story = {
    args: {
        columns: COLUMNS,
        rows: ROWS,
        filtersVariant: FiltersTypeEnum.STATE,
        id: TABLE_ID_MAP.STORYBOOK,
        paginationVariant: PaginationEnum.PAGINATED,
        emptyStateConfig: {
            noRowsConfig: {
                title: 'No rows to display',
                description: 'There are no rows to display.',
            },
        },
        filter: (row, filterData) => {
            const lowerCasedSearchKey = filterData.searchKey.toLowerCase()
            return (row.data as RowDataType).name.toLowerCase().includes(lowerCasedSearchKey)
        },
        bulkSelectionConfig: {
            BulkActionsComponent,
            getSelectAllDialogStatus: () => SelectAllDialogStatus.CLOSED,
            onBulkSelectionChanged: () => {},
        },
        stylesConfig: {
            showSeparatorBetweenRows: true,
        },
        ViewWrapper,
        additionalFilterProps: {
            initialSortKey: 'name',
        },
    } as TableProps,
}
