/*
TODO:
** params **
NoCharge <- need to support staves/merlins

BundleMax <- don't see this in use even in itemdb (old tho)
SetBonus <- don't see this in use

add_shape_collect_rate
AlchemyElementalBonus
AlchemyElemental
cooltime_sec
frostbite_damage_rate
frostbite_duration
frostbite_rate
frozenattack_duration
frozenattack_rate
lance_piercing
magazinetype
max_bullet
max_range_mod
min_range_mod
motion_category
motion_element
random_product
splash_angle
splash_damage
splash_radius
stamina_usage
summon_limit
summon_rate
summon_set
summon_shadow_rgn_only
talent_id
talent_level
trainingbonus

** categories **
big_cooking_kneader | huge_backtool
tamingbaton
trainingbaton

hide_palm
quest_item


collecting_tool
disciple1_weapon
enchant_entrust
giant_full_swing
group_idle_motion
handle
lordweapon
piercing
real_brionac
tool
*/

function showSubCategoryStuff(t, h) {
	var val = "/" + $(t).val() + "/";
	// Enable special forms:
	if (!h) $(".equip-category-custom").hide();
	val.replace(/\{([^}]+)\}/g, function (_, name) {
		console.log(name);
		showSubCategoryStuff($("#equip-category-" + name).show(), true);
	});
	return val;
}

jQuery(function ($) {
	// Remove tab-hide from children of comboboxes
	$(".combobox input").removeClass("tab-hide").show();

	// Set up dynamic pieces for StyleWeapon and StyleEquip.
	$("#equip-xml").change(updateEquipForm);

	$("#equip").find("input, select, textarea").change(updateEquipOutput);

	$(".equip-category :first-child, .equip-category-changer").find("input, select").change(updateEquipCategoryString);
	$("#equip-category").change(updateEquipCategorySelectors);

	$("#equip-category-hand").change(function () {
		var val = $(this).val();

		// Hide all first.
		$(".equip-category").find("[id^='equip-category-type-']").hide();

		// Show relevant one.
		if (val) $("#equip-category-type-" + val).show();

		$(".equip-speed").show();
		if (val == "twohand") {
			$("#equip-category-giant_onehand").show();
			hidecheck("#equip-category-twin_sword");
		} else {
			if (!val) {
				$(".equip-speed").hide();
			}
			hidecheck("#equip-category-giant_onehand");
			hidecheck("#equip-category-twin_club");
			hidecheck("#equip-category-twin_sword");
		}
	}).change();

	$("#equip-category-slot, #equip-category-acc-type").change(function () {
		var val = showSubCategoryStuff($("#equip-category-slot"));
	});

	$("#equip-category-type-righthand, #equip-category-type-twohand, #equip-category-hybrid-type").change(function () {
		if (!$(this).is(":visible")) return;

		var val = showSubCategoryStuff(this);

		// Show dual wielding options
		if (val.indexOf("/edged/") >= 0) {
			$("#equip-category-twin_sword").show();
			hidecheck("#equip-category-twin_club");
		} else if (val.indexOf("/blunt/") >= 0) {
			$("#equip-category-twin_club").show();
			hidecheck("#equip-category-twin_sword");
		} else {
			hidecheck("#equip-category-twin_club");
			hidecheck("#equip-category-twin_sword");
		}

		// Race-locked triggers and weapon range
		$("#equip-human, #equip-giant, #equip-elf").prop("disabled", false);
		$(".equip-range").hide();
		if (val.indexOf("/lance/") >= 0) {
			$("#equip-human, #equip-giant").prop("checked", true);
			$("#equip-elf").prop({
				"checked": false,
				"disabled": true,
			});
		} else if (val.indexOf("/atlatl/") >= 0) {
			$(".equip-range").show();
			$("#equip-giant").prop("checked", true);
			$("#equip-human, #equip-elf").prop({
				"checked": false,
				"disabled": true,
			});
		} else if (val.indexOf("/bow") + val.indexOf("/crossbow/")
			+ val.indexOf("/dualgun/") + val.indexOf("/shuriken/") + 4
		) {
			$(".equip-range").show();
		}

		// Trigger change on speed bit to switch based on weapon type
		$("#equip-speed").change();
	}).change();

	$("#equip-speed").change(function () {
		var speed = $(this).val();
		var weapon = $("#equip-category-type-righthand:visible").val();

		if (weapon) {
			weapon = "/" + weapon + "/";

			var bow = weapon.indexOf("/bow") >= 0 || weapon.indexOf("/crossbow/") >= 0;
			var gun = weapon.indexOf("/dualgun/") >= 0;

			switch (speed) {
				case "0":
					if (bow) speed = "5";
					else if (gun) speed = "15";
					break;
				case "1":
					if (bow) speed = "6";
					else if (gun) speed = "16";
					break;
				case "2":
					if (bow) speed = "7";
					else if (gun) speed = "17";
					break;
				case "3":
					if (bow) speed = "8";
					else if (gun) speed = "18";
					break;
				case "4":
					if (bow) speed = "9";
					else if (gun) speed = "19";
					break;
			}

			$("#equip-speed-raw").val(speed);
		}
	});

	$(".equip-market input").change(function () {
		// Update the predicted sale price.
		var buyprice = $("#equip-buyprice").val(),
		sellprice = $("#equip-sellprice").val(),
		accurate;

		if (!sellprice && buyprice) {
			buyprice = parseInt(buyprice);

			if (buyprice == 0) {
				sellprice = 0;
				accurate = true;
			} else if (buyprice <= 100) {
				sellprice = buyprice / 2;
				accurate = false;
			} else if (buyprice <= 1000) {
				sellprice = buyprice / (2 + (buyprice - 100) * 2 / 900);
				accurate = false;
			} else if (buyprice <= 10000) {
				sellprice = buyprice / (4 + (buyprice - 1000) * 6 / 9000);
				accurate = false;
			} else {
				sellprice = buyprice / 10;
				accurate = true;
			}

			// Truncate float.
			var trunc = Math.floor(sellprice * 100).toString();
			trunc = trunc.substr(0, trunc.length - 2) + "." + trunc.substr(trunc.length - 2);

			var $wps = $("#equip-predictedsale").empty();
			$("<span>").text("Predicted: " + trunc).appendTo($wps);
			if(!accurate) $('<abbr title="Price may be inaccurate.">*</abbr>').appendTo($wps);
		}
	});

	$("#equip-add-another-saleprice, #equip-add-another-setbonus").click(function () {
		var $parent = $(this).parent();
		var $addmore = $(this).detach();

		var $newlist = $parent.clone(true);
		$parent.removeAttr("id");

		// Clear fields and add + button back in.
		$newlist.find("select").val($newlist.find("select option:first").val());
		$newlist.find("input").val("");
		$addmore.insertBefore($newlist.find(".help"));

		$newlist.insertAfter($parent);

		// Add - to old one.
		$('<span class="action">-</span>').insertBefore($parent.find(".help")).click(function () {
			$(this).parent().remove();
		});
	});

	$("#equip-category-repairable").change(function () {
		var val = $(this).val();
		if (val == "not_repairable") {
			$(".equip-repairs").addClass("hidden");
		} else {
			$(".equip-repairs").removeClass("hidden").children("span").addClass("hidden");
			$(".equip-repairs").children("." + (val || "tailor_repairable")).removeClass("hidden");
		}
	}).change();

	$("#output").val("");
});

