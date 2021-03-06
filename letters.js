"use strict";
$(function() {

	const scrabbleLetterDistribution = Object.freeze({
		"A": 9,
		"B": 2,
		"C": 2,
		"D": 4,
		"E": 12,
		"F": 2,
		"G": 3,
		"H": 2,
		"I": 9,
		"J": 1,
		"K": 1,
		"L": 4,
		"M": 2,
		"N": 6,
		"O": 8,
		"P": 2,
		"Q": 1,
		"R": 6,
		"S": 4,
		"T": 6,
		"U": 4,
		"V": 2,
		"W": 2,
		"X": 1,
		"Y": 2,
		"Z": 1
	});

	class LetterGenerator {
		constructor(distribution) {
			this.vowelChoices = [];
			this.consonantChoices = [];
			for (const key of Object.keys(distribution))
				if (/^[AEIOU]$/.test(key))
					for (let i = 0; i < distribution[key]; ++i) this.vowelChoices.push(key);
				else if (/^[BCDFGHJKLMNPQRSTVWXYZ]$/.test(key))
					for (let i = 0; i < distribution[key]; ++i) this.consonantChoices.push(key);
		}

		nextVowel() {
			const randomIndex = Math.floor(Math.random() * this.vowelChoices.length);
			return this.vowelChoices.splice(randomIndex, 1)[0];
		}

		nextConsonant() {
			const randomIndex = Math.floor(Math.random() * this.consonantChoices.length);
			return this.consonantChoices.splice(randomIndex, 1)[0];
		}
	}

	const jumbledLetters = Array(9).fill("");	// array of strings, can have blanks as they are removed
	const wordLetters = [];		// used more like a list, strings pushed and popped

	var lettersSelectedCount = 0;
	var consonantsSelectedCount = 0;
	const MAX_CONSONANT_COUNT = 6;
	var vowelsSelectedCount = 0;
	const MAX_VOWEL_COUNT = 5;

	var letterGen = new LetterGenerator(scrabbleLetterDistribution);

	const handleConsonantButton = function() {
		if(lettersSelectedCount < 9 && consonantsSelectedCount < MAX_CONSONANT_COUNT) {
			jumbledLetters[lettersSelectedCount] = letterGen.nextConsonant();
			paintCells();
			++lettersSelectedCount;
			++consonantsSelectedCount;
		}
	};
	$("#consbutton").click(handleConsonantButton);

	const handleVowelButton = function() {
		if(lettersSelectedCount < 9 && vowelsSelectedCount < MAX_VOWEL_COUNT) {
			jumbledLetters[lettersSelectedCount] = letterGen.nextVowel();
			paintCells();
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
		wordLetters.length = 0;

		lettersSelectedCount = 0;
		consonantsSelectedCount = 0;
		vowelsSelectedCount = 0;

		letterGen = new LetterGenerator(scrabbleLetterDistribution);

		paintCells();
	});

	// control start clock button
	var clockReqId = 0;
	$("#clock-button").click(function() {
		$("#clock-button").addClass("hidden");
		$("#countdown-display-holder").removeClass("hidden");
		const startTime = performance.now();
		var width = 1;
		const updateClock = function() {
			const elapsedTime = (performance.now() - startTime) / 1000.0;
			$("#countdown-display").text(elapsedTime < 30 ? elapsedTime.toFixed(3) : 30);
			if(elapsedTime < 30) {
				if(width < $("#countdown-display")[0].scrollWidth) {	// make countdown-display as wide as it's ever wanted to be
					width = $("#countdown-display")[0].scrollWidth;
					$("#countdown-display").css("width", width);
				}
				clockReqId = requestAnimationFrame(updateClock);
			} else {
				$("#countdown-display").css("width", "").addClass("finished");
			}
		}
		clockReqId = requestAnimationFrame(updateClock);
	});

	const resetClock = function() {
		cancelAnimationFrame(clockReqId);
		$("#countdown-display").text("").removeClass("finished");
		$("#countdown-display-holder").addClass("hidden");
		$("#clock-button").removeClass("hidden");
	};
	$("#countdown-display").click(resetClock);
	$("#reset-button").click(resetClock);

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
