class Cache {
    private static cacheRepository: Record<string, any> = {}

    constructor() {
        Cache.cacheRepository = {}
    }

    static get = async <T = any>(name: string, promiseCallback: () => Promise<T>) => {
        if (Cache.cacheRepository[name]) {
            return Cache.cacheRepository[name] as T
        }
        const response = await promiseCallback()
        Cache.cacheRepository[name] = response
        return response
    }

    static clear = () => {
        Cache.cacheRepository = {}
    }
}

export default Cache
