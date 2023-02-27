import { Subject } from '../Subject';

test('Subscriber test', () => {
    let rec: Array<string> = new Array()
    let subject = new Subject()
    let subscriber = (s: unknown) => {
        rec.push(s as string)
    }
    subject.subscribe(subscriber)
    subject.publish('hello')
    subject.publish('world')
    expect(subject.size()).toStrictEqual(1)
    expect(rec.length).toStrictEqual(2)
    subject.unsubscribeAll()
    expect(subject.size()).toStrictEqual(0)
})

test('Subscriber removal test', () => {
    let rec: Array<string> = new Array()
    let subject = new Subject()
    let subscriber = (s: unknown) => {
        rec.push(s as string)
    }
    let [added, unsubsribe] = subject.subscribe(subscriber)
    subject.publish('hello')
    subject.publish('world')
    subject.publish('!!!')
    expect(subject.size()).toStrictEqual(1)
    expect(rec.length).toStrictEqual(3)
    unsubsribe()
    expect(subject.size()).toStrictEqual(0)
})

test("Unsubscribe subscribe test", () => {
    let rec: Array<string> = new Array()
    let subject = new Subject()
    let subscriber = (s: unknown) => { rec.push(s as string) }
    let [added, unsubsribe] = subject.subscribe(subscriber)
    unsubsribe();
    [added, unsubsribe] = subject.subscribe(subscriber)
    subject.publish("hello")
    subject.publish("world")
    subject.publish("!!!")
    expect(subject.size()).toStrictEqual(1)
    expect(rec.length).toStrictEqual(3)
    unsubsribe()
    expect(subject.size()).toStrictEqual(0)
})