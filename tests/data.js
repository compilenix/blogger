var data = [  // tests (restart's server for each element)
	{
		config: [
			{key: 'ClearCacheOnStart', value: true},
			{key: 'language', value: 'de'}
		],
		units: [ // units (http request's of this test)
			{
				sendHeader:
				{
					method: "GET",
					path: "/"
				},
				expectedHeader:
				{
					"code": 200,
					"Content-Type": "text/html"
				}
			},
			{
				sendHeader:
				{
					method: "GET",
					path: "/rss"
				},
				expectedHeader:
				{
					"code": 200,
					"Content-Type": "text/html"
				}
			}
		]
	},
	{
		config: [
			{key: 'ClearCacheOnStart', value: true},
			{key: 'language', value: 'en'}
		],
		units: [ // units (http request's of this test)
			{
				sendHeader:
				{
					method: "GET",
					path: "/"
				},
				expectedHeader:
				{
					"code": 200,
					"Content-Type": "text/html"
				}
			},
			{
				sendHeader:
				{
					method: "GET",
					path: "/rss"
				},
				expectedHeader:
				{
					"code": 200,
					"Content-Type": "text/html"
				}
			}
		]
	}
];

exports.data = data;
