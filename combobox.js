$(function () {
	// Add popup and hooks for text inputs.
	$("input.combobox").each(function () {
		var $this = $(this).wrap('<span class="combobox-parent">');
		var visible = $this.is(":visible");
		
		$('<div class="combobox-popup">').insertAfter($this).hide();

		$this
			.keyup(comboboxTextInput)
			.blur(comboboxHidePopup)
			.change(comboboxTextUpdateValue);
		if (!visible) $span.hide();
	});

	// Change select comboboxes to be text then add hooks.
	$("select.combobox").each(function () {
		var $this = $(this);
		var visible = $this.is(":visible");
		var $combo = $('<div class="combobox-popup">');

		// Populate combobox
		$this.children("option").each(function () {
			var $child = $(this);
			var help = $child.attr("data-help") || false;

			var $row = $('<div class="combobox-row">')
				.append(
					$('<span>').text($child.text())
				).data({
					"text": $child.text(),
					"value": $child.val(),
					"help": help,
				}).val($child.val())
				.appendTo($combo)
				.click(comboboxSelectSelectOption);

			if (help) $('<span class="help">').text(help).appendTo($row);
		})

		// Replace select with a span that has an input field.
		var $parent = $('<span>')
			.attr({
				"id": $this.attr("id"),
				"class": $this.attr("class"),
				"value": $this.val(),
			})
			.addClass("combobox-parent")
			.append([
				$('<input>').attr({
					"class": $this.attr("class"),
					"style": $this.attr("style"),
					"placeholder": $this.attr("placeholder")
				}).width($this.show().width())
				// Attach hooks to input
				.focus(comboboxSelectFilterPopup)
				.keyup(comboboxSelectFilterPopup)
				.blur(comboboxHidePopup)
				.change(comboboxSelectUpdateValue),

				$combo.hide()
			]);
		$this.replaceWith($parent);
		if (!visible) $parent.hide();

	});
});

function comboboxTextInput() {
	var $this = $(this);
	window[$this.attr("data-combo-search")]($this.val(), function (result) {
		var $combo = $this.parent().children('.combobox-popup');

		$combo.empty();

		for (var i = 0; i < result.length; i++) {
			$('<div class="combobox-row">')
			.append(result[i])
			.appendTo($combo)
			.data("value", result[i].data("value"))
			.click(comboboxTextSelectOption);
		}

		var pos = $this.position();
		pos.top += $this.height();

		$combo.show();
		if ($combo.children(".combobox-row:visible").length == 0) {
			$combo.hide();
		}
	});
}

function comboboxTextSelectOption() {
	var $this = $(this), val = $this.data("value");
	var $input = $this.parent().hide().parent().children("input").val(val).change();
	var func = $input.attr("data-combo-set");
	if (func && func in window) window[func](val);
}

function comboboxSelectSelectOption() {
	var $this = $(this);
	var $parent = $this.parent().hide().parent();
	$parent.val($this.data("value")).change();
	$parent.children("input").val($this.data("text"));
}

function comboboxSelectFilterPopup() {
	var $this = $(this);
	var val = $this.val().toLowerCase().replace(/\s/g, "");
	var $combo = $this.parent().children(".combobox-popup").show();

	function inside(x) {
		x = x.toLowerCase().replace(/\s/g, "");
		return x.indexOf(val) >= 0;
	}

	$combo.children(".combobox-row").each(function () {
		var $row = $(this);

		if (inside($row.data("text")) || inside($row.data("value"))) {
			$row.show();
		} else {
			$row.hide();
		}
	});

	if ($combo.children(".combobox-row:visible").length == 0) {
		$combo.hide();
	}
}

function comboboxHidePopup() {
	var $elem = $(this).parent().children(".combobox-popup");
	setTimeout($elem.hide.bind($elem), 200);
}

function comboboxTextUpdateValue() {
	var $this = $(this);
	$this.parent().val($this.val());
}

function comboboxSelectUpdateValue() {
	var $this = $(this);
	var $parent = $this.parent();
	var val = $this.val();

	// First check if there is an entry for this.
	$parent.find(".combobox-row").each(function () {
		var $row = $(this);

		if ($row.text() == val) {
			val = $row.data("value");
		}
	})

	$parent.val(val);
	$parent.find(".combobox-popup").hide();
}
