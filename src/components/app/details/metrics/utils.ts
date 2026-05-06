import dayjs from 'dayjs'

import { DateTimePickerProps } from '@devtron-labs/devtron-fe-common-lib'

const getRangeOptionBeforeMonths = (monthCount: number): DateTimePickerProps['rangeShortcutOptions'][number] => ({
    label: `Last ${monthCount} month${monthCount > 1 ? 's' : ''}`,
    value: {
        from: dayjs().subtract(monthCount, 'month').toDate(),
        to: dayjs().toDate(),
    },
})

export const getRangeShortcutOptions = (): DateTimePickerProps['rangeShortcutOptions'] =>
    [
        {
            label: 'Last 15 days',
            value: {
                from: dayjs().subtract(15, 'day').toDate(),
                to: dayjs().toDate(),
            },
        },
        ...[1, 2, 3, 4, 5, 6].map((month) => getRangeOptionBeforeMonths(month)),
    ] satisfies DateTimePickerProps['rangeShortcutOptions']
