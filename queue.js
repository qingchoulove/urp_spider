'use strict';

import queue from 'async/queue';
import {login, getInfo} from './qfnu';
import {connectDatabase, databaseURL} from './db';
import Info from './model';

let info;

let q = queue(async function(task, callback) {
  try {
    info = await getInfo(task.id, task.cookie);
    if (info.std_id != null) {
      await new Info(info).save();
    }
  } catch(err) {
    console.log(`${task.id} fetch error: ${err.message}`);
  }
  callback(task.id);
}, 10);

(async () => {
  try {
    await connectDatabase(databaseURL + '2012');
    console.log('db connect');
    let cookie = await login('xxxx', 'xxxx');
    if (!cookie) {
      throw Error('登录失败');
    }
    for (var i = 20120001; i < 20121000; i++) {
      q.push({id:i, cookie:cookie}, async function (id) {
        // console.log(`${id} finish!`);
      });
    };
  } catch(err) {
    console.log(err.message);
  }
})();