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

function setVisibleChoices(category) {
	document.querySelectorAll(".choices").forEach(s => {
		if (s.id == category + "_choices") {
			s.classList.remove("hidden");
		} else {
			s.classList.add("hidden");
		}
	});
}

function updateUserRemindersTable() {
	ajax({
		url: "/reminders/user/" + getCurrentUser(),
		callback: function() {
			var reminders = JSON.parse(this.responseText);
			var table = document.querySelector("#user_reminders tbody");
			[...table.querySelectorAll(".reminder:not(.placeholder)")].forEach(row => { row.remove(); });
			var placeholder = table.querySelector(".placeholder");
			reminders.forEach(reminder => {
				var newReminderRow = placeholder.cloneNode(true);
				newReminderRow.classList.remove("placeholder");
				newReminderRow.dataset.id = reminder.id;
				newReminderRow.querySelector(".category").innerHTML = reminder.category;
				newReminderRow.querySelector(".choice").innerHTML = reminder.choice;
				newReminderRow.querySelector(".email").innerHTML = reminder.email;
				newReminderRow.querySelector(".delete").addEventListener("click", function() {
					var id = this.closest(".reminder").dataset.id;
					ajax({
						url: "/reminders/" + id,
						method: "DELETE",
						callback: function() {
							updateUserRemindersTable();
						}
					});
				});
				table.appendChild(newReminderRow);
			});
		}
	});
}

window.onload = function() {
	setVisibleChoices("");

	var categorySelect = document.getElementById("category");
	var reminderDiv = document.getElementById("reminder");
	var setReminderButton = document.getElementById("setreminder");
	var emailInput = document.getElementById("email");
	var loading = document.getElementById("loading");

	categorySelect.addEventListener("change", function() {
		setVisibleChoices(categorySelect.value);
		if (categorySelect.value) {
			reminderDiv.classList.remove("hidden");
		} else {
			reminderDiv.classList.add("hidden");
		}
	});

	setReminderButton.addEventListener("click", function() {
		loading.classList.remove("hidden");
		var category = categorySelect.value;
		var choice = document.getElementById(category + "_choices").value;
		var email = emailInput.value;
		ajax({
			url: "/reminders/",
			method: "POST",
			data: JSON.stringify({category, choice, email}),
			headers: {"Content-Type": "application/json"},
			callback: function() {
			    var data = JSON.parse(this.responseText);
			    loading.classList.add("hidden");
			    if (getCurrentUser())
			    	updateUserRemindersTable();
			}
		});
	});

	if (getCurrentUser()) {
		updateUserRemindersTable();
	}

};