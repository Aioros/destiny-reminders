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

function joinCommaAnd(arr) {
	if (arr.length === 1) return arr[0];
	if (arr.length === 2) return arr[0] + " and " + arr[1];
	const firsts = arr.slice(0, arr.length - 1);
	const last = arr[arr.length - 1];
	return firsts.join(", ") + " and " + last;
}

function capitalize(str) {
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
		$("#main_selection > div").appendTo($("#parked"));
		$("#parked > div:has(.category)").appendTo($("#main_selection"));
		$("#selection_header .name").text("");
		$("#selection_header").addClass("d-none");
		$("#selection_header .search-choice").addClass("d-none");
	}
}

function expandCategory(category) {
	var nChoices = $("#parked > div:has(.choice[data-category='"+category+"'])").length;
	if (nChoices > 0) {
		var categoryDescription = $("#category_"+category).data("description");
		$("#main_selection > div").appendTo($("#parked"));
		$("#parked > div:has(.choice[data-category='"+category+"'])").appendTo($("#main_selection"));
		$("#selection_header .name").text(categoryDescription);
		$("#selection_header").removeClass("d-none");
		if (nChoices > 10) {
			$("#selection_header .search-choice").removeClass("d-none");
		}
	}
}

function expandChoice(choice) {
	$("#reminder_modal .modal-title").text("Reminder for: " + choice.name);
	$("#reminder_current").toggleClass("d-none", choice.data.current === undefined);
	$("#reminder_needed")
		.toggleClass("d-none", choice.data.needed === undefined)
		.html("You might need this activity for "
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
		var choiceName = locationInfo[1];
		if (choiceName) {
			choiceName = decodeURIComponent(choiceName);
			var choiceData = $(".choice[data-choice='"+capitalize(choiceName)+"']").data();
		}
		history.replaceState({
			category: category,
			choice: choiceName ? {name: choiceName, data: choiceData} : null
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
		var choice = {name: $(this).text(), data: $(this).data()};
		history.pushState({
			category: history.state.category,
			choice: choice
		}, "Set Reminder", "#"+history.state.category+"/"+encodeURIComponent(choice.name));
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
		var choice = history.state.choice.name;
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
			$("#main_selection > div").show();
		} else {
			$("#main_selection > div").each(function() {
				$(this).toggle($(this).text().toLowerCase().includes(search.toLowerCase()));
			});
		}
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