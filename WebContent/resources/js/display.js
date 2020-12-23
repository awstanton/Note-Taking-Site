"use strict";
/******************** S O R T   I T E M S ********************/
(function() {
		(function() {
		function sortItems(event) {
			
			function compare(a, b) {
				var a0 = a[0];
				var b0 = b[0];
				if (typeof a0 === "string" && typeof b0 === "string") {
					a0 = a0.toLowerCase();
					b0 = b0.toLowerCase();
				}
				if (a0 < b0) {
					return -1;
				}
				else if (a0 > b0) {
					return 1;
				}
				else {
					return 0;
				}
			}
			
			var names = state.main.getElementsByClassName("itemName");
			
			function getValue(itemName, sortMethod) {
				switch(sortMethod) {
				case "itemName":
					return itemName.firstElementChild.innerText;
				case "created":
					return itemName.nextElementSibling.querySelector(".created").firstElementChild.innerText; 
				case "modified":
					return itemName.nextElementSibling.querySelector(".modified").firstElementChild.innerText;
				case "listName":
					return itemName.nextElementSibling.querySelector(".listName").innerText;
				default:
					return "";
				}
			}
			var nameArray = [];
			for (var i = 0; i < names.length; ++i) {
				nameArray[i] = [getValue(names[i], event.target.value), names[i], names[i].nextElementSibling]; // [name, nameRef, cardRef]
			}
			nameArray.sort(compare);
			
			var currentElement = document.getElementById("inputItemCard");
			
			for (var i = 0; i < nameArray.length; ++i) {
				var newName = nameArray[i][1];
				var newCard = nameArray[i][2];
				currentElement.insertAdjacentElement("afterend", newName); // insert item name
				newName.insertAdjacentElement("afterend", newCard); // insert item card
				currentElement = newCard; // set currentElement to newly insert card
			}
		}
		document.getElementById("orderSelect").addEventListener("focusout", sortItems);
	})();
	
	
	
	/******************** F I L T E R   I T E M S ********************/
	(function () {
		function filterItems(event) {
			var searchString = event.target.value;
//			console.log("searchString = " + searchString);
			var names = state.main.getElementsByClassName("itemName");
			
			var nameArray = [];
			for (var i = 0; i < names.length; ++i) {
				nameArray[i] = [names[i].firstElementChild.innerText, names[i], names[i].nextElementSibling]; // [name, nameref, cardref]
			}
			
			for (i = 0; i < nameArray.length; ++i) {
				if (nameArray[i][1].classList.contains("displayNone")) {
					nameArray[i][1].classList.remove("displayNone");
				}
			}
			
			for (i = 0; i < nameArray.length; ++i) {
				if (nameArray[i][0].search(searchString) === -1) {
					nameArray[i][1].classList.add("displayNone");
					if (!nameArray[i][2].classList.contains("displayNone")) {
						nameArray[i][2].classList.add("displayNone");
					}
				}
			}
		}
		document.getElementById("filterSearch").addEventListener("focusout", filterItems);
	})();
	
	

	/******************** E X P A N D / C O L L A P S E   A L L ********************/
	(function () {
		var expand = true;
		
		function clickExpandCollapseAll(event) {
			var itemCards = state.main.querySelectorAll(".itemCard ~ .itemCard");
			
			if (expand) {
				for (var i = 0; i < itemCards.length; ++i) {
					if (itemCards[i].classList.contains("displayNone") && !itemCards[i].previousElementSibling.classList.contains("displayNone")) {
						itemCards[i].classList.remove("displayNone");
					}
				}
				expand = false;
			}
			else {
				for (var i = 0; i < itemCards.length; ++i) {
					if (!itemCards[i].classList.contains("displayNone")) {
						itemCards[i].classList.add("displayNone");
						
						// added begin
						var tagMinuses = itemCards[i].querySelectorAll(".tagMinus");
						for (var j = 0; j < tagMinuses.length; ++j) {
							if (!tagMinuses[j].classList.contains("displayNone")) {
								tagMinuses[j].classList.add("displayNone");
							}
						}
						var inputTag = itemCards[i].querySelector(".inputTag");
						if (tagMinuses.length !== 0 && !inputTag.classList.contains("displayNone")) {
							inputTag.classList.add("displayNone");
						} // added end
					}
				}
				expand = true;
			}
			event.stopPropagation();
		}
		document.getElementById("expandCollapseAll").addEventListener("click", clickExpandCollapseAll);
	})();
})();
