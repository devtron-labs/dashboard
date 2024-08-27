/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Subject } from '../Subject'

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
    let [, unsubsribe] = subject.subscribe(subscriber)
    subject.publish('hello')
    subject.publish('world')
    subject.publish('!!!')
    expect(subject.size()).toStrictEqual(1)
    expect(rec.length).toStrictEqual(3)
    unsubsribe()
    expect(subject.size()).toStrictEqual(0)
})

test('Unsubscribe subscribe test', () => {
    let rec: Array<string> = new Array()
    let subject = new Subject()
    let subscriber = (s: unknown) => {
        rec.push(s as string)
    }
    let [added, unsubsribe] = subject.subscribe(subscriber)
    unsubsribe()
    ;[added, unsubsribe] = subject.subscribe(subscriber)
    subject.publish('hello')
    subject.publish('world')
    subject.publish('!!!')
    expect(subject.size()).toStrictEqual(1)
    expect(rec.length).toStrictEqual(3)
    unsubsribe()
    expect(subject.size()).toStrictEqual(0)
})
