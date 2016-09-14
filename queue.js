'use strict';

import queue from 'async/queue';
import {login, getInfo} from './qfnu';
import {connectDatabase, databaseURL} from './db';
import Info from './model';

let info;

let q = queue(async function(task, callback) {
  info = await getInfo(task.id, task.cookie);
  if (info.name) {
    await new Info(info).save();
  } else {
    errors++;
  }
  callback();
}, 10);

(async () => {
  try {
    await connectDatabase(databaseURL);
    console.log('db connect');
    let cookie = await login('user_id', 'pwd');
    if (!cookie) {
      throw Error('登录失败');
    }
    for (var i = 'xxxx'; i < 'xxxx'; i++) {　　
  　　q.push({id:i, cookie:cookie},function (err) {
  　　　　console.log('finished');
  　　});
    };
  } catch(err) {
    console.log(err.message);
  }
})();