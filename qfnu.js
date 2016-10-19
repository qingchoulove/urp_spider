'use strict';

import iconv from 'iconv-lite';
import cheerio from 'cheerio';
import request from './Arequest';

const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

/**
 * 获取指定学号的信息
 */
export async function getInfo(userId, cookie) {
  
  let option = {
    method: 'POST',
    headers: {
      'Cookie': cookie
    },
    data: {
      LS_XH: userId,
      resultPage: 'http://202.194.188.19:80/reportFiles/cj/cj_zwcjd.jsp?'
    }
  };
  let response = await request('http://202.194.188.19/setReportParams', option);
  let location = response.headers['location'];
  option = {
    method: 'GET',
    headers: {
      'Host': '202.194.188.19',
      'Cookie': cookie,
      'User-Agent': userAgent
    },
    encoding: null
  };
  response = await request(location, option);
  if (response.statusCode != 200) {
    throw Error('抓取错误');
  }
  let body = iconv.decode(response.body, 'gb2312');
  let $ = cheerio.load(body);
  let tableInfo = $('#report1 tr').eq(1);
  let tableNation = $('#report1 tr').eq(2);
  let tableClass = $('#report1 tr').eq(3);
  let tableMajor = $('#report1 tr').eq(4);
  let tableInstitute = $('#report1 tr').eq(5);
  let info = {
    'name': tableInfo.find('td').eq(1).text(),
    'std_id': tableInfo.find('td').eq(3).text(),
    'sex': tableInfo.find('td').eq(5).text(),
    'id': tableInfo.find('td').eq(7).text(),
    'nation': tableNation.find('td').eq(1).text(),
    'class': tableClass.find('td').eq(1).text(),
    'institute': tableMajor.find('td').eq(1).text(),
    'major': tableInstitute.find('td').eq(1).text()
  };
  return info;
}
/**
 * 登录教务系统
 */
export async function login(userId, password) {
  let url;
  let option;
  let response;
  let body;
  let cookie;
  try {
    url = 'http://ids.qfnu.edu.cn/authserver/login?service=http%3A%2F%2F202.194.188.19%2Fcaslogin.jsp';
    option = {
        method: 'GET',
        headers: {
          'User-Agent': userAgent
        }
    };
    response  = await request(url, option);
    body = response.body;
    cookie = response.headers['set-cookie'];
    cookie = cookie[0].match(/JSESSIONID=\S+;/g);
    let ltKey = body.match(/LT-\d+-[A-Za-z0-9]+-\d+/g);
    option = {
      method: 'POST',
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie[0]
      },
      data: {
        username: userId,
        password: password,
        lt: ltKey[0],
        execution: 'e1s1',
        _eventId: 'submit',
        submit: '登陆'
      }
    };
    // 第二次访问，post登陆
    response = await request(url, option);
    if (response.statusCode != 302) {
      throw Error('登陆失败，请检查账户/密码是否正确');
    }
    // 可在此保留信息门户cookie
    let location = response.headers['location'];
    // 第三次访问
    option = {
      method: 'GET',
      headers: {
        'User-Agent': userAgent
      }
    };
    response = await request(location, option);
    if (response.statusCode != 302) {
      throw Error('网络错误!');
    }
    cookie = response.headers['set-cookie'];
    cookie = cookie[0].match(/JSESSIONID=\S+;/g);
    location = response.headers['location'];
    option = {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Cookie': cookie[0]
      },
      encoding: null
    };
    response = await request(location, option);
    if (response.statusCode != 200) {
      throw Error('登陆失败');
    }
    body = iconv.decode(response.body, 'gb2312');
    if (body.indexOf('学分制综合教务') <= 0) {
      throw Error('登录失败');
    }
    return cookie[0];
  } catch(err) {
    return false;
  }
}