function updateEquipForm() {
	// Update the form whenever the XML is changed.
	var xml = $(this).val().trim();

	var weapon = $("#weapon-tab").hasClass("active");
	var equip = $("#equip-tab").hasClass("active");

	function changeTab(category) {
		var $tab;
		if (category.indexOf("/righthand/") >= 0
			|| category.indexOf("/twohand/") >= 0) {
			$tab = $("#weapon-tab");
			weapon = true;
			equip = false;
		} else {
			$tab = $("#equip-tab");
			equip = true;
			weapon = false;
		}

		if (!$tab.hasClass("active")) $tab.click();
	}

	function trading(a,b,c,d,e,f,g) {
		$("#equip-sellable-npc").prop("checked", !!a);
		$("#equip-sellable-player").prop("checked", !!b);
		$("#equip-tradable").prop("checked", !!c);
		$("#equip-storeonpets").prop("checked", !!d);
		$("#equip-otherpick").prop("checked", !!e);
		$("#equip-bankable").prop("checked", !!f);
		$("#equip-withdrawable").prop("checked", !!g);
	}

	function setTradability(trade) {
		switch (trade) {
			// Honestly not too sure on these.
			case "0": trading(1,1,1,1,1,1,1); break;
			case "1": trading(0,1,1,1,0,1,1); break;
			case "2": trading(0,0,0,0,0,0,0); break;
			case "3": trading(0,0,0,0,0,1,1); break;
			case "4": trading(0,0,1,0,1,0,0); break;
			case "5": trading(0,0,0,0,0,1,0); break;
			case "8": trading(0,0,0,0,0,0,0); break;
			case "12": trading(0,0,0,1,0,1,1); break;
			case "14": trading(0,1,1,0,0,1,1); break;
		}
	}

	function setRace(race) {
		$("#equip-human").prop("checked", !race || race.indexOf("/human/") >= 0);
		$("#equip-elf").prop("checked", !race || race.indexOf("/elf/") >= 0);
		$("#equip-giant").prop("checked", !race || race.indexOf("/giant/") >= 0);

		$("#equip-female, #equip-male").prop("checked", true);
		if (race) {
			if (race.indexOf("/male/") >= 0) $("#equip-female").prop("checked", false);
			else if (race.indexOf("/female/") >= 0) $("#equip-male").prop("checked", false);
		}
	}

	function setDye(name, idx) {
		var sel = ".equip-dyeing input[name='" + name + "']";
		$(sel).prop("checked", false);
		$(sel + "[value='" + idx + "']").prop("checked", true);
	}

	function clearList(sel) {
		$(sel + ":not(:last) .action").click();
	}

	var firstBonus = true;
	function addSetBonus(b, n, x) {
		if (firstBonus) firstBonus = false;
		else $("#equip-add-another-setbonus").click();

		var $row = $(".equip-set-bonus:last");
			$row.find(".equip-bonus").val(b);
			$row.find(".equip-minbonus").val(n);
			$row.find(".equip-maxbonus").val(x);
	}

	if (xml.charAt(0) == "<") {
		// XML Version
		var element = jQuery.parseXML(xml);

		// Set bonus?
		var bonus;
		if (bonus = element.getElementsByTagName("Item").item(0)) {
			// Clear existing entries...
			clearList(".equip-set-bonus");

			var splits = bonus.getAttribute("element").split(" ");

			$.each(bonus.getElementsByTagName("quality"), function (_, e) {
				splits = splits.concat(e.getAttribute("bonus").split(" "));
			});

			// Add set bonuses
			for (var i = 0; i < splits.length; i++) {
				var sp2 = splits[i].split(":");
				var b = sp2[0];
				var xn = sp2[1].split("~");

				var n = xn[0];
				var x = xn.length > 1 ? xn[1] : n;

				addSetBonus(b, n, x);
			}

			return;
		}

		var item = element.getElementsByTagName("Mabi_Item").item(0);

		if (!item) {
			console.warn("Bad XML pasted. Not Mabi_Item?");
			return;
		}

		// Automatically change tabs
		changeTab(item.getAttribute("Category"));

		function set(s, attr, f) {
			var v = item.getAttribute(attr);
			return $(s).val(f ? f(v) : v);
		}

		function ref(x) {
			return x.replace(/_LT\[xml\.itemdb\.([^\]]+)\]/, "Lookup $1 in data/local/xml/itemdb.english.txt");
		}

		function nozero(x) { return x == "0" ? "" : x; }
		function defaultTo(x) { return function (y) { return y || x; } }

		// Decode XML attribute.
		var subxml = (item.getAttribute("XML") || "").trim();
		var specials = {};

		if (subxml) {
			// Fix common bugs in it...
			var floatingParams = subxml.match(/<(\s*\S+\s*=\s*"[^"]*")+\s*\/\s*>/);
			if (floatingParams) {
				// Throw these into root XML tag.
				subxml.replace(/^<xml/, "<xml " + floatingParams[1]);
			}

			var openStuff = subxml.match(/^<xml([^"\/>]+|"[^"]*")*/);
			if (openStuff && subxml.charAt(openStuff[0].length) != "/" && !subxml.match(/<\s*\/\s*xml\s*>$/)) {
				// No closing main element.
				subxml += "</xml>";
			}

			var subdoc = jQuery.parseXML(subxml);

			function addAll(pfx, x) {
				if (x.tagName != "xml") pfx += x.tagName + "_";

				for (var i = 0; i < x.attributes.length; ++i) {
					var attr = x.attributes[i];
					specials[attr.name] = attr.value;
				}

				for (var i = 0; i < x.children.length; ++i) {
					addAll(pfx, x.children[i]);
				}
			}
			addAll("", subdoc.firstChild);
		}

		function set2(s, attr, f) {
			if (attr in specials) {
				var v = specials[attr];
				s = $(s).val(f ? f(v) : v)
				delete specials[attr];
				return s;
			} else {
				return $(s).val("");
			}
		}

		set("#equip-name", "Text_Name1", ref).prev().addClass("highlight");
		set("#equip-desc", "Text_Desc1", ref).prev().addClass("highlight");

		set("#equip-width", "Inv_XSize");
		set("#equip-height", "Inv_YSize");

		setRace(item.getAttribute("Attr_RaceFilter"));

		set("#equip-category", "Category").change();

		setTradability(item.getAttribute("Attr_ActionFlag"));

		if (weapon) {
			var speed = parseInt(item.getAttribute("Par_AttackSpeed"));
			$("#equip-speed").val((speed % 5).toString());
			$("#equip-speed-raw").val(speed.toString());

			set("#equip-hits", "Par_DownHitCount");

			set("#equip-min-damage", "Par_AttackMin");
			set("#equip-max-damage", "Par_AttackMax");
			set("#equip-min-injury", "Par_WAttackMin");
			set("#equip-max-injury", "Par_WAttackMax");
			set("#equip-critical", "Par_CriticalRate");
			set("#equip-balance", "Par_AttackBalance");
			set("#equip-range", "Par_EffectiveRange", nozero);
		}

		set("#equip-durability", "Par_DurabilityMax");
		set("#equip-defense", "Par_Defense", nozero);

		if (equip) {
			set("#equip-protection", "Par_ProtectRate", nozero);
			set2("#equip-magic-defense", "magic_defense");
			set2("#equip-magic-protection", "magic_protect");
		}

		$("#equip-category-reforgeable").prop("checked", item.getAttribute("Metalware_UItooltip") == "true");
		$("#equip-category-enchantable").prop("checked", item.getAttribute("Enchant_UItooltip") == "true");

		//$(".equip-repairs > span").addClass("highlight");

		if (item.getAttribute("Upgrade_UItooltip") == "true") {
			set("#equip-upgrades", "Par_UpgradeMax");
			set("#equip-gem-upgrades", "Par_GemUpgradeMax", defaultTo("0"));
		} else {
			$("#equip-upgrades").val("");
			$("#equip-gem-upgrades").val("");
		}

		if (weapon) {
			$("#equip-spupable").prop("checked", specials["enhance_type_s"] || specials["enhance_type_r"]);
			if (item.getAttribute("Category").indexOf("/not_ego/") >= 0) {
				$("#equip-spirit").prop("checked", false);
			} else {
				$("#equip-spirit").addClass("highlight")
			}
		}

		// Dyeing
		function setXmlDye(name, attr) {
			setDye(name, item.getAttribute(attr));
		}

		setXmlDye("color1", "App_Color1");
		setXmlDye("color2", "App_Color2");
		setXmlDye("color3", "App_Color3");
		setXmlDye("color4", "App_Color5");
		setXmlDye("color5", "App_Color6");
		setXmlDye("color6", "App_Color7");
		
		// Market
		$(".equip-market").show();
		set("#equip-buyprice", "Price_Buy").change();
		if (set("#equip-sellprice", "Price_Sell", nozero).val() == "") {
			$(".equip-sellprice").hide();
			$(".equip-resell label").addClass("highlight")
		} else {
			$(".equip-resell").hide();
		}


		// Add leftover XML param stuff
		var specialsString = "";
		for (var x in specials) {
			specialsString += x + "=" + specials[x] + "\n";
		}
		$("#equip-properties").val(specialsString);


		$("#equip-obtain, .equip-sellers, .equip-saleprice").addClass("highlight");
	} else if (xml.substr(0, 2) == "{{") {
		// Wiki data format
		var wikiSplits = xml
			// Remove template surroundings
			.replace("{{{1}}}", "")
			.replace(/\{\{\{format\|?\}\}\}/, "")
			.replace(/^\{\{/, '').replace(/\}\}<noinclude>[\s\S]+$|\}\}\s*$/, '')
			// Remove comments
			.replace(/<!--[\s\S]*?-->/g, '')
			// Split by pipes
			.split("\n|");

		var wiki = {};
		for (var i = 0; i < wikiSplits.length; i++) {
			var splits = wikiSplits[i].split("=");
			var key = splits[0].trim();
			if (key) wiki[key] = splits.slice(1).join("=").trim();
		}

		function set(s, name, def) {
			if (name in wiki) {
				s = $(s).val(wiki[name]);
				delete wiki[name];
				return s;
			} else {
				return $(s).val(def || "");
			}
		}

		function get(name, def) {
			if (name in wiki) {
				var v = wiki[name];
				delete wiki[name];
				return v;
			} else {
				return def;
			}
		}

		function getTrue(name, def) {
			var v = get(name, def || "").toLowerCase();
			return v == "true" || v == "y";
		}

		function setTrue(sel, name, def) {
			$(sel).prop("checked", !!getTrue(name, def));
		}

		var $cat = set("#equip-category", "Category");

		// Automatically change tabs
		changeTab($cat.val());

		set("#equip-name", "Name");
		var icon;
		if(set("#equip-page", "Page").val()
			|| (icon = set("#equip-icon", "Icon").val())) {
			// Make this section visible.
			$("#equip-custom-page").click();

			// Add in the ext...
			if ("Ext" in wiki) {
				$("#equip-icon").val(icon + "." + get("Ext"));
			} else if (icon.indexOf(".") >= 0) {
				$("#equip-icon").val(icon + ".png");
			}
		}

		set("#equip-desc", "Desc");
		$cat.change();

		if ("BuyPrice" in wiki) {
			$(".equip-market").show();
			set("#equip-buyprice", "BuyPrice");
			set("#equip-sellprice", "SellPrice");
		}

		if ("Tradability" in wiki) {
			// Old form tradability
			setTradability(get("Tradability"));
		} else {
			// New form tradability
			trading(
				getTrue("CanSellToNPC", "False"),
				getTrue("CanSellToPlayer", "False"),
				getTrue("CanTrade", "False"),
				getTrue("CanStorePet", "False"),
				getTrue("CanPickupOther", "False"),
				getTrue("CanBank", "False"),
				getTrue("CanWithdrawOther", "False")
			);
		}

		if ("Race" in wiki) {
			// Old form Race string
			setRace(get("Race"));
		} else {
			// New form race params
			var HM = getTrue("HumanMale"), HF = getTrue("HumanFemale"),
				EM = getTrue("ElfMale"), EF = getTrue("ElfFemale"),
				GM = getTrue("GiantMale"), GF = getTrue("GiantFemale");

			var human = HM + HF, elf = EM + EF, giant = GM + GF,
				male = HM + EM + GM, female = HF + EF + GF;

			$("#equip-human").prop("checked", !!human);
			$("#equip-elf").prop("checked", !!elf);
			$("#equip-giant").prop("checked", !!giant);
			$("#equip-male").prop("checked", !!male);
			$("#equip-female").prop("checked", !!female);

			function warnBadScore(t, x, s) {
				if (x && x != s) console.warn("Race " + t + " disjointed. Scored " + x.toString() + "/" + s.toString());
			}

			warnBadScore("human", human, 2);
			warnBadScore("elf", elf, 2);
			warnBadScore("giant", giant, 2);
			warnBadScore("male", male, 3);
			warnBadScore("female", female, 3);
		}

		// Inventory dims
		set("#equip-width", "Width");
		set("#equip-height", "Height");

		// Color palettes
		setDye("color1", get("Color1"));
		setDye("color2", get("Color2"));
		setDye("color3", get("Color3"));
		setDye("color4", get("Color4"));
		setDye("color5", get("Color5"));
		setDye("color6", get("Color6"));
		
		// Can*
		setTrue("#equip-category-reforgeable", "CanReforge", "False");
		setTrue("#equip-category-enchantable", "CanEnchant", "False");

		if (weapon) {
			var speed = get("AttackSpeed");
			if (speed) {
				$("#equip-speed").val((parseInt(speed) % 5).toString());
				$("#equip-speed-raw").val(speed);
			}

			var hits = get("DownHitCount");
			if (hits) {
				$("#equip-hits").val(parseInt(hits) + 1);
			}

			// Weapon stats
			set("#equip-min-damage", "MinDamage");
			set("#equip-max-damage", "MaxDamage");
			set("#equip-min-injury", "MinInjury");
			set("#equip-max-injury", "MaxInjury");
			set("#equip-critical", "Critical");
			set("#equip-balance", "Balance");

			var range = get("Range");
			if (range) {
				$(".equip-range").show();
				$("#equip-range").val(range);
			}
		}

		set("#equip-durability", "Durability");
		set("#equip-defense", "Defense");

		if (equip) {
			set("#equip-protection", "Protection");
		}

		set("#equip-magic-defense", "magic_defense");
		set("#equip-magic-protection", "magic_protect");

		// Upgrades
		set("#equip-upgrades", "Upgrades");
		set("#equip-gem-upgrades", "GemUpgrades");

		if (weapon) {
			setTrue("#equip-spupable", "SpecialUpgrade");
			setTrue("#equip-spirit", "Spirit");
		}

		// Set bonuses
		clearList(".equip-set-bonus");

		var setBonusSplits = get("SetBonus", "").split("\n");
		var qualities = [];

		for (var i = 0; i < setBonusSplits.length; i++) {
			var sp = setBonusSplits[i];

			if (!sp) continue;

			var mo = sp.match(/\+(\d+)(~(\d+))?\s+([^<\r\n.]+)/);

			var val = $('.equip-bonus:first option:contains("' + mo[4] + '")').val();
			var n = mo[1];
			var x = mo[3] || n;

			if (sp.substr(0, 2) == "**") {
				// Quality bonus
				qualities.push([val, n, x]);
			} else {
				// Base bonus
				addSetBonus(val, n, x);
			}
		}

		for (var i = 0; i < qualities.length; i++) {
			addSetBonus.apply(null, qualities[i]);
		}

		// TODO: Repair costs

		// Resell
		var resell = get("Resell");
		if (resell) {
			$(".equip-resell").show();
			$("#equip-resell").val(resell);
		}

		// Lists
		function setList(s, x) {
			var list = get(x, "");
			$(s).val(list.replace(/^\*/, "").replace(/\n\*/g, "\n"));
		}

		setList("#equip-obtain", "ObtainList");

		clearList(".equip-seller-list");
		var sell = get("SellList", "").split("\n");
		var $sellers = $(".equip-seller-list:last .equip-sellers");
		var sellers = [];
		for (var i = 0; i < sell.length; i++) {
			var line = sell[i];
			if (!line) continue;

			if (line.substr(0, 2) == "**") {
				sellers.push(line.substr(2).replace(/\[\[|\]\]/g, "").trim());
			} else {
				if (i) $("#equip-add-another-saleprice").click();
				var $last = $(".equip-seller-list:last");

				$sellers.val(sellers.join("\n"));

				$sellers = $last.find(".equip-sellers");
				sellers = [];

				// Parse out price and currency.
				var mo = line.substr(1).match(/^\s*(\d+)\s*(.+)$/);
				$last.find(".equip-saleprice").val(mo[1]);
				$last.find(".equip-salecurrency").val(mo[2].toUpperCase());
			}
		}

		setList("#equip-information", "Information");

		// Extra special properties
		delete wiki.UUID;
		delete wiki.XML;

		var specials = "";
		for (var x in wiki) {
			specials += x + "=" + wiki[x] + "\n";
		}
		$("#equip-properties").val(specials);
	} else {
		console.warn("Unknown paste format.");
	}
}

