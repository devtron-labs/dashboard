import { useState } from 'react'

import {
    getSelectPickerOptionByValue,
    ProdNonProdSelectValueTypes,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { PROD_NON_PROD_OPTIONS } from '../constants'
import SeverityDistribution from './SeverityDistribution'
import VulnerabilityTrend from './VulnerabilityTrend'

const SeverityInsights = () => {
    const [prodNonProdValue, setProdNonProdValue] = useState<ProdNonProdSelectValueTypes>(
        ProdNonProdSelectValueTypes.ALL,
    )

    const handleChangeProdNonProd = ({ value }: SelectPickerOptionType<ProdNonProdSelectValueTypes>) => {
        setProdNonProdValue(value)
    }

    return (
        <div className="flexbox-col dc__gap-12">
            <div className="flex dc__content-space">
                <h2 className="m-0 fs-20 lh-1-5 fw-4 cn-9">Severity Insights</h2>
                <SelectPicker
                    inputId="severity-insights-prod-non-prod-select"
                    options={PROD_NON_PROD_OPTIONS}
                    variant={SelectPickerVariantType.COMPACT}
                    value={getSelectPickerOptionByValue(PROD_NON_PROD_OPTIONS, prodNonProdValue)}
                    onChange={handleChangeProdNonProd}
                    isSearchable={false}
                    shouldMenuAlignRight
                />
            </div>
            <div className="flexbox-col dc__gap-8">
                <SeverityDistribution prodNonProdValue={prodNonProdValue} />
                <VulnerabilityTrend prodNonProdValue={prodNonProdValue} />
            </div>
        </div>
    )
}

export default SeverityInsights
