'use strict'

import queue from 'async/queue'
import { getInfo } from './qfnu'
import { connectDatabase, databaseURL } from './db'
import Info from './model'
import sleep from 'sleep'

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

let q = queue(async function (task, callback) {
    let info
    try {
        info = await Info.findOne({
            std_id: task.id
        })
        if (info) {
            //  && info.class !== ''
            callback(info)
            return
        }
        let sleepTime = getRandomInt(10)
        console.log(`sleep ${sleepTime}s`)
        sleep.sleep(sleepTime)
        info = await getInfo(task.id, task.cookie)
        if (info.std_id != '') {
            await Info.update({std_id: info.std_id}, info, {upsert: true})
            // await new Info(info).save()
        }
    } catch (err) {
        console.log(`${task.id} fetch error: ${err.message}`)
    }
    callback(info)
}, 10);

(async () => {
    try {
        await connectDatabase(databaseURL + '2018')
        // console.log('db connect');
        // let cookie = await login('xxxx', 'xxxx');
        let cookie = 'JSESSIONID=cgaNzX-plTXNId3ZiN7uw'
        if (!cookie) {
            throw Error('登录失败')
        }
        for (var i = 2018415001; i < 2018416001; i++) {
            q.push({ id: i, cookie: cookie }, async function (info) {
                if (!info) {
                    console.log('continue')
                    return
                }
                console.log(`[${info.major}]${info.std_id}-${info.name} finish!`)
            })
        }
    } catch (err) {
        console.log(err.message)
    }
})()