function setVisibleChoices(category) {
	document.querySelectorAll(".choices").forEach(s => {
		if (s.id == category + "_choices") {
			s.style.display = "block";
		} else {
			s.style.display = "none";
		}
	});
}

window.onload = function() {
	setVisibleChoices("");

	var categorySelect = document.querySelector("#category");
	var setReminderButton = document.getElementById("setreminder");
	categorySelect.addEventListener("change", function() {
		setVisibleChoices(categorySelect.value);
		if (categorySelect.value) {
			setReminderButton.style.display = "block";
		} else {
			setReminderButton.style.display = "none";
		}
	});

	setReminderButton.addEventListener("click", function() {
		var category = categorySelect.value;
		var choice = document.getElementById(category + "_choices").value;
		console.log(category, choice);
	});

};