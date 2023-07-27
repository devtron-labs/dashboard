import React from 'react'
import { GroupHeading, groupStyle } from "../v2/common/ReactSelect.utils"

export const groupHeading = (props) => {
    return <GroupHeading {...props} />
}

export const buildStageStyles = {
    ...groupStyle(),
    control: (base) => ({ ...base, border: '1px solid #d6dbdf', minHeight: '20px', height: '30px', marginTop: '4px' }),
    valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px'}),
    indicatorsContainer: (base) => ({ ...base, height: '28px' }),
    menu :(base) => ({ ...base, width: '240px'})

}

export const triggerStageStyles = {
    ...groupStyle(),
    container: (base) => ({ ...base }),
    control: (base) => ({ ...base, border: 'none', borderRadius: '0px', minHeight: '20px', height: '32px', width: '199px' }),
    valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
    indicatorsContainer: (base) => ({ ...base, height: '30px' }),
    singleValue: (base) => ({
        ...base,
        fontWeight: 600,
        color: '#0066cc',
    }),
}