var HmacSha1 = require('./crypto-js/hmac-sha1');
var sha1 = require('./crypto-js/sha1');
var Base64 = require('./crypto-js/enc-base64');
var https = require("https");
var querystring = require('querystring');
var util = require('./util')
var config = require('./config');

let data = util.sort_ASCII({
    'pageNum': 1,     //页数
    'pageSize': 10,   //数量
    'customCode': config.customCode
})

const param = querystring.stringify(data);
const nonce = util.randomWord(false, 36)
const timeStamp = Math.round(new Date().getTime())

let url = "GEThttps://" + config.domain + config.inventoryApi + '?' + param + nonce + timeStamp
let urlBs64 = Buffer.from(url).toString('base64')
let secretSha1 = sha1(config.apiSecret).toString()
let signature = Base64.stringify(HmacSha1(urlBs64, secretSha1))

const options = {
    hostname: config.domain,
    path: config.inventoryApi + '?' + param,
    method: 'GET',
    headers: {
        'X-CA-ACCESSKEY': config.apiKey,
        'X-CA-NONCE': nonce,
        'X-CA-TIMESTAMP': timeStamp,
        'X-CA-SIGNATURE': signature,
    }
};

const req = https.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`响应主体: ${chunk}`);
    });
    res.on('end', () => {
        console.log('响应中已无数据。');
    });
});

req.on('error', (e) => {
    console.error(`请求遇到问题: ${e.message}`);
});

req.end();