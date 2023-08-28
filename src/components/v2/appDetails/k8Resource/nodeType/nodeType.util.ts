import { iNode } from '../../appDetails.type'

export const getNodeStatus = (node: iNode) => {
    if (node.info && node.info.length > 0) {
        const statusReason = node.info.filter((_info) => {
            return _info.name === 'Status Reason'
        })
        if (statusReason && statusReason.length > 0) {
            let status =  statusReason[0].value;
            if(status ==='ContainerCreating'){  // quick fix for status display
                status = 'Container Creating'
            }
            return status;
        }
    }
    if (node.status) {
        return node.status
    }
    if (node.health?.status) {
        return node.health?.status
    }
    return ''
}