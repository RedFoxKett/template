// Tab code.
function tabChange() {
	var $this = $(this);
	var cls = ".tab-" + $this.data("lookfor");

	// Set this to be the only active tab
	$this.parent().find("> li").removeClass("active");
	$this.parent().find("> li").addClass("inactive");

	// Hide all but the one tab
	var top = $this.parent().parent();
	top.find("> div").hide();
	var tab = top.find("> " + cls);
	tab.show();

	// Hide sections irrelevant to the tab
	tab.find(".tab-hide").hide();

	// Show only relevant ones
	tab.find(cls).show();

	$this.addClass("active");
	$this.removeClass("inactive");
	return false;
}

jQuery(function($) {
 	$(".tabdiv > ul li").each(function () {
 		var $this = $(this);
		var a = $this.find("a");
		$this.data("lookfor", a.attr("href").substr(1));
		$(a).attr("href", ""); // Opera hates real hrefs

		$this.click(tabChange);
 	});
 	$(".tabdiv > ul li:first").click();
});

// Hidden sections
jQuery(function($) {
	$(".hidden-rows").each(function () {
		var $this = $(this);

		$this.children(":not(.hidden-text)").hide();
		$this.children(".hidden-text").click(function () {
			$(this).hide().parent().find(":not(.hidden-text)").show();
		});
	})
});

// Help sections
jQuery(function($) {
	// Add tooltip span
	$('<span id="tooltip" style="position:absolute; display: none">').mouseleave(tooltipMaybeHide).appendTo("body");

	// Hook tooltips
	$(".help").each(function () {
		var $this = $(this);
		var help = $this.text();

		tooltip($this.text("?"), help);
	});
});

function tooltip($elem, text) {
	$elem.data("tooltip", text).mouseenter(tooltipShow).mouseleave(tooltipMaybeHide);
}

function tooltipShow() {
	var $this = $(this), offset = $this.offset();
	offset.top += $this.height();
	$("#tooltip").text($this.data("tooltip")).css(offset).data("for", this).show();
}

function tooltipMaybeHide(e) {
	$tooltip = $("#tooltip");

	if (e.toElement != $tooltip[0] && e.toElement != $tooltip.data("for")) {
		$tooltip.data("for", null).hide().text("");
	}
}

function hidecheck(s) {
	$(s).prop("checked", false).parent().hide();
}

function prefixIfTrue(pfx, x, sfx) {
	return x ? pfx + x + (sfx || "") : x;
}

function filterAndPrefixAll(pfx, arr, sfx) {
	var out = "";
	sfx = sfx || "";
	for (var i = 0; i < arr.length; ++i) {
		if (arr[i]) out += pfx + arr[i] + sfx;
	}
	return out;
}

function htmlDecode(input)
{
	var doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
}
