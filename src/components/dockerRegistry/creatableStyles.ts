import { getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'

const baseStyles = getCommonSelectStyle()

export const creatableSelectStyles = {
    ...baseStyles,
    multiValue: (base) => ({
        ...base,
        border: '1px solid var(--N200)',
        borderRadius: '4px',
        background: 'white',
        height: '28px',
        margin: 0,
    }),
    control: (base, state) => ({
        ...baseStyles.control(base, state),
        minHeight: '36px',
        height: 'auto',
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: '34px',
    }),
    valueContainer: (base) => ({
        ...baseStyles.valueContainer(base),
        maxHeight: '100%',
        gap: '4px',
        paddingBlock: '4px',
    }),
}
