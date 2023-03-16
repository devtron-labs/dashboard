import { ConfigAppListType } from "../../../AppGroup.service"

const result = () => {
    return [
        {
            "id": 19,
            "name": "testing-app"
        },
        {
            "id": 23,
            "name": "testing-4"
        },
        {
            "id": 1,
            "name": "ajay-app"
        },
        {
            "id": 81,
            "name": "docker-hub-test"
        },
        {
            "id": 101,
            "name": "aravind-child"
        },
        {
            "id": 374,
            "name": "prakash-1mar"
        }
    ]
}

export async function mockConfigAppList(): Promise<ConfigAppListType> {
    const response = {
        code: 200,
        status: 'OK',
        result: result(),
    }
    const mockJsonPromise = response
    return mockJsonPromise
}