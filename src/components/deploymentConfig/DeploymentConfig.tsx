import React, { Reducer, createContext, useContext, useEffect, useReducer, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import {
    getDeploymentTemplate,
    updateDeploymentTemplate,
    saveDeploymentTemplate,
    getDeploymentManisfest,
    getDeploymentTemplateNew,
} from './service'
import { getChartReferences } from '../../services/service'
import { useJsonYaml, useAsync, importComponentFromFELibrary } from '../common'
import { showError, useEffectAfterMount } from '@devtron-labs/devtron-fe-common-lib'
import {
    DeploymentConfigContextType,
    DeploymentConfigProps,
    DeploymentConfigStateAction,
    DeploymentConfigStateActionTypes,
    DeploymentConfigStateWithDraft,
} from './types'
import { STAGE_NAME } from '../app/details/appConfig/appConfig.type'
import YAML from 'yaml'
import './deploymentConfig.scss'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { DEPLOYMENT, ModuleNameMap, ROLLOUT_DEPLOYMENT } from '../../config'
import { InstallationType, ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { mainContext } from '../common/navigation/NavigationRoutes'
import {
    getBasicFieldValue,
    handleConfigProtectionError,
    isBasicValueChanged,
    patchBasicData,
    updateTemplateFromBasicValue,
    validateBasicView,
} from './DeploymentConfig.utils'
import { BASIC_FIELDS, EDITOR_VIEW } from './constants'
import DeploymentConfigFormCTA from './DeploymentTemplateView/DeploymentConfigFormCTA'
import DeploymentTemplateEditorView from './DeploymentTemplateView/DeploymentTemplateEditorView'
import DeploymentTemplateOptionsTab from './DeploymentTemplateView/DeploymentTemplateOptionsTab'
import DeploymentConfigToolbar from './DeploymentTemplateView/DeploymentConfigToolbar'
import { SaveConfirmationDialog, SuccessToastBody } from './DeploymentTemplateView/DeploymentTemplateView.component'
import { deploymentConfigReducer, initDeploymentConfigState } from './DeploymentConfigReducer'
import DeploymentTemplateReadOnlyEditorView from './DeploymentTemplateView/DeploymentTemplateReadOnlyEditorView'
import { stat } from 'fs'
import { Spinner } from 'patternfly-react';

export const dummy = {
    ContainerPort: [
        {
            envoyPort: 6969,
            idleTimeout: '1800s',
            name: 'app',
            port: 69,
            servicePort: 69,
            supportStreaming: false,
            useHTTP2: false,
        },
    ],
    EnvVariables: [],
    GracePeriod: 30,
    LivenessProbe: {
        Path: '',
        command: [],
        failureThreshold: 3,
        httpHeaders: [],
        initialDelaySeconds: 20,
        periodSeconds: 10,
        port: 8080,
        scheme: '',
        successThreshold: 1,
        tcp: false,
        timeoutSeconds: 5,
    },
    MaxSurge: 1,
    MaxUnavailable: 0,
    MinReadySeconds: 60,
    ReadinessProbe: {
        Path: '',
        command: [],
        failureThreshold: 3,
        httpHeaders: [],
        initialDelaySeconds: 20,
        periodSeconds: 10,
        port: 8080,
        scheme: '',
        successThreshold: 1,
        tcp: false,
        timeoutSeconds: 5,
    },
    Spec: {
        Affinity: {
            Key: null,
            Values: ['nodes'],
            key: '',
        },
    },
    StartupProbe: {
        Path: '',
        command: [],
        failureThreshold: 3,
        httpHeaders: [],
        initialDelaySeconds: 20,
        periodSeconds: 10,
        port: 8080,
        successThreshold: 1,
        tcp: false,
        timeoutSeconds: 5,
    },
    ambassadorMapping: {
        ambassadorId: '',
        cors: {},
        enabled: false,
        hostname: 'devtron.example.com',
        labels: {},
        prefix: '/',
        retryPolicy: {},
        rewrite: '',
        tls: {
            context: '',
            create: false,
            hosts: [],
            secretName: '',
        },
    },
    args: {
        enabled: false,
        value: ['/bin/sh', '-c', 'touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600'],
    },
    autoscaling: {
        MaxReplicas: 2,
        MinReplicas: 1,
        TargetCPUUtilizationPercentage: 90,
        TargetMemoryUtilizationPercentage: 80,
        annotations: {},
        behavior: {},
        enabled: false,
        extraMetrics: [],
        labels: {},
    },
    command: {
        enabled: false,
        value: [],
        workingDir: {},
    },
    containerSecurityContext: {},
    containerSpec: {
        lifecycle: {
            enabled: false,
            postStart: {
                httpGet: {
                    host: 'example.com',
                    path: '/example',
                    port: 90,
                },
            },
            preStop: {
                exec: {
                    command: ['sleep', '10'],
                },
            },
        },
    },
    containers: [],
    dbMigrationConfig: {
        enabled: false,
    },
    envoyproxy: {
        configMapName: '',
        image: 'docker.io/envoyproxy/envoy:v1.16.0',
        lifecycle: {},
        resources: {
            limits: {
                cpu: '50m',
                memory: '50Mi',
            },
            requests: {
                cpu: '50m',
                memory: '50Mi',
            },
        },
    },
    flaggerCanary: {
        addOtherGateways: [],
        addOtherHosts: [],
        analysis: {
            interval: '15s',
            maxWeight: 50,
            stepWeight: 5,
            threshold: 5,
        },
        annotations: {},
        appProtocol: 'http',
        corsPolicy: null,
        createIstioGateway: {
            annotations: {},
            enabled: false,
            host: null,
            labels: {},
            tls: {
                enabled: false,
                secretName: null,
            },
        },
        enabled: false,
        gatewayRefs: null,
        headers: null,
        labels: {},
        loadtest: {
            enabled: true,
            url: 'http://flagger-loadtester.istio-system/',
        },
        match: [
            {
                uri: {
                    prefix: '/',
                },
            },
        ],
        portDiscovery: true,
        retries: null,
        rewriteUri: '/',
        serviceport: 8080,
        targetPort: 8080,
        thresholds: {
            latency: 500,
            successRate: 90,
        },
        timeout: null,
    },
    hostAliases: [],
    image: {
        pullPolicy: 'IfNotPresent',
    },
    imagePullSecrets: [],
    ingress: {
        annotations: {},
        className: '',
        enabled: false,
        hosts: [
            {
                host: 'chart-example1.local',
                pathType: 'ImplementationSpecific',
                paths: ['/example1'],
            },
        ],
        labels: {},
        tls: [],
    },
    ingressInternal: {
        annotations: {},
        className: '',
        enabled: false,
        hosts: [
            {
                host: 'chart-example1.internal',
                pathType: 'ImplementationSpecific',
                paths: ['/example1'],
            },
            {
                host: 'chart-example2.internal',
                pathType: 'ImplementationSpecific',
                paths: ['/example2', '/example2/healthz'],
            },
        ],
        tls: [],
    },
    initContainers: [],
    istio: {
        authorizationPolicy: {
            action: null,
            annotations: {},
            enabled: false,
            labels: {},
            provider: {},
            rules: [],
        },
        destinationRule: {
            annotations: {},
            enabled: false,
            labels: {},
            subsets: [],
            trafficPolicy: {},
        },
        enable: false,
        gateway: {
            annotations: {},
            enabled: false,
            host: 'example.com',
            labels: {},
            tls: {
                enabled: false,
                secretName: 'example-secret',
            },
        },
        peerAuthentication: {
            annotations: {},
            enabled: false,
            labels: {},
            mtls: ['mode'],
            portLevelMtls: {},
            selector: {
                enabled: false,
            },
        },
        requestAuthentication: {
            annotations: {},
            enabled: false,
            jwtRules: [],
            labels: {},
            selector: {
                enabled: false,
            },
        },
        virtualService: {
            annotations: {},
            enabled: false,
            gateways: [],
            hosts: [],
            http: [],
            labels: {},
        },
    },
    kedaAutoscaling: {
        advanced: {},
        authenticationRef: {},
        enabled: false,
        envSourceContainerName: '',
        maxReplicaCount: 2,
        minReplicaCount: 1,
        triggerAuthentication: {
            enabled: false,
            name: '',
            spec: {},
        },
        triggers: [],
    },
    networkPolicy: {
        annotations: {},
        egress: [],
        enabled: false,
        ingress: [],
        labels: {},
        podSelector: {
            matchExpressions: [],
            matchLabels: {},
        },
        policyTypes: [],
    },
    pauseForSecondsBeforeSwitchActive: 30,
    podAnnotations: {},
    podLabels: {},
    podSecurityContext: {},
    prometheus: {
        release: 'monitoring',
    },
    rawYaml: [],
    replicaCount: 1,
    resources: {
        limits: {
            cpu: '0.05',
            memory: '50Mi',
        },
        requests: {
            cpu: '0.01',
            memory: '10Mi',
        },
    },
    restartPolicy: 'Always',
    rolloutAnnotations: {},
    rolloutLabels: {},
    secret: {
        data: {},
        enabled: false,
    },
    server: {
        deployment: {
            image: '',
            image_tag: '1-95af053',
        },
    },
    service: {
        annotations: {},
        loadBalancerSourceRanges: [],
        type: 'ClusterIP',
    },
    serviceAccount: {
        annotations: {},
        create: false,
        name: '',
    },
    servicemonitor: {
        additionalLabels: {},
    },
    tolerations: [],
    topologySpreadConstraints: [],
    volumeMounts: [],
    volumes: [],
    waitForSecondsBeforeScalingDown: 30,
    winterSoldier: {
        action: 'sleep',
        annotation: {},
        apiVersion: 'pincher.devtron.ai/v1alpha1',
        enabled: false,
        fieldSelector: [
            "AfterTime(AddTime(ParseTime({{metadata.creationTimestamp}}, '2006-01-02T15:04:05Z'), '5m'), Now())",
        ],
        labels: {},
        targetReplicas: [],
        timeRangesWithZone: {
            timeRanges: [],
            timeZone: 'Asia/Kolkata',
        },
        type: 'Deployment',
    },
}

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DraftComments = importComponentFromFELibrary('DraftComments')
const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')

export const DeploymentConfigContext = createContext<DeploymentConfigContextType>(null)

export default function DeploymentConfig({
    respondOnSuccess,
    isUnSet,
    navItems,
    isCiPipeline,
    environments,
    isProtected,
    reloadEnvironments,
}: DeploymentConfigProps) {
    const history = useHistory()
    const { appId } = useParams<{ appId: string }>()
    const { currentServerInfo } = useContext(mainContext)
    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateWithDraft, DeploymentConfigStateAction>>(
        deploymentConfigReducer,
        initDeploymentConfigState,
    )
    const [isValues, setIsValues] = useState(true)
    const [obj, , , error] = useJsonYaml(state.tempFormData, 4, 'yaml', true)
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])
    const readOnlyPublishedMode = state.selectedTabIndex === 1 && isProtected && !!state.latestDraft
    useEffect(() => {
        reloadEnvironments()
        initialise()
    }, [])

    useEffectAfterMount(() => {
        if (state.selectedChart) {
            fetchDeploymentTemplate()
        }
    }, [state.selectedChart])

    const updateRefsData = (chartRefsData, clearPublishedState?) => {
        console.log(chartRefsData,"chartRefsData")
        const payload = {
            ...chartRefsData,
            chartConfigLoading: false,
        }

        if (clearPublishedState) {
            payload.selectedTabIndex = state.selectedTabIndex === 3 ? 1 : state.selectedTabIndex
            payload.publishedState = null
            payload.showComments = false
            payload.latestDraft = null
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })
    }

    async function initialise() {
        console.log("initialise")
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        getChartReferences(+appId)
            .then((chartRefResp) => {
                const { chartRefs, latestAppChartRef, latestChartRef, chartMetadata } = chartRefResp.result
                const selectedChartId: number = latestAppChartRef || latestChartRef
                const chart = chartRefs.find((chart) => chart.id === selectedChartId)
                const chartRefsData = {
                    charts: chartRefs,
                    chartsMetadata: chartMetadata,
                    selectedChartRefId: selectedChartId,
                    selectedChart: chart,
                }

                if (isProtected && typeof getDraftByResourceName === 'function') {
                    console.log('fetchAllDrafts')
                    fetchAllDrafts(chartRefsData)
                } else {
                    console.log('updateRefsData')
                    updateRefsData(chartRefsData)
                }
            })
            .catch((err) => {
                showError(err)
                dispatch({
                    type: DeploymentConfigStateActionTypes.chartConfigLoading,
                    payload: false,
                })
            })
    }

    const fetchAllDrafts = (chartRefsData) => {
        console.log('inside fetchAllDrafts')
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        setLoading(true)
        console.log('setLoading - true')
        getDraftByResourceName(appId, -1, 3, 'BaseDeploymentTemplate')
            .then((draftsResp) => {
                console.log('draftsResp',draftsResp)
                
                if (draftsResp.result && (draftsResp.result.draftState === 1 || draftsResp.result.draftState === 4)) {
                    console.log('inside draftsResp')
                    processDraftData(draftsResp.result, chartRefsData)
                    setLoading(false)
                    console.log('setLoading - false')
                } else {
                    console.log('inside else draftsResp')
                    updateRefsData(chartRefsData, !!state.publishedState)
                    setLoading(false)
                }
            })
            .catch((e) => {
                console.log('error',e)
                updateRefsData(chartRefsData)
            })
    }

    const processDraftData = (latestDraft, chartRefsData) => {
        console.log('inside processDraftData')
        const {
            valuesOverride,
            id,
            refChartTemplate,
            refChartTemplateVersion,
            isAppMetricsEnabled,
            chartRefId,
            isBasicViewLocked,
            currentViewEditor,
            readme,
            schema,
        } = JSON.parse(latestDraft.data)

        const _codeEditorStringifyData=YAML.stringify(valuesOverride, { indent: 2 })
        const isApprovalPending = latestDraft.draftState === 4
        const payload = {
            template: valuesOverride,
            chartConfig: {
                id,
                refChartTemplate,
                refChartTemplateVersion,
                chartRefId,
                readme,
            },
            isAppMetricsEnabled: isAppMetricsEnabled,
            tempFormData: _codeEditorStringifyData,
            manifestData: YAML.stringify(dummy, { indent: 2 }),
            draftValues: _codeEditorStringifyData,
            latestDraft: latestDraft,
            selectedTabIndex: isApprovalPending ? 2 : 3,
            openComparison: isApprovalPending,
            currentEditorView: currentViewEditor,
            readme,
            schema,
            ...{
                ...chartRefsData,
                selectedChartRefId: chartRefId,
                selectedChart: chartRefsData?.charts?.find((chart) => chart.id === chartRefId),
            },
        }

        console.log(_codeEditorStringifyData,"valuesOverride")

        setValueData(_codeEditorStringifyData)
        if (chartRefsData) {
            payload['publishedState'] = chartRefsData
        } else if (!state.publishedState) {
            payload['publishedState'] = state
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })

        if (payload.selectedChart.name === ROLLOUT_DEPLOYMENT || payload.selectedChart.name === DEPLOYMENT) {
            updateTemplateFromBasicValue(valuesOverride)
            parseDataForView(isBasicViewLocked, currentViewEditor, valuesOverride, payload, false)
        }
    }

    const toggleYamlMode = (yamlMode: boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.yamlMode,
            payload: yamlMode,
        })
    }

    const parseDataForView = async (
        _isBasicViewLocked: boolean,
        _currentViewEditor: string,
        template,
        templateData,
        updatePublishedState: boolean,
    ): Promise<void> => {
        if (_currentViewEditor === EDITOR_VIEW.UNDEFINED) {
            const {
                result: { defaultAppOverride },
            } = await getDeploymentTemplate(+appId, +state.selectedChart.id, true)
            _isBasicViewLocked = isBasicValueChanged(defaultAppOverride, template)
        }

        const statesToUpdate = {}
        if (!state.currentEditorView || !_currentViewEditor) {
            _currentViewEditor =
                _isBasicViewLocked ||
                currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE ||
                state.selectedTabIndex === 2 ||
                state.showReadme
                    ? EDITOR_VIEW.ADVANCED
                    : EDITOR_VIEW.BASIC

            statesToUpdate['isBasicLocked'] = _isBasicViewLocked
            statesToUpdate['currentEditorView'] = _currentViewEditor
            statesToUpdate['yamlMode'] = _currentViewEditor !== EDITOR_VIEW.BASIC
        }
        if (!_isBasicViewLocked) {
            const _basicFieldValues = getBasicFieldValue(template)
            if (
                _basicFieldValues[BASIC_FIELDS.HOSTS].length === 0 ||
                !_basicFieldValues[BASIC_FIELDS.PORT] ||
                !_basicFieldValues[BASIC_FIELDS.ENV_VARIABLES] ||
                !_basicFieldValues[BASIC_FIELDS.RESOURCES]
            ) {
                statesToUpdate['isBasicLocked'] = true
                statesToUpdate['currentEditorView'] = EDITOR_VIEW.ADVANCED
                statesToUpdate['yamlMode'] = true
            } else {
                statesToUpdate['basicFieldValues'] = _basicFieldValues
                statesToUpdate['basicFieldValuesErrorObj'] = validateBasicView(_basicFieldValues)
            }
        }

        if (updatePublishedState && templateData['publishedState']) {
            dispatch({
                type: DeploymentConfigStateActionTypes.publishedState,
                payload: {
                    ...templateData['publishedState'],
                    ...statesToUpdate,
                },
            })
        } else {
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: statesToUpdate,
            })
        }
    }

    async function fetchDeploymentTemplate() {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        try {
            const {
                result: {
                    globalConfig: {
                        defaultAppOverride,
                        id,
                        refChartTemplate,
                        refChartTemplateVersion,
                        isAppMetricsEnabled,
                        chartRefId,
                        readme,
                        schema,
                        isBasicViewLocked,
                        currentViewEditor,
                    },
                },
            } = await getDeploymentTemplate(+appId, +state.selectedChart.id)
            const _codeEditorStringifyData = YAML.stringify(defaultAppOverride, { indent: 2 })
            const templateData = {
                template: defaultAppOverride,
                schema,
                readme,
                currentEditorView: currentViewEditor,
                chartConfig: { id, refChartTemplate, refChartTemplateVersion, chartRefId, readme },
                isAppMetricsEnabled: isAppMetricsEnabled,
                tempFormData: _codeEditorStringifyData,
                manifestData: YAML.stringify(dummy, { indent: 2 }),
                data: _codeEditorStringifyData,
            }
            
            let payload = {}
            if (state.publishedState) {
                payload['publishedState'] = {
                    ...state.publishedState,
                    ...templateData,
                }

                payload['readme'] = readme
                payload['schema'] = schema
                payload['chartConfig'] = {
                    ...state.chartConfig,
                    readme,
                }
            } else {
                payload = templateData
            }
            setValueData(_codeEditorStringifyData)
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload,
            })

            if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                updateTemplateFromBasicValue(defaultAppOverride)
                parseDataForView(isBasicViewLocked, currentViewEditor, defaultAppOverride, payload, true)
            }
        } catch (err) {
            showError(err)
        } finally {
            dispatch({
                type: DeploymentConfigStateActionTypes.chartConfigLoading,
                payload: false,
            })
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!obj) {
            toast.error(error)
            return
        } else if (
            (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) &&
            !state.yamlMode &&
            !state.basicFieldValuesErrorObj.isValid
        ) {
            toast.error('Some required fields are missing')
            return
        } else if (isProtected) {
            toggleSaveChangesModal()
            return
        }

        if (state.chartConfig.id) {
            //update flow, might have overridden
            dispatch({
                type: DeploymentConfigStateActionTypes.showConfirmation,
                payload: true,
            })
        } else {
            save()
        }
    }

    async function save() {
        dispatch({
            type: DeploymentConfigStateActionTypes.loading,
            payload: true,
        })
        try {
            const requestBody = prepareDataToSave(true)
            const api = state.chartConfig.id ? updateDeploymentTemplate : saveDeploymentTemplate
            await api(requestBody)
            reloadEnvironments()
            fetchDeploymentTemplate()
            respondOnSuccess()
            dispatch({
                type: DeploymentConfigStateActionTypes.fetchedValues,
                payload: {},
            })
            dispatch({
                type: DeploymentConfigStateActionTypes.fetchedValuesManifest,
                payload: {},
            })
            toast.success(<SuccessToastBody chartConfig={state.chartConfig} />)

            if (!isCiPipeline) {
                const stageIndex = navItems.findIndex((item) => item.stage === STAGE_NAME.DEPLOYMENT_TEMPLATE)
                history.push(navItems[stageIndex + 1].href)
            }
        } catch (err) {
            handleConfigProtectionError(2, err, dispatch, reloadEnvironments)
        } finally {
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: { loading: false, showConfirmation: false },
            })
        }
    }

    const toggleAppMetrics = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.isAppMetricsEnabled,
            payload: !state.isAppMetricsEnabled,
        })
    }

    const isCompareAndApprovalState =
        state.selectedTabIndex === 2 && !state.showReadme && state.latestDraft?.draftState === 4

    const editorOnChange = (str: string, fromBasic?: boolean): void => {
        if (isCompareAndApprovalState) return
        console.log("this is where its fucked")
        if (isValues) {
            dispatch({
                type: DeploymentConfigStateActionTypes.tempFormData,
                payload: str,
            })
        }
        try {
            const parsedValues = YAML.parse(str)

            // Unset unableToParseYaml flag when yaml is successfully parsed
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: false,
            })
            if (
                state.selectedChart &&
                (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) &&
                str &&
                state.currentEditorView &&
                !state.isBasicLocked &&
                !fromBasic
            ) {
                dispatch({
                    type: DeploymentConfigStateActionTypes.isBasicLocked,
                    payload: isBasicValueChanged(parsedValues),
                })
            }
        } catch (error) {
            // Set unableToParseYaml flag when yaml is malformed
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: true,
            })
        }
    }

    const handleReadMeClick = () => {
        if (!state.showReadme && state.unableToParseYaml) return

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                showReadme: !state.showReadme,
                openComparison: state.showReadme && state.selectedTabIndex === 2,
            },
        })
    }

    const handleComparisonClick = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: { openComparison: !state.openComparison, showReadme: false },
        })
    }

    const changeEditorMode = (): void => {
        if (readOnlyPublishedMode) {
            if (state.publishedState && !state.publishedState.isBasicLocked) {
                toggleYamlMode(!state.yamlMode)
            }
            return
        } else if (state.basicFieldValuesErrorObj && !state.basicFieldValuesErrorObj.isValid) {
            toast.error('Some required fields are missing')
            toggleYamlMode(false)
            return
        } else if (state.isBasicLocked) {
            return
        }

        try {
            const parsedCodeEditorValue = YAML.parse(state.tempFormData)

            if (state.yamlMode) {
                const _basicFieldValues = getBasicFieldValue(parsedCodeEditorValue)
                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload: {
                        basicFieldValues: _basicFieldValues,
                        basicFieldValuesErrorObj: validateBasicView(_basicFieldValues),
                    },
                })
            } else {
                const newTemplate = patchBasicData(parsedCodeEditorValue, state.basicFieldValues)
                updateTemplateFromBasicValue(newTemplate)
                editorOnChange(YAML.stringify(newTemplate), !state.yamlMode)
            }
            toggleYamlMode(!state.yamlMode)
        } catch (error) {
            console.log('catch')
            console.log(error)
        }
    }

    const handleTabSelection = (index: number) => {
        if (state.unableToParseYaml) return

        dispatch({
            type: DeploymentConfigStateActionTypes.selectedTabIndex,
            payload:
                ((!state.latestDraft && state.selectedTabIndex === 1) || state.selectedTabIndex === 3) &&
                state.basicFieldValuesErrorObj &&
                !state.basicFieldValuesErrorObj.isValid
                    ? state.selectedTabIndex
                    : index,
        })

        switch (index) {
            case 1:
            case 3:
                const _isBasicLocked =
                    state.publishedState && index === 1 ? state.publishedState.isBasicLocked : state.isBasicLocked
                const defaultYamlMode =
                    state.selectedChart.name !== ROLLOUT_DEPLOYMENT && state.selectedChart.name !== DEPLOYMENT
                toggleYamlMode(
                    defaultYamlMode ||
                        _isBasicLocked ||
                        currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE,
                )
                if (state.selectedTabIndex === 2) {
                    handleComparisonClick()
                }
                break
            case 2:
                if (!state.openComparison) {
                    if (!state.yamlMode) {
                        if ((!state.latestDraft && state.selectedTabIndex === 1) || state.selectedTabIndex === 3) {
                            changeEditorMode()
                        } else {
                            toggleYamlMode(true)
                        }
                    }
                    handleComparisonClick()
                }
                break
            default:
                break
        }
    }

    const toggleSaveChangesModal = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleSaveChangesModal })
    }

    const toggleDraftComments = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDraftComments })
    }

    const prepareDataToSave = (skipReadmeAndSchema?: boolean) => {
        const requestData = {
            ...(state.chartConfig.chartRefId === state.selectedChart.id ? state.chartConfig : {}),
            appId: +appId,
            chartRefId: state.selectedChart.id,
            valuesOverride: obj,
            defaultAppOverride: state.template,
            isAppMetricsEnabled: state.isAppMetricsEnabled,
        }
        if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
            requestData.isBasicViewLocked = state.isBasicLocked
            requestData.currentViewEditor = state.isBasicLocked ? EDITOR_VIEW.ADVANCED : state.currentEditorView
            if (!state.yamlMode) {
                requestData.valuesOverride = patchBasicData(obj, state.basicFieldValues)
            }
        }

        if (!skipReadmeAndSchema) {
            requestData['id'] = state.chartConfig.id
            requestData['readme'] = state.readme
            requestData['schema'] = state.schema
        }

        return requestData
    }

    const [valueData, setValueData] = useState("")
    const [valueLeft, setValueLeft] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        console.log('useEffect')
        setLoading(true)
        const values = Promise.all([getValue(), getValuesLHS()])
        values
            .then((res) => {
                setLoading(false)
                console.log(res, 'res')
                const [_value, _valueLeft] = res
                setValueData(_value)
                setValueLeft(_valueLeft)
            })
            .catch((err) => {
                toast.error(err)
            })
    }, [isValues])

    const fetchManifestData = async (data) => {
        const request = {
            "appId": +appId,
            "chartRefId": 33,
            "getValues": false,
            "type": 1,  // FIXME: use dynamic type
            "values": data
        }
        const response = await getDeploymentManisfest(request)
        return response.result.data
    }

    // not running once tab is changed
    const getValue = async () => {
        try {
            let result = null;
    
            if (isCompareAndApprovalState) {
              if (isValues) {
                console.log('_here')
                console.log(state.draftValues,"state.draftValues")
                // Use state.draftValues
                result = state.draftValues;
              } else {
                // Call the API with state.draftValues
                result = await fetchManifestData(state.draftValues);
              }
            } else {
              if (isValues) {
                console.log('_rhere')
                console.log(state.tempFormData,"state.tempFormData")
                // Use state.tempFormData
                result = state.tempFormData;
              } else {
                // Call the API with state.tempFormData
                result = await fetchManifestData(state.tempFormData);
              }
            }
            return result;

          } catch (error) {
            // Handle errors if needed
            console.error(error);
          }
    }

    // console.log(valueData, 'valueData')
    // set initial value on LHS
    const getValuesLHS = async () => {
        if (isValues) {
            return state.publishedState?.tempFormData ?? state.data
        } else {
            const request = {
                appId: parseInt(appId),
                chartRefId: 33,
                getValues: false,
                type: 1,
                pipelineConfigOverrideId: 627,
                resourceName: 'BaseDeploymentTemplate',
                resourceType: 3,
                values: state.publishedState?.tempFormData ?? state.data,
            }
            const response = await getDeploymentManisfest(request)
            return response.result.data
        }
    }

    const renderValuesView = () => {
        return (
            <form
                action=""
                className={`white-card__deployment-config p-0 bcn-0 ${state.openComparison ? 'comparison-view' : ''} ${
                    state.showReadme ? 'readme-view' : ''
                }`}
                onSubmit={handleSubmit}
            >
                <DeploymentTemplateOptionsTab
                    codeEditorValue={readOnlyPublishedMode ? state.publishedState?.tempFormData : state.tempFormData}
                    disableVersionSelect={readOnlyPublishedMode}
                    isValues={isValues}
                />
                {readOnlyPublishedMode && !state.showReadme ? (
                    <DeploymentTemplateReadOnlyEditorView value={state.publishedState?.tempFormData} />
                ) : 
                loading ? (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                <Spinner loading></Spinner>
                <div style={{ marginTop: '20px', color: 'rgb(156, 148, 148)' }}>fetching events</div>
            </div>
                ) : (
                    <DeploymentTemplateEditorView
                        defaultValue={isValues?state.publishedState?.tempFormData ?? state.data: valueLeft}
                        value={isValues?(isCompareAndApprovalState ? state.draftValues:state.tempFormData): valueData}
                        globalChartRefId={state.selectedChartRefId}
                        editorOnChange={editorOnChange}
                        readOnly={isCompareAndApprovalState || !isValues}
                        isValues={isValues}
                    />
                )
                }
                <DeploymentConfigFormCTA
                    loading={state.loading || state.chartConfigLoading}
                    showAppMetricsToggle={
                        state.charts &&
                        state.selectedChart &&
                        window._env_?.APPLICATION_METRICS_ENABLED &&
                        grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED &&
                        state.yamlMode
                    }
                    isAppMetricsEnabled={
                        readOnlyPublishedMode ? state.publishedState?.isAppMetricsEnabled : state.isAppMetricsEnabled
                    }
                    isCiPipeline={isCiPipeline}
                    toggleAppMetrics={toggleAppMetrics}
                    isPublishedMode={readOnlyPublishedMode}
                    reload={initialise}
                    isValues={isValues}
                />
            </form>
        )
    }

    const getValueForContext = () => {
        return {
            isUnSet: readOnlyPublishedMode ? false : isUnSet,
            state,
            dispatch,
            isConfigProtectionEnabled: isProtected,
            environments: environments || [],
            changeEditorMode: changeEditorMode,
            reloadEnvironments: reloadEnvironments,
        }
    }

    return (
        <DeploymentConfigContext.Provider value={getValueForContext()}>
            <div
                className={`app-compose__deployment-config dc__window-bg ${
                    state.openComparison || state.showReadme ? 'full-view' : ''
                } ${state.showComments ? 'comments-view' : ''}`}
            >
                <div className="dc__border br-4 m-8 dc__overflow-hidden" style={{ height: 'calc(100vh - 92px)' }}>
                    <ConfigToolbar
                        loading={state.loading || state.chartConfigLoading}
                        draftId={state.latestDraft?.draftId}
                        draftVersionId={state.latestDraft?.draftVersionId}
                        selectedTabIndex={state.selectedTabIndex}
                        handleTabSelection={handleTabSelection}
                        noReadme={!state.yamlMode}
                        showReadme={state.showReadme}
                        isReadmeAvailable={!!state.readme}
                        handleReadMeClick={handleReadMeClick}
                        handleCommentClick={toggleDraftComments}
                        commentsPresent={state.latestDraft?.commentsCount > 0}
                        isDraftMode={isProtected && !!state.latestDraft}
                        isApprovalPending={state.latestDraft?.draftState === 4}
                        approvalUsers={state.latestDraft?.approvers}
                        showValuesPostfix={true}
                        reload={initialise}
                        isValues={isValues}
                        setIsValues={setIsValues}
                    />
                    {renderValuesView()}
                    {SaveChangesModal && state.showSaveChangsModal && (
                        <SaveChangesModal
                            appId={Number(appId)}
                            envId={-1}
                            resourceType={3}
                            resourceName="BaseDeploymentTemplate"
                            prepareDataToSave={prepareDataToSave}
                            toggleModal={toggleSaveChangesModal}
                            latestDraft={state.latestDraft}
                            reload={initialise}
                        />
                    )}
                    {state.showConfirmation && <SaveConfirmationDialog save={save} />}
                </div>
                {DraftComments && state.showComments && (
                    <DraftComments
                        draftId={state.latestDraft?.draftId}
                        draftVersionId={state.latestDraft?.draftVersionId}
                        toggleDraftComments={toggleDraftComments}
                    />
                )}
            </div>
        </DeploymentConfigContext.Provider>
    )
}
