import { SERVER_MODE } from "../../../../config"
import { mainContext } from '../../../common/navigation/NavigationRoutes'

export const chartLists = [
    {
        active: true,
        id: +'ash-exp-test',
        isEditable: true,
        isOCIRegistry: true,
        name: 'ash-exp-test',
        registryProvider: 'docker-hub',
    },
    {
        active: true,
        id: +'shivani-exp-test',
        isEditable: true,
        isOCIRegistry: true,
        name: 'shivani-exp-test',
        registryProvider: 'docker-hub',
    },
    {
        active: true,
        id: +'test',
        isEditable: false,
        isOCIRegistry: false,
        name: 'test',
        registryProvider: 'docker-hub',
    },
    {
        active: true,
        id: +'bitnamiOci',
        isEditable: false,
        isOCIRegistry: false,
        name: 'bitnamiOci',
        registryProvider: 'ecr',
    },
]

const userContextMock = {
    serverMode: SERVER_MODE.FULL,
}

export const contextWrapper = (baseComponent) => {
    return <mainContext.Provider value={userContextMock}>{baseComponent}</mainContext.Provider>
}