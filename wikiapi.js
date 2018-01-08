var WIKI_BASE_URL = "//wiki.mabinogiworld.com/api.php";

function searchWiki(query, success, error) {
	$.ajax({
		"url": WIKI_BASE_URL,
		"method": "GET",
		"data": {
			"action": "opensearch",
			"format": "json",
			"formatversion": 2,
			"search": query,
			"namespace": 0,
			"limit": 10,
			"suggest": true,
		},
		"success": function (data) {
			success(data[1] || [], data[3] || []);
		},
		"error": error || console.warn,
	});
}

function getPageContent(page, success, error) {
	$.ajax({
		"url": WIKI_BASE_URL,
		"method": "GET",
		"data": {
			"action": "query",
			"prop": "revisions",
			"rvprop": "content",
			"format": "json",
			"titles": page,
		},
		"success": function (data) {
			var pages = data.query.pages;
			for (var pid in pages) {
				if (pid == -1) {
					error(null, "404", "missing");
				} else {
					success(pages[pid].revisions[0]["*"]);
				}
				break;
			}
		},
		"error": error || console.warn,
	});
}
