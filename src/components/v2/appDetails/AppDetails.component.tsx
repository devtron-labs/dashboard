import React, { useState } from 'react';
import './appDetails.scss';
import { useParams } from 'react-router';
import { AppStreamData, AppType } from './appDetails.type';
import IndexStore from './index.store';
import EnvironmentStatusComponent from './sourceInfo/environmentStatus/EnvironmentStatus.component';
import EnvironmentSelectorComponent from './sourceInfo/EnvironmentSelector.component';
import SyncErrorComponent from './SyncError.component';
import { useEventSource } from '../../common';
import { AppLevelExternalLinks } from '../../externalLinks/ExternalLinks.component';
import NodeTreeDetailTab from './NodeTreeDetailTab';
import { ExternalLink, OptionTypeWithIcon } from '../../externalLinks/ExternalLinks.type';
import '../lib/bootstrap-grid.min.css'

const AppDetailsComponent = ({
    externalLinks,
    monitoringTools,
}: {
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
}) => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>();
    const [streamData, setStreamData] = useState<AppStreamData>(null);
    const appDetails = IndexStore.getAppDetails();
    const Host = process.env.REACT_APP_ORCHESTRATOR_ROOT;

    // if app type not of EA, then call stream API
    const syncSSE = useEventSource(
        `${Host}/api/v1/applications/stream?name=${appDetails?.appName}-${appDetails?.environmentName}`,
        [params.appId, params.envId],
        !!appDetails?.appName &&
            !!appDetails?.environmentName &&
            appDetails?.appType?.toString() != AppType.EXTERNAL_HELM_CHART.toString(),
        (event) => setStreamData(JSON.parse(event.data)),
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div>
                <EnvironmentSelectorComponent />
                <EnvironmentStatusComponent appStreamData={streamData}/>
            </div>

            <SyncErrorComponent appStreamData={streamData} />
            <AppLevelExternalLinks helmAppDetails={appDetails} externalLinks={externalLinks} monitoringTools={monitoringTools} />
            <NodeTreeDetailTab appDetails={appDetails} externalLinks={externalLinks} monitoringTools={monitoringTools} />
            
        </div>
    );
};

// export function NodeTreeDetailTab({
//     appDetails,
//     externalLinks,
//     monitoringTools,
//     isDevtronApp = false,
// }: {
//     appDetails: AppDetails
//     externalLinks: ExternalLink[]
//     monitoringTools: OptionTypeWithIcon[]
//     isDevtronApp?: boolean
// }) {
//     const params = useParams<{ appId: string; envId: string; nodeType: string }>()
//     const { path, url } = useRouteMatch()
//     const history = useHistory()
//     const [clickedNodes, registerNodeClick] = useState<Map<string, string>>(new Map<string, string>())
//     const [applicationObjectTabs] = useSharedState(
//         AppDetailsStore.getAppDetailsTabs(),
//         AppDetailsStore.getAppDetailsTabsObservable(),
//     )
//     const tabRef = useRef<HTMLDivElement>(null)
//     const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()

//     useEffect(() => {
//         const _pods = IndexStore.getNodesByKind(NodeType.Pod)
//         const isLogAnalyserURL = window.location.href.indexOf(URLS.APP_DETAILS_LOG) > 0
//         AppDetailsStore.initAppDetailsTabs(url, _pods.length > 0, isLogAnalyserURL)
//     }, [params.appId, params.envId])

//     const handleCloseTab = (e: any, tabIdentifier: string) => {
//         e.stopPropagation()

//         // Clear pod related log search term on close tab action
//         clearLogSearchTerm(tabIdentifier)

//         const pushURL = AppDetailsStore.removeAppDetailsTabByIdentifier(tabIdentifier)
//         setTimeout(() => {
//             if (pushURL) {
//                 history.push(pushURL)
//             }
//         }, 1)
//     }

//     const clearLogSearchTerm = (tabIdentifier: string): void => {
//         if (logSearchTerms) {
//             const identifier = tabIdentifier.toLowerCase()

//             if (identifier.startsWith(NodeType.Pod.toLowerCase()) && logSearchTerms[identifier]) {
//                 setLogSearchTerms({
//                     ...logSearchTerms,
//                     [identifier]: '',
//                 })
//             }
//         }
//     }

//     const handleFocusTabs = () => {
//         if (tabRef?.current) {
//             tabRef.current.focus()
//         }
//     }

