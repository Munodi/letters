"use strict";
$(function() {
	var jumbledLetters = Array(9).fill("");	// array of strings, can have blanks as they are removed
	var wordLetters = [];		// used more like a list, strings pushed and popped

	var lettersSelectedCount = 0;
	var consonantsSelectedCount = 0;
	const maxConsonantCount = 6;
	var vowelsSelectedCount = 0;
	const maxVowelCount = 5;
	var handleConsonantButton = function() {
		if(lettersSelectedCount < 9 && consonantsSelectedCount < maxConsonantCount) {
			const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
			jumbledLetters[lettersSelectedCount] = consonants.charAt(Math.floor(Math.random() * consonants.length));
			$(".letter-col").each(function(index) {
				if(index === lettersSelectedCount)
					$(this).text(jumbledLetters[index]);
			});
			++lettersSelectedCount;
			++consonantsSelectedCount;
		}
	};
	$("#consbutton").click(handleConsonantButton);

	var handleVowelButton = function() {
		if(lettersSelectedCount < 9 && vowelsSelectedCount < maxVowelCount) {
			const vowels = "AEIOU";
			jumbledLetters[lettersSelectedCount] = vowels.charAt(Math.floor(Math.random() * vowels.length));
			$(".letter-col").each(function(index) {
				if(index === lettersSelectedCount)
					$(this).text(jumbledLetters[index]);
			});
			++lettersSelectedCount;
			++vowelsSelectedCount;
		}
	};
	$("#vowelbutton").click(handleVowelButton);

	const paintCells = function() {
		$("#jumbled-letters-row>.letter-col").each(function(index) {
			$(this).text(jumbledLetters[index]);
		});

		$("#word-letters-row>.letter-col").each(function(index) {
			$(this).text(index < wordLetters.length ? wordLetters[index] : "");
		});
	};

	$(document).keydown(function(event) {
		// if user has not chosen their letters yet, if they click C add a consonant and if V add a vowel
		// this won't work on safari and old chrome
		const key = event.key.toUpperCase();
		if(lettersSelectedCount < 9) {
			if(key === "C")
				$("#consbutton").click();
			if(key === "V")
				$("#vowelbutton").click();
		}
		else if(key.length === 1 && key >= "A" && key <= "Z") {
			for(let i = 0; i < jumbledLetters.length; ++i) {
				if(jumbledLetters[i] === key) {
					wordLetters.push(jumbledLetters[i]);
					jumbledLetters[i] = "";
					break;
				}
			}
			paintCells();
		} else if(event.key === "Backspace" || event.key === "Delete") {	// put last letter in wordLetters into first empty slot in jumbledLetters
			for(let i = 0; i < jumbledLetters.length; ++i) {
				if(jumbledLetters[i] === "") {
					jumbledLetters[i] = wordLetters.pop();
					break;
				}
			}
			event.preventDefault();	// prevent backspace from bubbling to browser
			paintCells();
		}
	});

	// if the user clicks a jumbled-row cell with a value in it move it to the word row
	$("#jumbled-letters-row>.letter-col").click(function() {
		const index = $("#jumbled-letters-row>.letter-col").index(this);

		if(lettersSelectedCount === 9 && jumbledLetters[index] !== "") {	// === 9 checks all the letters have been chosen before letting the user put any in the next row. An alternative would be to only add the trigger when all 9 letters are chosen and on reset remove
			wordLetters.push(jumbledLetters[index]);
			jumbledLetters[index] = "";
			paintCells();
		}
	});

	$("#word-letters-row").click(function() {
		if(lettersSelectedCount === 9) {
			for(let i = 0; i < jumbledLetters.length; ++i) {
				if(jumbledLetters[i] === "") {
					jumbledLetters[i] = wordLetters.pop();
					break;
				}
			}
			paintCells();
		}
	});

	$("#reset-button").click(function() {
		jumbledLetters.fill("");
		wordLetters = [];

		lettersSelectedCount = 0;
		consonantsSelectedCount = 0;
		vowelsSelectedCount = 0;

		paintCells();
	});

	// If localStorage variable that should be page specific is not set then show the modal
	// In some circumstances localStorage is not available. Also iOS Safari in private mode has a quota of 0 so setItem always fails
	function storageAvailable(type) {
		try {
			var storage = window[type],
				x = '__storage_test__';
			storage.setItem(x, x);
			storage.removeItem(x);
			return true;
		}
		catch(e) {
			return false;
		}
	}

	if(storageAvailable('localStorage')) {
		if(localStorage.getItem(location.href + "/doNotShowHelp") !== "true") {
			$("#helpModal").modal();

			$("#helpModal").on("hidden.bs.modal", function (e) {
				if(document.getElementById("dont-show-help").checked) {
					try { localStorage.setItem(location.href + "/doNotShowHelp", "true"); } catch (e) { console.log(e); }
				}
			});
		}
	} else {	// if cannot use localStorage then hide checkbox and display anyway
		document.getElementById("dont-show-help-holder").style.display = "none";
		$("#helpModal").modal();
	}
});
