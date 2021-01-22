if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';

    if (search instanceof RegExp) {
      throw TypeError('first argument must not be a RegExp');
    } 
    if (start === undefined) { start = 0; }
    return this.indexOf(search, start) !== -1;
  };
}

if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) { 
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

function joinCommaAnd(arr) {
	if (arr.length === 1) return arr[0];
	if (arr.length === 2) return arr[0] + " and " + arr[1];
	const firsts = arr.slice(0, arr.length - 1);
	const last = arr[arr.length - 1];
	return firsts.join(", ") + " and " + last;
}

function capitalize(str) {
	try {
		return str
			.split(" ")
			.map(function(word) {
				return word
				.split("(")
	            .map(function(w2) {
	            	return w2
	                .split("\"")
				    .map(function(w) { return w.substring(0, 1).toUpperCase() + w.substring(1);})
	                .join("\"");
	           	})
				.join("(");
			})
			.join(" ");
	} catch(ex) {
		console.log(ex);
		return "";
	}
}

function ajax(options) {
	var opts = Object.assign({
		method: "GET",
		headers: {},
		data: undefined
	}, options);
	var req = new XMLHttpRequest();
	req.addEventListener("load", opts.callback);
	req.open(opts.method, opts.url);
	for (header in opts.headers) {
		req.setRequestHeader(header, opts.headers[header]);
	}
	req.send(opts.data);
}

function getCurrentUser() {
	return document.body.dataset.user ? document.body.dataset.user : null;
}

function showCategories() {
	if ($("#parked > div:has(.category)").length > 0) {
		$("#main_selection > *").appendTo($("#parked"));
		$("#parked > div:has(.category)").appendTo($("#main_selection"));
		$("#selection_header .name").text("");
		$("#selection_header").addClass("d-none");
		$("#selection_header .search-choice").addClass("d-none");
	}
}

function expandCategory(category) {
	var categoryType = $("#category_"+category).data("type");
	var categoryDescription = $("#category_"+category).data("description");
	$("#main_selection > div").appendTo($("#parked"));
	$("#selection_header .name").text(categoryDescription);
	$("#selection_header").removeClass("d-none");
	$("#parked > div."+category+"-container").appendTo($("#main_selection"))
	if (["vendor", "list"].includes(categoryType)) {
		// show search input if more than 10 choices
		var nChoices = $("div."+category+"-container > div:has(.choice[data-category='"+category+"'])").length;
		if (nChoices > 10) {
			$("#selection_header .search-choice").removeClass("d-none");
		}
	}
}

function expandChoice(choice) {
	var categoryType = $("#category_"+history.state.category).data("type");
	if (categoryType == "combo") {
		Object.entries(JSON.parse(choice.data.id)).forEach(entry => {
			var [type, value] = entry;
			$("#"+history.state.category+"_"+type).val(value);
		});
		$("#combo_choose").prop("disabled", false);
	}
	$("#reminder_modal .modal-title").text("Reminder for: " + capitalize(choice.name));
	$("#reminder_current").toggleClass("d-none", (!choice.data || choice.data.current === undefined));
	$("#reminder_needed")
		.toggleClass("d-none", (!choice.data || choice.data.needed === undefined))
		.html("You might need this for "
			+ joinCommaAnd(choice.data.neededFor.map(function(n) {
				var str;
				switch (n.type) {
					case "triumph": str = "the triumph <em>" + capitalize(n.name) + "</em>"; break;
					case "objective": str = "the triumph <em>" + capitalize(n.name) + "</em>"; break;
					case "book": str = "the lore book <em>" + capitalize(n.name) + "</em>"; break;
					case "lore": str = "the lore <em>" + capitalize(n.name) + "</em>"; break;
					case "item": str = "the item <em>" + capitalize(n.name) + "</em>"; break;
					case "eggs": str = "<em>" + n.checklist.length + " corrupted eggs</em>"; break;
				}
				return str;
			}))
		);
	$("#reminder_modal").modal("show");
}

function updateUI() {
	$("#reminder_modal").modal("hide");
	showCategories();
	if (history.state && history.state.category) {
		expandCategory(history.state.category);
	}
	if (history.state && history.state.choice) {
		expandChoice(history.state.choice);
	}	
}

$(document).ready(function() {

	if (window.location.hash) {
		var locationInfo = window.location.hash.substring(1).split("/");
		var category = locationInfo[0];
		var choiceId = locationInfo[1];
		if (choiceId) {
			choiceId = decodeURIComponent(choiceId);
			var choiceName, choiceData;
			var categoryType = $("#category_"+category).data("type");
			if (["list", "vendor"].includes(categoryType)) {
				$(".choice").each(function() {
					if ($(this).attr("data-id") == choiceId) {
						choiceName = $(this).data("id");
						choiceData = $(this).data();
					}
				});
			} else if (categoryType == "combo") {
				choiceName = Object.values(JSON.parse(choiceId)).map(capitalize).join(" - ");
				choiceData = {
					neededFor: [],
					id: choiceId
				}
			}
		}
		history.replaceState({
			category: category,
			choice: choiceId ? {name: choiceName, data: choiceData} : null
		}, "");
		updateUI();
	}

	$(".category").click(function() {
		var category = $(this).data("category");
		var categoryDescription = $(this).data("description");
		history.pushState({category: category}, categoryDescription, "/#"+category);
		updateUI();
	});

	$("#close_selection").click(function() {
		$(".search-choice input").val("").trigger("input");
		history.pushState({}, "Destiny Reminders", "/");
		updateUI();
	});

	$(".choice").click(function() {
		var choice = {name: $(this).data("id"), data: $(this).data()};
		history.pushState({
			category: history.state.category,
			choice: choice
		}, "Set Reminder", "#"+history.state.category+"/"+encodeURIComponent(choice.data.id));
		updateUI();
	});

	$("#combo_form").submit(function(e) {
		e.preventDefault();
		var choice = {
			name: $("#main_selection select").map((i, s) => capitalize($(s).val())).get().filter(c => c).join(" - "),
			data: {
				neededFor: [],
			}
		};
		choice.data.id = {};
		$("#main_selection select").each((i, s) => {
			var type = s.id.split("_")[1];
			var value = $(s).val();
			choice.data.id[type] = value;
		});
		choice.data.id = JSON.stringify(choice.data.id);
		history.pushState({
			category: history.state.category,
			choice: choice
		}, "Set Reminder", "#"+history.state.category+"/"+encodeURIComponent(choice.data.id));
		updateUI();
	});

	$(".close-modal").click(function() {
		history.pushState({category: history.state.category}, "", "/#"+history.state.category);
		updateUI();
	});

	$("#reminder_login").click(function(e) {
		$(this).attr("href", $(this).attr("href") + "?returnTo=/"+encodeURIComponent(window.location.hash));
	});

	$("#reminder_modal form").submit(function(e) {
		e.preventDefault();
		$("#set_reminder")
			.prop("disabled", true)
			.find(".spinner")
			.addClass(["spinner-border", "spinner-border-sm"]);
		var category = history.state.category;
		var choice = history.state.choice.data.id;
		var email = $("#reminder_email").val();
		ajax({
			url: "/api/reminders/",
			method: "POST",
			data: JSON.stringify({category: category, choice: choice, email: email}),
			headers: {"Content-Type": "application/json"},
			callback: function() {
			    //var data = JSON.parse(this.responseText);
				setTimeout(function() {
					$("#set_reminder .spinner").removeClass(["spinner-border", "spinner-border-sm"]);
					window.location = "/reminders";
				}, 1000);
			}
		});
	});

	$(".reminder-delete").click(function(e) {
		e.preventDefault();
		var reminderRow = $(this).closest("tr");
		var category = reminderRow.find(".reminder-category").text();
		var choice = reminderRow.find(".reminder-choice").text();
		bootbox.confirm("Are you sure you want to delete the reminder for " + category + ": " + choice + "?", function(ans) {
			if (ans) {
				var id = reminderRow.data("id");
				ajax({
					url: "/api/reminders/" + id,
					method: "DELETE",
					callback: function() {
						window.location.reload();
					}
				});
			}
		});
	});

	$(".search-choice input").on("input", function() {
		var search = $(this).val();
		if (search == "") {
			$("#main_selection > .cat-container > div").show();
		} else {
			$("#main_selection > .cat-container > div").each(function() {
				$(this).toggle($(this).text().toLowerCase().includes(search.toLowerCase()));
			});
		}
	});

	$("#combo_form select").change(function() {
		var empty = true;
		$("#combo_form select").each(function(i, s) {
			if ($(this).val()) {
				empty = false;
			}
		});
		$("#combo_choose").prop("disabled", empty);
	});

	$(".filter-btns button").click(function() {
		var buttons = $(this).closest(".filter-btns");
		if ($(this).is(".current, .needed")) {
			$(this).toggleClass("active");
		} else {
			$(".filter-btns button").removeClass("active");
		}
		var buttonCurrent = buttons.find("button.current");
		var buttonNeeded = buttons.find("button.needed");
		$(this).closest(".cat-container").find(".choice").each(function() {
			$(this).toggle(
				(!buttonCurrent.hasClass("active") || $(this).hasClass("current")) &&
				(!buttonNeeded.hasClass("active") || $(this).hasClass("needed"))
			);
		});
	});

	$(window).scroll(function () {
		if ($(this).scrollTop() > 50) {
			$("#back_to_top").fadeIn();
		} else {
			$("#back_to_top").fadeOut();
		}
	});
	$("#back_to_top").click(function () {
		$("body, html").animate({
			scrollTop: 0
		}, 400);
		return false;
	});

	$(window).on("popstate", function(event) {
		updateUI();
	});

});