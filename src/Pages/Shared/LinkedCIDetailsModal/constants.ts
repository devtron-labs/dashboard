import { LinkedCIAppDto } from './types'
import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS } from '../../../config'

const appListLoading: LinkedCIAppDto[] = Array.from(Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys()).map((index) => ({
    appId: index,
    appName: '',
    deploymentStatus: 'succeeded',
    environmentId: 0,
    environmentName: '',
    triggerMode: '',
}))

export default appListLoading

// const EmptyState = () => {
//     return (
//         <GenericEmptyState
//             image={EmptyStateImage}
//             classname="fs-16"
//             title="No Results"
//             subTitle="We could not find any matching results"
//             isButtonAvailable
//             renderButton={renderClearFilterButton}
//         />
//     )
// }

// const DeniedState = () => {
//     return (
//         <div className="bcn-0">
//             <GenericEmptyState
//                 image={EmptyStateImage}
//                 classname="fs-16"
//                 title="User Denied"
//                 subTitle="You do not have Permission to access this page"
//             />
//         </div>
//     )
// }

// import EmptyStateImage from '../../../assets/img/empty-noresult@2x.png'
// const renderClearFilterButton = () => {
//     return <button type="button">Clear Filters</button>
// }