function updateEquipCategoryString() {
	// When a selector is changed the string must be changed too.
	// TODO: Respect changes made in the string?
	var cat = "/equip/";

	function slash(x) { return x && x.charAt(x.length - 1) != "/" ? x + "/" : x; }
	function check(s, t, f) { return slash($(s).is(":checked") ? t : f); }

	// Pull off anything that's tacked onto the end, roughly
	var tacks = "";
	function tackOn(x) {
		var endPoint = x.indexOf("/*/");
		if (endPoint >= 0) {
			tacks += x.substr(endPoint + 2);
			return x.substr(0, endPoint);
		}
		return x;
	}

	var preformatted = {};
	function formatter(_, name) {
		var $target = $("#equip-category-" + name);
		if ($target.is("select")) {
			var val = $target.val().replace(/\{([^}]+)\}(\/|$)/g, formatter);
			return slash(tackOn(val));
		} else if (name in preformatted) {
			return preformatted[name];
		}

		return "";
	}

	var $hand = $("#equip-category-hand");
	var hand = $hand.val();
	var weapon = $hand.is(":visible") && hand;
	if (weapon) {
		var $weapcat = $("#equip-category-category");
		var weapcat = $weapcat.is(":visible") ? $weapcat.val() : "";
		var type = $("#equip-category-type-" + hand).val();

		type = tackOn(type);

		var chargeable = !!$("#equip-category-bolt-charge").val();

		preformatted = {
			// Construct magic string
			"magic": check("#equip-category-melee_wand", "melee_wand", "")
				+ check("#equip-category-party_healing",
					$("#equip-category-healing_wand").is(":checked") ? "healing_wand" : "party_healing",
					"")
				+ (chargeable ? "" :
					check("#equip-category-ice_wand", "ice_wand", "")
					+ check("#equip-category-lightning_wand", "lightning_wand", "")
					+ check("#equip-category-fire_wand", "fire_wand", "")),

			"suppup-expire": $("#equip-suppup-daily_expire").val() ? "daily_expire" : "",
		};

		// Add handedness and formatted type with hybridization
		cat += hand + "/";
		cat += (type + "/" + slash($("#equip-category-hybrid-type").val()))
		.replace(/\{([^}]+)\}\//g, formatter);

		// Fomor weapons are both /weapon/ and /demon_weapon/
		if (weapcat == "demon_weapon") cat += "demon_weapon/";
	}

	var $slot = $("#equip-category-slot");
	var equip = $slot.is(":visible") && $slot.val();
	if (equip) {
		cat = "/" + formatter(null, "slot");
	}

	if (weapon || equip) {
		// Standard selects
		cat += slash($("#equip-category-repairable").val());

		// Standard checkboxes
		cat += check("#equip-category-enchantable", "", "not_enchantable");
		cat += check("#equip-category-bless", "", "not_bless");
		cat += check("#equip-category-holyfire", "", "not_holyfire");
		cat += check("#equip-category-reforgeable", "", "not_metalware");
		cat += check("#equip-category-dropable", "", "not_dropable");
		cat += check("#equip-category-destroyable", "destroyable", "");

		// Add race restrictions
		cat += weaponRaceMap({
			"000": "", // Assume all
			"001": "elf_only/",
			"010": "giant_only/",
			"011": "?_only/", // Not actually possible
			"100": "human_only/",
			"101": "human_elf_only/",
			"110": "human_giant_only/",
			"111": "",
		});

		// Dyeability (don't remember where this goes)
		cat += slash($("#equip-category-dyeable").val());

		//if (weapon) {
			// TODO: Chance of freezing enemy
			//frozenattack
		//}

		// Tack ons
		cat += slash(tacks.substr(1));
		$("#equip-category").val(cat);
	}
}

