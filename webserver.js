let express = require('express');
let util = require('util');
let Iconv = require('iconv').Iconv;
let cheerio = require('cheerio');

let app = express();


// 서점 검색
// 모바일 위치 기반 + isbn에 해당하는 책의 재고를 보여줄 수 있어야 함.
app.get('/bookstore/:isbn&:lat&:lon', (req, res) => {

	// 서울 교보문고 위치
	// 37.514583, 127.100950

	let http = require('http');
	let remainBooksURL = util.format('http://www.kyobobook.co.kr/prom/2013/general/StoreStockTable.jsp?barcode=%s&ejkgb=KOR', req.params.isbn); // 일단 교보문고 url을 넣음.

	// 서점 사이트에 ISBN 도서의 재고 수량 데이터 요청.
	http.get(remainBooksURL, (res2) => {

		let iconv = new Iconv('euc-kr', 'utf-8//translit//ignore');
		let rawData;

		res2.on('data', (chunk) => {
			rawData += iconv.convert(chunk);
		});

		// Parsing raw data
		res2.on('end', () => {
			res.send(parsingResponse(rawData));
		});
		
	});


	// 책 재고 데이터 파싱
	// 임시로 교보문고만 호환가능하도록 코딩
	// TODO: rawData가 비어있을 경우 에러처리를 해야함.
	function parsingResponse(rawData) {
		let $ = cheerio.load(rawData);
		let storeNameElements = $('table tbody tr th');
		let remainBookElements = $('table tbody tr td')
		let responseJSON = new Object();

		let storeNames = new Array();
		let remainBooks = new Array();

		responseJSON.response = new Array();

		// 이렇게 하면 되는데 람다로 표현 () => 하면 작동안함 쒸뿔~~~
		storeNameElements.each(function() {
			storeNames.push($(this).text());
		});

		// 람다식으로 표현하면 작동안함... 왜인지 찾아보기
		// storeNames.each(() => {
		// 	console.log($(this).text());
		// });

		remainBookElements.each(function() {
			remainBooks.push($(this).find('a').text());
		});

		for (i=0; i<storeNames.length; i++) {
			let jObject = new Object();
			jObject.storename = storeNames[i];
			jObject.remainbook = remainBooks[i];

			responseJSON.response.push(jObject);
		}

		return JSON.stringify(responseJSON);
	}

});

app.listen(3000, () => {
	console.log('Book remain counter app listening on port 3,000 port');
});

