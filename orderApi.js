var config = require('./config');
var HmacSha1 = require('./crypto-js/hmac-sha1');
var sha1 = require('./crypto-js/sha1');
var https = require("https");
var querystring = require('querystring');
var Base64 = require('./crypto-js/enc-base64');
var util = require('./util')

let data = util.sort_ASCII({
    "stoneIds": "5dd6576044f03f07e67601fd",
    "brandName":"品牌商名称test",
    "storeName":"店铺名称test",
    "storeAddr":"店铺地址test",
    "customName":"客户姓名test",
    "brandOrder":"NO201909010001",
    "deliverDate":"2019-09-01",
    "contactName":"某某某",
    "contactPhone":"13666666666"
})

const param = querystring.stringify(data);
const nonce = util.randomWord(false, 36)
const timeStamp = Math.round(new Date().getTime())

let url = "POSThttps://" + config.domain + config.orderApi + nonce + timeStamp + param
let urlBs64 = Buffer.from(url).toString('base64')
let secretSha1 = sha1(config.apiSecret).toString()
let signature = Base64.stringify(HmacSha1(urlBs64, secretSha1))

const options = {
    hostname: config.domain,
    path: config.orderApi,
    method: 'POST',
    headers: {
        'X-CA-ACCESSKEY': config.apiKey,
        'X-CA-NONCE': nonce,
        'X-CA-TIMESTAMP': timeStamp,
        'X-CA-SIGNATURE': signature,
        'Accept': 'application/json;version=2.0',
        'Content-Type': 'application/json; charset=UTF-8'
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
// 写入数据到请求主体
req.write(JSON.stringify(data));
req.end();

