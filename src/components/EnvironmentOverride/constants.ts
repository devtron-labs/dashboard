
  import React, {useCallback} from 'react';
  import { mapByKey } from '../common'

    const memoisedReducer = useCallback((state, action) => {
        switch (action.type) {
            case 'toggleCollapse':
                return { ...state, collapsed: !Boolean(state.collapsed) }
            case 'setResult':
                return {
                    ...state, data: action.value, duplicate: (action.value.IsOverride || state.duplicate) ? (action.value.environmentConfig.envOverrideValues || action.value.globalConfig) : null
                }
            case 'setCharts':
                return { ...state, charts: mapByKey(action.value.chartRefs, 'id'), selectedChartRefId: state.selectedChartRefId || action.value.latestEnvChartRef || action.value.latestAppChartRef || action.value.latestChartRef }
            case 'createDuplicate':
                return { ...state, duplicate: action.value, selectedChartRefId: state.data.globalChartRefId }
            case 'removeDuplicate':
                return { ...state, duplicate: null }
            case 'selectChart':
                return { ...state, selectedChartRefId: action.value }
            case 'appMetricsLoading':
                return { ...state, appMetricsLoading: true }
            case 'success':
            case 'error':
                return { ...state, appMetricsLoading: false }
            case 'toggleDialog':
                return { ...state, dialog: !state.dialog }
            case 'reset':
                return { collapsed: true, charts: new Map(), selectedChartRefId: null }
            default:
                return state
        }
    }, [])

  export default memoisedReducer