function weaponRaceMap(raceMap) {
	var raceKey = ($("#equip-human").is(":checked") ? "1" : "0")
	+ ($("#equip-giant").is(":checked") ? "1" : "0")
	+ ($("#equip-elf").is(":checked") ? "1" : "0");

	return raceMap[raceKey];
}

function updateEquipCategorySelectors() {
	// When the string is changed the selectors must be updated.
	var weapon = $("#weapon-tab").hasClass("active");
	var equip = $("#equip-tab").hasClass("active");

	var text = $("#equip-category").val();

	if (text.charAt(0) != "/") text = "/" + text;
	if (text.charAt(text.length - 1) != "/") text += "/";

	var splits = text.substring(1, text.length - 1).split("/");

	function allPartsExist(sel) {
		var val = $(sel).val();
		var vs = val.split("/"), success = true;

		for (var i = 0; i < vs.length; ++i) {
			var v = vs[i];
			if (v.charAt(0) != "{" && v != "?" && v != "*" && splits.indexOf(v) == -1) {
				success = false;
				break;
			}
		}

		if (success) {
			$(sel).parent().val(val).change();
			return true;
		}
	}

	var sel;

	if (weapon) {
		$("#equip-category-hand").val(splits[1]).change();

		sel = "#equip-category-type-" + splits[1];
	} else {
		sel = "#equip-category-slot";
	}
	$(sel).children().each(function () { if (allPartsExist(this)) return false });

	$("#equip-category-enchantable, #equip-category-reforgeable, #equip-category-bless, #equip-category-holyfire, #equip-category-dropable").prop("checked", true);

	var not2id = {
		"not_enchantable": "#equip-category-enchantable",
		"not_bless": "#equip-category-bless",
		"not_holyfire": "#equip-category-holyfire",
		"not_metalware": "#equip-category-reforgeable",
		"not_dropable": "#equip-category-dropable",
	};

	// Select container parts
	var main = $(sel).val().split(), touched = {};

	for (var i = 1; i < splits.length; ++i) {
		var v = splits[i];
		var inMain = main.indexOf(v) >= 0;

		var $selopt = $(".equip-category select option[value='" + v + "']");
		if ($selopt.length) {
			var $par = $selopt.parent(), id = $par.attr("id");

			if (id in touched) {
				touched[id].push($par);
				v = touched[id].join("/");
			} else {
				touched[id] = [v];
			}

			$par.val(v).change();
		} else {
			if (!$("#equip-category-" + v).prop("checked", true).length) {
				if (v in not2id) {
					$(not2id[v]).prop("checked", false);
					continue;
				}

				// Either some custom identifier, something we don't care about, or hybridization...

				$("#equip-category-hybrid-type option").each(function () {
					var $this = $(this);
					if (!inMain && $this.val().indexOf(v) >= 0 && allPartsExist($this)) {
						return false;
					}
				});
			}
		}
	}

	$("#equip-category").val(text);
}

