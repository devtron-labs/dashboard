import { LogFilter } from './LogFilter';

test("single grep test", () => {
    let grepToken = {_args:"hello", a:2, b:2}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "and", "you", "know", "who"]
    let expectedOut = ["am", "here", "hello", "and", "you"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("single grep test double match consecutive", () => {
    let grepToken = {_args:"hello", a:2, b:2}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "hello", "and", "you", "know", "who"]
    let expectedOut = ["am", "here", "hello", "hello", "and", "you"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("single grep test double match 1 gap", () => {
    let grepToken = {_args:"hello", a:2, b:2}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "and", "hello", "and", "you", "know", "who"]
    let expectedOut = ["am", "here", "hello", "and", "hello", "and", "you"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("single grep test double match 2 gap", () => {
    let grepToken = {_args:"hello", a:2, b:2}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "and", "we", "hello", "and", "you", "know", "who"]
    let expectedOut = ["am", "here", "hello", "and", "we", "hello", "and", "you"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("single grep test double match 4 gap", () => {
    let grepToken = {_args:"hello", a:3, b:2}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "or", "not", "and", "we", "hello", "and", "you", "know", "who"]
    let expectedOut = ["am", "here", "hello", "or", "not", "and", "we", "hello", "and", "you", "know"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    let remaining = logFilter.stop()
    remaining.forEach((value, index, arr) => {
        actualOut.push(value)
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("single grep test double match 3 gap a+b=5", () => {
    let grepToken = {_args:"hello", a:3, b:2}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "or", "not", "and", "hello", "and", "you", "know", "who"]
    let expectedOut = ["am", "here", "hello", "or", "not", "and", "hello", "and", "you", "know"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    let remaining = logFilter.stop()
    remaining.forEach((value, index, arr) => {
        actualOut.push(value)
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("single grep test double match 3 gap a+b=5 and a<b", () => {
    let grepToken = {_args:"hello", a:2, b:3}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "or", "not", "and", "hello", "and", "you", "know", "who"]
    let expectedOut = ["i", "am", "here", "hello", "or", "not", "and", "hello", "and", "you"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    let remaining = logFilter.stop()
    remaining.forEach((value, index, arr) => {
        actualOut.push(value)
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("single grep test double match 3 gap", () => {
    let grepToken = {_args:"hello", a:2, b:2}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "and", "we", "are", "hello", "and", "you", "know", "who"]
    let expectedOut = ["am", "here", "hello", "and", "we", "are", "hello", "and", "you"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("single grep test double match 4 gap", () => {
    let grepToken = {_args:"hello", a:2, b:2}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "and", "we", "are", "here1", "hello", "and", "you", "know", "who"]
    let expectedOut = ["am", "here", "hello", "and", "we", "are", "here1", "hello", "and", "you"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("single grep test double match 5 gap", () => {
    let grepToken = {_args:"hello", a:2, b:2}
    let grepTokens = [grepToken]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "and", "we", "miss", "are", "here1", "hello", "and", "you", "know", "who"]
    let expectedOut = ["am", "here", "hello", "and", "we", "are", "here1", "hello", "and", "you"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})

test("multi grep test", () => {
    let grepToken1 = {_args:"hello", a:2, b:2}
    let grepToken2 = {_args:"and"}
    let grepTokens = [grepToken1, grepToken2]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "and", "you", "know", "who"]
    let expectedOut = ["and"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    expect(actualOut.length).toStrictEqual(expectedOut.length)
    expect(actualOut).toEqual(expectedOut)
})

test("multi grep with multi match test", () => {
    let grepToken1 = {_args:"hello", a:1, b:2}
    let grepToken2 = {_args:"and"}
    let grepTokens = [grepToken1, grepToken2]
    let logFilter = new LogFilter(grepTokens)
    let input = ["i", "am", "here", "hello", "and", "you", "hello", "there", "here", "where", "why"]
    let expectedOut = ["and"]
    let actualOut = []
    input.forEach((value, index, arr) => {
        let out = logFilter.filter(value)
        out.forEach((val) => {
            actualOut.push(val)
        })
    })
    expect(actualOut).toEqual(expectedOut)
    expect(actualOut.length).toStrictEqual(expectedOut.length)
})