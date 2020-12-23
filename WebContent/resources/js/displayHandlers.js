"use strict";
(function() {
		function restrictInputLength(event) {
//			console.log("restrictInputLength called ---------");
//			console.log(event.target.innerText);
			if (event.target.innerText.length >= 60) {
//				console.log("cutting down string");
				event.target.innerText = event.target.innerText.substr(0, 59);
//				console.log(event.target.innerText);
		        var range = document.createRange();
		        var sel = window.getSelection();
		        range.setStartAfter(event.target.childNodes[0]);
		        range.collapse(true);
		        sel.removeAllRanges();
		        sel.addRange(range);
			}
		}
		
		var itemNames = document.querySelectorAll(".itemNameElement");
		for (var i = 0; i < itemNames.length; ++i) {
			itemNames[i].addEventListener("keypress", restrictInputLength);
			itemNames[i].addEventListener("paste", restrictInputLength);
		}
	})();
	
	var descriptionHeight = (function () {
		function descriptionHeight(event) {
			console.log(event.key);
			if (event.target.scrollHeight > event.target.clientHeight) {
				event.target.rows = event.target.rows + 1;
			}
			else if (event.key === "Backspace" && event.target.rows > 5) {
				event.target.rows = event.target.rows - 1;
			}
		}
		var descriptions = document.querySelectorAll(".description");
		for (var i = 0; i < descriptions.length; ++i) {
			descriptions[i].addEventListener("keyup", descriptionHeight);
		}
		
		return descriptionHeight;
	})();

	/******************** E X P A N D / C O L L A P S E   C A R D ********************/
	var clickItemName = (function() {
		function clickItemName(event) {
			if (!event.target.classList.contains("itemNameElement")) {
				event.target.nextElementSibling.classList.toggle("displayNone");
				var tagMinuses = event.target.nextElementSibling.querySelectorAll(".tagMinus");
				for (var i = 0; i < tagMinuses.length; ++i) {
					if (!tagMinuses[i].classList.contains("displayNone")) {
						tagMinuses[i].classList.add("displayNone");
					}
				}
				if (tagMinuses.length !== 0 && !event.target.nextElementSibling.querySelector(".inputTag").classList.contains("displayNone")) {
					event.target.nextElementSibling.querySelector(".inputTag").classList.add("displayNone")
				}
			}
			event.stopPropagation();
		}
		registerHandlers(state.main.getElementsByClassName("itemName"), "click", clickItemName); // CHECK - DOES THIS TRACK ADDED AND DELETED ELEMENTS OF THIS CLASS?
		document.getElementById("inputItemName").addEventListener("click", clickItemName);
		
		return clickItemName;
	})();
	
	
	
	/******************** S H O W   M I N U S E S   -   I T E M S ********************/
	var getItemMinusesVisible = (function() {
		document.getElementById("itemsMinus").addEventListener("click", clickItemsMinus, "false");
		
		var visible = false;
		
		function clickItemsMinus(event) {
			var itemMinuses = state.main.getElementsByClassName("itemMinus");
			
			if (visible === false) {
				for (var i = 0; i < itemMinuses.length; ++i) {
					itemMinuses[i].classList.remove("displayNone");
				}
				visible = true;
			}
			else {
				for (var i = 0; i < itemMinuses.length; ++i) {
					itemMinuses[i].classList.add("displayNone");
				}
				visible = false;
			}
			event.stopPropagation();
		}
		
		function getVisible() {
			return visible;
		};
		
		return getVisible; 
	})();
	
	
	
	/******************** S H O W   M I N U S E S   -   T A G S ********************/
	var clickTagsMinus = (function() {
		registerHandlers(document.getElementsByClassName("tagsMinus"), "click", clickTagsMinus);
		
		function clickTagsMinus(event) {
			var tagMinuses = event.target.parentElement.nextElementSibling.getElementsByClassName("tagMinus");
			
			for (var i = 0; i < tagMinuses.length; ++i) {
				tagMinuses[i].classList.toggle("displayNone");
			}
			event.stopPropagation();
		}
		return clickTagsMinus;
	})();
	
	
	
	/******************** S H O W   I N P U T   I T E M ********************/
	(function() {
		document.querySelector(".itemsPlus").addEventListener("click", clickItemsPlus);
		
		function clickItemsPlus(event) {
			var itemsPlusAndMinus = document.getElementById("itemsPlusAndMinus");
			var inputItemName = itemsPlusAndMinus.nextElementSibling;
			var inputItemCard = itemsPlusAndMinus.nextElementSibling.nextElementSibling;
			
			if (inputItemName.classList.contains("displayNone")) {
				inputItemName.classList.remove("displayNone");
				inputItemCard.classList.remove("displayNone");
			}
			else {
				inputItemName.classList.add("displayNone");
				inputItemCard.classList.add("displayNone");
			}
			
			event.stopPropagation();
		}
	})();

	
	
	/******************** S H O W   I N P U T   T  A G ********************/
	var clickTagPlus = (function () {
		registerHandlers(state.main.getElementsByClassName("tagsPlus"), "click", clickTagPlus);
		
		function clickTagPlus(event) {
			var tagInputBox = event.target.parentElement.nextElementSibling.firstElementChild.nextElementSibling;
			if (tagInputBox.classList.contains("displayNone")) {
				tagInputBox.classList.remove("displayNone");
				tagInputBox.focus();
			}
			else {
				tagInputBox.classList.add("displayNone");
			}

//			var newTagInput = document.querySelector(".newTagInput");
//			newTagInput.classList.toggle("displayNone");
			event.stopPropagation();
		}
		return clickTagPlus;
	})();
	