function updateEquipOutput() {
	// Update wiki output whenever anything changes.
	var out = "{{{{{format|{{{1}}}}}}\n<!-- Start: Item Specifications -->\n";
	var category = $("#equip-category").val();

	var weapon = $("#weapon-tab").hasClass("active");
	var equip = $("#equip-tab").hasClass("active");

	// Tops~
	var icon = $("#equip-icon").val().split(".");
	var ext = icon.length > 1 ? icon.pop() : "";
	out += filterAndPrefixAll("|", [
		"Name=" + $("#equip-name").val(),
		prefixIfTrue("Page=", $("#equip-page").val()),
		prefixIfTrue("Icon=", icon.join(".")),
		prefixIfTrue("Ext=", ext),
		"Desc=" + $("#equip-desc").val().replace(/\n/g, "<br/>"),
		"Category=" + category,
	], "\n") + "\n";

	// Specials~
	/* TODO:
	add_shape_collect_rate
	AlchemyElementalBonus
	AlchemyElemental
	cooltime_sec
	frostbite_damage_rate
	frostbite_duration
	frostbite_rate
	frozenattack_duration
	frozenattack_rate
	lance_piercing
	magazinetype
	max_bullet
	max_range_mod
	min_range_mod
	motion_category
	motion_element
	random_product
	splash_angle
	splash_damage
	splash_radius
	stamina_usage
	summon_limit
	summon_rate
	summon_set
	summon_shadow_rgn_only
	talent_id
	talent_level
	trainingbonus
	*/
	if (equip) {
		prefixIfTrue("|magic_defense=", $("#equip-magic-defense").val(), "\n")
		prefixIfTrue("|magic_protect=", $("#equip-magic-protection").val(), "\n")
	}

	var specials = filterAndPrefixAll("|", $("#equip-properties").val().replace(/ *= */g, "=").split("\n"), "\n");
	if (specials) out += specials + "\n";

	// Pricing and tradeability
	if ($(".equip-market").is(":visible")) {
		out += filterAndPrefixAll("|", [
			"BuyPrice=" + $("#equip-buyprice").val(),
			"SellPrice=" + (parseInt($("#equip-sellprice").val()) || ""),
		], "\n");
	}

	out += filterAndPrefixAll("|", [
		"CanSellToNPC=" + ($("#equip-sellable-npc").is(":checked") ? "True" : "False"),
		"CanSellToPlayer=" + ($("#equip-sellable-player").is(":checked") ? "True" : "False"),
		"CanTrade=" + ($("#equip-tradable").is(":checked") ? "True" : "False"),
		"CanStorePet=" + ($("#equip-storeonpets").is(":checked") ? "True" : "False"),
		"CanPickupOther=" + ($("#equip-otherpick").is(":checked") ? "True" : "False"),
		"CanBank=" + ($("#equip-bankable").is(":checked") ? "True" : "False"),
		"CanWithdrawOther=" + ($("#equip-withdrawable").is(":checked") ? "True" : "False"),
	], "\n");

	// Race filter
	if (weapon) {
		var genderKey = ($("#equip-male").is(":checked") ? "1" : "0")
		+ ($("#equip-female").is(":checked") ? "1" : "0");

		out += prefixIfTrue("|Race=", weaponRaceMap({
			"000": "",
			"001": "/elf/{g}",
			"010": "/giant/{g}",
			"011": "/elf/{g} {{!}} /giant/{g}",
			"100": "/human/{g}",
			"101": "/human/{g} {{!}} /elf/{g}",
			"110": "/human/{g} {{!}} /giant/{g}",
			"111": "/human/{g} {{!}} /elf/{g} {{!}} /giant/{g}",
		}).replace(/\{g\}/g, ({
			"00": "", // Assume both
			"01": "female/",
			"10": "male/",
			"11": "",
		})[genderKey]), "\n");
	} else {
		var isMale = $("#equip-male").is(":checked");
		var isFemale = $("#equip-female").is(":checked");
		var isHuman = $("#equip-human").is(":checked");
		var isElf = $("#equip-elf").is(":checked");
		var isGiant = $("#equip-giant").is(":checked");

		if (!isHuman && !isElf && !isGiant) {
			isHuman = isElf = isGiant = true;
		}

		if (!isFemale && !isMale) {
			isFemale = isMale = true;
		}

		out += "|HumanMale=" + (isHuman && isMale ? "y" : "n");
		out += "\n|HumanFemale=" + (isHuman && isFemale ? "y" : "n");
		out += "\n|ElfMale=" + (isElf && isMale ? "y" : "n");
		out += "\n|ElfFemale=" + (isElf && isFemale ? "y" : "n");
		out += "\n|GiantMale=" + (isGiant && isMale ? "y" : "n");
		out += "\n|GiantFemale=" + (isGiant && isFemale ? "y\n" : "n\n");
	}

	// Inventory dims
	out += filterAndPrefixAll("|", [
		"Width=" + ($("#equip-width").val() || "?"),
		"Height=" + ($("#equip-height").val() || "?"),
	], "\n");

	// Color palettes
	out += filterAndPrefixAll("|", [
		"Color1=" + $(".equip-dyeing [name='color1']:checked").val(),
		"Color2=" + $(".equip-dyeing [name='color2']:checked").val(),
		"Color3=" + $(".equip-dyeing [name='color3']:checked").val(),
		"Color4=" + $(".equip-dyeing [name='color4']:checked").val(),
		"Color5=" + $(".equip-dyeing [name='color5']:checked").val(),
		"Color6=" + $(".equip-dyeing [name='color6']:checked").val(),
	], "\n");

	// Can*
	out += filterAndPrefixAll("|", [
		"CanReforge=" + ($("#equip-category-reforgeable").is(":checked") ? "True" : "False"),
		"CanEnchant=" + ($("#equip-category-enchantable").is(":checked") ? "True" : "False"),
	], "\n") + "\n";
	
	// Speed
	if (weapon) {
		var hits = $("#equip-hits").val();

		if (hits) hits = (parseInt(hits) - 1).toString()

		out += filterAndPrefixAll("|", [
			"AttackSpeed=" + ($("#equip-speed-raw").val() || "?"),
			"DownHitCount=" + (hits || "?"),
		], "\n");
	}

	// Stats
	var critical = $("#equip-critical").val();
	var balance = $("#equip-balance").val();
	var durability = $("#equip-durability").val();
	var defense = $("#equip-defense").val() || "0";

	if (durability) {
		// Can almost definitely assume >= 1000 is a full version of dura
		if (parseInt(durability) < 1000) {
			durability += "000";
		}
	} else {
		durability = "?";
	}

	if (weapon) {
		out += filterAndPrefixAll("|", [
			"MinDamage=" + ($("#equip-min-damage").val() || "?"),
			"MaxDamage=" + ($("#equip-max-damage").val() || "?"),
			"MinInjury=" + ($("#equip-min-injury").val() || "?"),
			"MaxInjury=" + ($("#equip-max-injury").val() || "?"),

			// Get rid of any %s
			"Critical=" + (critical ? parseInt(critical).toString() : "?"),
			"Balance=" + (balance ? parseInt(balance).toString() : "?"),
		], "\n");
	}

	if (equip || defense != "0") {
		// Weapons should only have defense in the output if it's defined
		// but equips should always have it in the output.
		out += "|Defense=" + defense + "\n";
	}

	if (equip) {
		out += prefixIfTrue("|Protection=", $("#equip-protection").val(), "\n");
		out += prefixIfTrue("|magic_defense=", $("#equip-magic-defense").val(), "\n");
		out += prefixIfTrue("|magic_protect=", $("#equip-magic-protection").val(), "\n");
	}

	out += "|Durability=" + durability + "\n";

	if (weapon) {
		out += prefixIfTrue("|Range=", $(".equip-range").is(":visible") ? $("#equip-range").val() : "", "\n");
	}

	// Upgrades
	var upgrades = $("#equip-upgrades").val();
	if (weapon || upgrades) {
		out += filterAndPrefixAll("|", [
			"Upgrades=" + (upgrades || "?"),
			"GemUpgrades=" + ($("#equip-gem-upgrades").val() || "?"),
		], "\n");
	}

	if (weapon) {
		out += filterAndPrefixAll("|", [
			"SpecialUpgrade=" + ($("#equip-spupable").is(":checked") ? "y" : "n"),
			"Spirit=" + ($("#equip-spirit").is(":checked") ? "y" : "n"),
		], "\n");
	}

	// Set bonuses
	var setBonus = "", seen = {};
	$(".equip-set-bonus").each(function () {
		var $this = $(this);
		var $bonus = $this.children(".equip-bonus");
		var bonus = $bonus.val();
		var text = $bonus.children("input").val();

		if (!bonus) return;

		var minb = $this.find(".equip-minbonus").val();
		var maxb = $this.find(".equip-maxbonus").val();

		var add;
		if (minb == maxb) {
			add = minb;
		} else {
			add = minb + "~" + maxb;
		}

		if (bonus in seen) {
			setBonus += '**If crafted with a high enough quality, the item will receive an additional +'
				+ add + ' ' + text + '.\n';
		} else {
			setBonus += '*<span style="color: blue;">+' + add + ' ' + text + '</span>\n';
			seen[bonus] = true;
		}
	});
	out += prefixIfTrue("|SetBonus=", setBonus);

	out += "<!-- End: Item Specifications -->\n\n"

	// Repair costs
	$(".equip-repairs > span").each(function () {
		var $this = $(this);
		if ($this.is(":visible")) {
			out += prefixIfTrue(
				"|Repair" + $this.find("label").text().substr(0, 2) + "=",
				$this.find("input").val(),
				"\n"
			);
		}
	})

	// Resell
	if ($(".equip-resell").is(":visible")) {
		out += prefixIfTrue("Resell=", $("#equip-resell").val(), "\n");
	}

	// ObtainList
	out += "|ObtainList=" + filterAndPrefixAll("*", $("#equip-obtain").val().split("\n"), "\n");

	// SellList
	out += "\n|SellList=";
	$(".equip-seller-list").each(function () {
		var $this = $(this);
		var price = $this.find(".equip-saleprice").val();

		if (price) {
			out += "*" + price + " " + $this.find(".equip-salecurrency").val() + "\n" 
			+ filterAndPrefixAll("**[[", $this.find(".equip-sellers").val().split("\n"), "]]\n");
		} else {
			out += "\n";
		}
	});

	// Information
	var info = $("#equip-information").val();
	if (info) {
		out += "|Information=" + filterAndPrefixAll("*", info.split("\n"), "\n") + "\n";
	}

	out += "}}<noinclude>\n[[Category:Data]]\n"
	
	if (weapon) {
		if (category.indexOf("/bow") + category.indexOf("/crossbow/") + 2) {
			out += "[[Category:DataRanged]]\n";
		} else if (category.indexOf("/dualgun/") == -1) {
			out += "[[Category:DataMelee]]\n";
		}
	}
	out += "</noinclude>";

	$("#output").val(out);
}

function searchWikiForEquip(query, callback) {
	searchWiki(query, function (names, links) {
		var rows = [];
		for (var i = 0; i < names.length; i++) {
			var $row = $('<span>').data("value", names[i]);
			$('<span>').text(names[i]).appendTo($row);
			$('<a>').attr({
				"href": links[i],
				"target": "_blank",
			}).append(
				$('<img>').attr("src", "//wiki.mabi.world/skins/Vector/images/external-link-ltr-icon.png")
				.click(function (e) { e.stopPropagation(); })
			).appendTo($row);
			rows.push($row);
		}
		callback(rows);
	});
}

function downloadEquipDataPage(name) {
	getPageContent("Template:Data" + name, function (content) {
		$("#equip-xml").val(content).change();
	}, console.warn);
}
