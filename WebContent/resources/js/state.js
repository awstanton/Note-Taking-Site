"use strict";

var state = {
	/*
	 * root element of middle section of document
	 */
	main: document.getElementById("main"),
	/*
	 * item name -> [Set of names of tags of item, listName]
	 */
	itemNamesMap: new Map(),
	/*
	 * item name -> 
	 * {
	 * 		action:	"create", "delete", or "update"
	 * 		oldItemName: (item is to be updated or deleted) ? itemName : ""
	 * 		newItemName: (item is to be created or renamed) ? itemName : ""
	 * 		oldListName: (item is to be removed from list or transferred to new list) ? old list name : ""
	 * 		newListName: (item is to be added to list or transferred to new list) ? new list name : ""
	 * 		description: (description has been changed) ? description : ""
	 * 		oldTags: [names of tags removed from item]
	 * 		newTags: [names of tags added to item]
	 * 		modified: [date item was changed in YYYY-MM-DD format]
	 * }
	 */
	changesMap: new Map()
};

// initialize itemNamesMap
(function() {
	var itemNames = document.querySelectorAll(".itemNameElement");
	for (var i = 0; i < itemNames.length; ++i) {
		if (itemNames[i].id !== "inputItemNameElement") {
			state.itemNamesMap.set(itemNames[i].innerText,
				[getItemTagNames(itemNames[i].parentElement.nextElementSibling),
				itemNames[i].parentElement.nextElementSibling.querySelector(".listName").innerText]);
		}
	}
	state.itemNamesMap.delete(""); // remove input item from set
})();

//given reference to item card, returns Set of names of tags of that item
// used by one function in handlers.js
function getItemTagNames(itemCard) {
	var itemTagNames = new Set();
	var itemTags = itemCard.querySelectorAll(".tagName");
	for (var i = 0; i < itemTags.length; ++i) {
		itemTagNames.add(itemTags[i].innerText);
	}
	return itemTagNames;
}