//     return (
//         <>
//             {appDetails.resourceTree?.nodes?.length > 0 && (
//                 <>
//                     <div
//                         className="resource-tree-wrapper flexbox pl-20 pr-20"
//                         style={{ outline: 'none' }}
//                         tabIndex={0}
//                         ref={tabRef}
//                     >
//                         <ul className="tab-list">
//                             {applicationObjectTabs.map((tab: ApplicationObject, index: number) => {
//                                 return (
//                                     <>
//                                         <li
//                                             key={index + 'tab'}
//                                             id={`${params.nodeType}_${tab.name}`}
//                                             className="flex left ellipsis-right "
//                                         >
//                                             <Tippy
//                                                 className={`${
//                                                     tab.name === AppDetailsTabs.log_analyzer ||
//                                                     tab.name === AppDetailsTabs.k8s_Resources
//                                                         ? 'hide-section'
//                                                         : ''
//                                                 } default-tt `}
//                                                 arrow={false}
//                                                 placement="top"
//                                                 content={
//                                                     tab.name !== AppDetailsTabs.log_analyzer &&
//                                                     tab.name !== AppDetailsTabs.k8s_Resources &&
//                                                     tab.title
//                                                 }
//                                             >
//                                                 <div className="flex">
//                                                     <div
//                                                         className={`${
//                                                             tab.isSelected ? 'resource-tree-tab bcn-0 cn-9' : ''
//                                                         } flex left pl-12 pt-8 pb-8 pr-12 `}
//                                                     >
//                                                         <NavLink
//                                                             to={`${tab.url}`}
//                                                             className={`resource-tree__tab-hover tab-list__tab resource-tab__node cursor cn-9 fw-6 no-decor `}
//                                                         >
//                                                             <div
//                                                                 className={`flex left ${tab.isSelected ? 'cn-9' : ''} ${
//                                                                     tab.isDeleted && 'tab-list__deleted cr-5'
//                                                                 }`}
//                                                             >
//                                                                 {tab.title === AppDetailsTabs.log_analyzer ? (
//                                                                     <span className="icon-dim-16 resource-tree__tab-hover fcb-9">
//                                                                         {' '}
//                                                                         <LogAnalyzerIcon />
//                                                                     </span>
//                                                                 ) : (
//                                                                     ''
//                                                                 )}
//                                                                 {tab.title === AppDetailsTabs.k8s_Resources ? (
//                                                                     <span className="icon-dim-16 resource-tree__tab-hover fcn-9 ">
//                                                                         {' '}
//                                                                         <K8ResourceIcon />
//                                                                     </span>
//                                                                 ) : (
//                                                                     ''
//                                                                 )}
//                                                                 <span
//                                                                     className={`${
//                                                                         tab.name !== AppDetailsTabs.k8s_Resources &&
//                                                                         tab.name !== AppDetailsTabs.log_analyzer
//                                                                             ? 'mr-8'
//                                                                             : 'ml-8 text-capitalize '
//                                                                     } fs-12 `}
//                                                                 >
//                                                                     {tab.name}
//                                                                 </span>
//                                                             </div>
//                                                         </NavLink>

//                                                         {tab.name !== AppDetailsTabs.log_analyzer &&
//                                                             tab.name !== AppDetailsTabs.k8s_Resources && (
//                                                                 <div className="resource-tab__close-wrapper flex br-5">
//                                                                     <Cross
//                                                                         onClick={(e) => handleCloseTab(e, tab.title)}
//                                                                         className="icon-dim-16 cursor"
//                                                                     />
//                                                                 </div>
//                                                             )}
//                                                     </div>
//                                                     <div
//                                                         className={` ${
//                                                             !tab.isSelected || !(tab.isSelected && index - 1)
//                                                                 ? 'resource-tree-tab__border'
//                                                                 : ''
//                                                         }`}
//                                                     ></div>
//                                                 </div>
//                                             </Tippy>
//                                         </li>
//                                     </>
//                                 )
//                             })}
//                         </ul>
//                     </div>
//                     <Switch>
//                         <Route
//                             path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/group/:resourceName`}
//                             render={() => {
//                                 return (
//                                     <K8ResourceComponent
//                                         clickedNodes={clickedNodes}
//                                         registerNodeClick={registerNodeClick}
//                                         handleFocusTabs={handleFocusTabs}
//                                         externalLinks={externalLinks}
//                                         monitoringTools={monitoringTools}
//                                         isDevtronApp={isDevtronApp}
//                                     />
//                                 )
//                             }}
//                         />
//                         <Route
//                             path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/:podName`}
//                             render={() => {
//                                 return (
//                                     <NodeDetailComponent
//                                         logSearchTerms={logSearchTerms}
//                                         setLogSearchTerms={setLogSearchTerms}
//                                     />
//                                 )
//                             }}
//                         />
//                         <Route
//                             path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType`}
//                             render={() => {
//                                 return (
//                                     <K8ResourceComponent
//                                         clickedNodes={clickedNodes}
//                                         registerNodeClick={registerNodeClick}
//                                         handleFocusTabs={handleFocusTabs}
//                                         externalLinks={externalLinks}
//                                         monitoringTools={monitoringTools}
//                                         isDevtronApp={isDevtronApp}
//                                     />
//                                 )
//                             }}
//                         />
//                         <Route
//                             path={`${path}/${URLS.APP_DETAILS_K8}`}
//                             render={() => {
//                                 return (
//                                     <K8ResourceComponent
//                                         clickedNodes={clickedNodes}
//                                         registerNodeClick={registerNodeClick}
//                                         handleFocusTabs={handleFocusTabs}
//                                         externalLinks={externalLinks}
//                                         monitoringTools={monitoringTools}
//                                         isDevtronApp={isDevtronApp}
//                                     />
//                                 )
//                             }}
//                         />
//                         <Route
//                             exact
//                             path={`${path}/${URLS.APP_DETAILS_LOG}`}
//                             render={() => {
//                                 return (
//                                     <LogAnalyzerComponent
//                                         logSearchTerms={logSearchTerms}
//                                         setLogSearchTerms={setLogSearchTerms}
//                                     />
//                                 )
//                             }}
//                         />
//                         <Redirect to={`${path}/${URLS.APP_DETAILS_K8}`} />
//                     </Switch>
//                 </>
//             )}
//         </>
//     )
// }

export default AppDetailsComponent;
