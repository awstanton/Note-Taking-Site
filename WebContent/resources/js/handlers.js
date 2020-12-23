"use strict";
/*
requests must be sent one at a time. when a request completes, check queue for any requests. If any, send next. If none, wait until next save.
- if later this is causing performance issues, only then look for ways to let certain requests go at the same time.
- item names must be unique
- tag names must be unique within an item
- there must be a limit on the number of tags and on the length of the description and list names and tag names and item names,
12-17-2020: if save is still pending, any refresh that is requested must wait for save to complete
 */

/*
User clicks plus. Then, empty card appears. If the user clicks anywhere other than the card, then if there was any info added,
the card is saved as a new item. Otherwise, the card stays open until something is clicked (either the empty input box - might
say Click Here to Close or Click Here to Save, or just clicking anywhere else), on which it gets closed.

User clicks items minus. Minuses appear next to all item names. The user can click on as many minuses as they want to delete
those items they choose to delete. The minuses disappear when the user clicks on the minus again. Just keep it a minus for now,
it could be made a button or something different later if need be.

There is only one nameless item at a time. If the user tries to click on the plus, it just brings up the same nameless item, until
it is given a name.

When user clicks the item name, if the name is empty, and when the user clicks out, it is not empty, a check for uniqueness is made.
If it is unique, the item gets saved, and a new empty and hidden item is generated. Otherwise, the name becomes empty again, and a
message may appearing saying that the name should be made unique. If the name is not empty, then if the name is changed and made unique,
then the change to the name is saved.

If a user clicks into the list name, the old list name is saved in a variable. When the user clicks out, (this could be the user
clicking twice for the list to pop up, choosing a list name from the list, and then typing more and then clicking out), and if the
name has changed, then check if the item is saved. If so, just add new list name to the save object. Otherwise, no changes have been made.
There will be no old list names list. The server will check for existing list name and update accordingly.

modified for an item is only changed each time that item is saved.

when user clicks plus for tags, the input box connected to the datalist pops up. When the user clicks away, if the tag is empty or is
already a part of the list, then the input box disappears and the tag is not added. There may be a message saying the tag must not
already be there. If after clicking out, the tag is not already there, then it is checked for in the oldTags list for that item, if
the item is saved. If it was there, then it is removed from the oldTags list and not added to the newTags list. Also, if that is the
only change to the item, then the object representing the saved changes to that item is deleted. If the tag is unique, then it is added
to the top of the list and the box disappears.

when user clicks minus for tags, the minuses all appear. Then, when user clicks one of the minuses, that tags disappears, and is added
to the old tags for that item unless it was already in new tags, in which case it is just removed from new tags. When the user clicks
the one minus again, the other minuses disappear.

when the user presses ctrl+S, all saved changes are sent to the server.

if ctrl+S is pressed while there is still a pending save that has not returned its promise, it does not go through.
if change is made while save is pending, then those changes are added to new object. there can be at most two save objects at one time,
and there are only two when a change is made when a save is still pending. When the save completes, the old save object is deleted.
The new save object is just like a new save object without a pending promise, except that if the pending promise reports back any errors,
those errors will have to be dealt with.

So, to be clear, tags to be dissociated (and if only associated with that one) with an item and those to be associated, are recorded.
If one is to be dissociated, it is checked if that is the last association, and if so, then the tag is deleted. Same with lists.
Tags to be dissociated are also checked if they are the last one, and if so, they are deleted. If there are not already existing, they
are inserted into tags table as well.

tags word should only show up if there is at least one tag
maybe put a plus there for list
ideally there would be option to show or not show some extra info like the date or to make the date only by day and not time too
maybe have a filter by option that filters by item name, by tags (full or partial), by list (full name), description, or any of them.
ideally, there would be an interface for deleting unused tags where they only get deleted when the user explicity deletes them - TRY TO DO THIS
- maybe it could appear on the right side with minuses, and the user could delete from there
- same thing could be done for lists
it would be nice to have a sidebar where user could select a list to view, and the list name would appear at the top
OR there could be one page for lists and one page for tags
- lists page would just show a listing of listnames with the item names underneath; it would have option to delete lists (items would stay)
- tags page would just show a listing of the tags and how many items they belong to; it would have option to delete unused tags only
TWO OPTIONS: USER CONTROLS UNUSED LIST AND TAG DELETION, OR THEY DO NOT. Either give interface to them, or have script that runs on startup or shutdown
that looks for unused lists or tags. DO NOT WORRY ABOUT IT NOW. FOR NOW, ALL OF THE REQUESTS ARE INDEPENDENT OF EACH OTHER.
 */


(function() {
	/******************** C R E A T E   I T E M ********************/
	(function() {
		function newItem(event) {
			if (event.target.innerText !== "") {
				if (state.itemNamesMap.has(event.target.innerText)) {
					event.target.innerText = "";
				}
				else {
					if (event.target.innerText.length > 60) {
						event.target.innerText = event.target.innerText.substr(0, 60);
					}
					
					var inputItemName = event.target.parentElement;
					// clone the input item name
					var createdItemName = inputItemName.cloneNode(true);
					createdItemName.removeAttribute("id");
					createdItemName.firstElementChild.removeAttribute("id");
					createdItemName.classList.add("itemName");
					var createdItemMinus = document.createElement("span");
					createdItemMinus.setAttribute("class", "itemMinus displayNone");
					createdItemMinus.innerText = '-';
					createdItemName.appendChild(createdItemMinus);
					// clone the input item card
					var inputItemCard = event.target.parentElement.nextElementSibling;
					var createdItemCard = inputItemCard.cloneNode(true);
					createdItemCard.removeAttribute("id");
					// reset all attributes of input item
					inputItemName.firstElementChild.innerText = "";
					inputItemCard.querySelector(".listInput").value = "";
					inputItemCard.querySelector(".description").value = "";
					inputItemCard.querySelector(".inputTag").value = "";
					
					var inputItemTags = inputItemCard.querySelectorAll(".tag");
					for (var i = 0; i < inputItemTags.length; ++i) {
						inputItemTags[i].remove();
					}
					
					// add even listeners
					var createdTagsPlus = createdItemCard.querySelector(".tagsPlus");
					createdTagsPlus.addEventListener("click", clickTagPlus);				
					var createdTagsMinus = createdItemCard.querySelector(".tagsMinus");
					createdTagsMinus.addEventListener("click", clickTagsMinus);
					
					var createdTagMinuses = createdItemCard.querySelectorAll(".tagMinus");
					for (var i = 0; i < createdTagMinuses.length; ++i) {
						createdTagMinuses[i].addEventListener("click", deleteTag);
					}
					createdItemCard.querySelector(".listName").addEventListener("click", clickAndBlurItemList[0]);
					createdItemCard.querySelector(".listInput").addEventListener("click", clickAndBlurItemList[1]);
					createdItemCard.querySelector(".listInput").addEventListener("focusout", clickAndBlurItemList[2]);
					createdItemCard.querySelector(".description").addEventListener("focusout", blurDescription);
					createdItemCard.querySelector(".description").addEventListener("keyup", descriptionHeight);
					
					// remove any duplicate tags
					var createdTags = createdItemCard.querySelectorAll(".tag");
					var tagSet = new Set();
					for (var i = 0; i < createdTags.length; ++i) {
						if (tagSet.has(createdTags[i].innerText)) {
							createdTags[i].remove();
						}
						else {
							tagSet.add(createdTags[i].innerText);
						}
					}
					
					// DELETE THIS - LOOKS LIKE A DUPLICATE OF ABOVE
					var inputTags = inputItemCard.querySelector(".tag");
					if (inputTags) {
						for (var i = 0; i < inputTags.length; ++i) {
							inputTags[i].remove();
						}
					}
					
					// insert new item name and new item card into DOM and add event listeners
					var inputItemCard = document.getElementById("inputItemCard");
					inputItemCard.insertAdjacentElement("afterend", createdItemName);
					createdItemName.insertAdjacentElement("afterend", createdItemCard);
					
					createdItemName.addEventListener("click", clickItemName);
					createdItemName.firstElementChild.addEventListener("click", clickAndBlurItemNameElement[0]);
					createdItemName.firstElementChild.addEventListener("focusout", clickAndBlurItemNameElement[1]);
					createdItemCard.querySelector(".inputTag").addEventListener("blur", newTag);
					var itemMinus = createdItemName.querySelector(".itemMinus");
					itemMinus.addEventListener("click", deleteItem);
					if (getItemMinusesVisible() === false) {
						itemMinus.classList.add("displayNone");
					}
					else {
						itemMinus.classList.remove("displayNone");
					}
					
					inputItemName.classList.add("displayNone");
					inputItemCard.classList.add("displayNone");
					
					var filterValue = document.getElementById("filterSearch").value;
					
					// hide item if it does not satisfy filter
					if (filterValue !== "") {
						if (createdItemName.firstElementChild.innerText.search(filterValue) === -1) {
							createdItemName.classList.add("displayNone");
							if (!createdItemCard.classList.contains("displayNone")) {
								createdItemCard.classList.add("displayNone");
							}
						}
					}
					
					// update state.changesMap
					var time = new Date(); // ADD TO lambda expression instead
					state.changesMap.set(createdItemName,
						{
							action: "create",
							oldItemName: "",
							newItemName: createdItemName.firstElementChild.innerText,
							oldListName: "",
							newListName: createdItemCard.querySelector(".listInput").value,
							description: createdItemCard.querySelector(".description").value,
							oldTags: [],
							newTags: (() => {
								var tagList = [], tags = createdItemCard.querySelectorAll(".tagName");
								  for (var i = 0; i < tags.length; ++i) {
									  tagList.push(tags[i].innerText);
								  }
								  return tagList;
							})(),
							modified: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
					  });
					
//					console.log("reguestQueue:");
//					console.log("action = " + state.changesMap.get(createdItemName).action);
//					console.log("oldItemName = " + state.changesMap.get(createdItemName).oldItemName);
//					console.log("newItemName = " + state.changesMap.get(createdItemName).newItemName);
//					console.log("oldListName = " + state.changesMap.get(createdItemName).oldListName);
//					console.log("newListName = " + state.changesMap.get(createdItemName).newListName);
//					console.log("description = " + state.changesMap.get(createdItemName).description);
//					console.log("oldTags = " + state.changesMap.get(createdItemName).oldTags);
//					console.log("newTags = " + state.changesMap.get(createdItemName).newTags);
//					console.log("modified = " + state.changesMap.get(createdItemName).modified);
					
					// update item name map
					state.itemNamesMap.set(createdItemName.firstElementChild.innerText, [getItemTagNames(createdItemName.nextElementSibling), ""]);
//					console.log(state.itemNamesMap);
				}
			}
		}
		document.getElementById("inputItemNameElement").addEventListener("blur", newItem);
	})();

	
	
	/******************** C R E A T E   T A G ********************/
	var newTag = (function() {
		function newTag(event) {
			var updatedItemName = event.target.parentElement.parentElement.parentElement.previousElementSibling;
			if (updatedItemName.id !== "inputItemName" &&
				state.itemNamesMap.get(updatedItemName.firstElementChild.innerText)[0].has(event.target.value) || 
				updatedItemName.nextElementSibling.querySelectorAll(".tag").length >= 10) {
				event.target.value = "";
			}
			else if (event.target.value !== "") {
				var newTag = document.createElement("div");
				newTag.setAttribute("class", "tag");
				var newTagName = document.createElement("span");
				newTagName.setAttribute("class", "tagName");
				newTagName.innerText = event.target.value;
				var newTagMinus = document.createElement("span");
				newTagMinus.setAttribute("class", "tagMinus");
				var existingItemTagMinuses = event.target.parentElement.getElementsByClassName("tagMinus");
				
				if (updatedItemName.id !== "inputItemName") {
					var updatedItemCard = updatedItemName.nextElementSibling;
					
					var requestItem = state.changesMap.get(updatedItemName);
					
					var time = new Date();
					
					if (requestItem === undefined) {
						state.changesMap.set(updatedItemName,
							{
								action: "update",
								oldItemName: updatedItemName.firstElementChild.innerText,
								newItemName: updatedItemName.firstElementChild.innerText,
								oldListName: "",
								newListName: "",
								description: updatedItemCard.querySelector(".description").value,
								oldTags: [],
								newTags: [newTagName.innerText],
								modified: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
							});
					}
					else {
						var oldTags = requestItem.oldTags;
						var found = false;
						for (var i = 0; i < oldTags.length; ++i) {
							if (oldTags[i] === newTagName.innerText) {
								found = true;
								oldTags.splice(i, 1);
							}
						}
						if (!found) {
							console.log("create tag - not found - tagName = " + newTagName.innerText);
							requestItem.newTags.push(newTagName.innerText);
						}
					}
					
//					console.log("reguestQueue:");
//					console.log("action = " + state.changesMap.get(updatedItemName).action);
//					console.log("oldItemName = " + state.changesMap.get(updatedItemName).oldItemName);
//					console.log("newItemName = " + state.changesMap.get(updatedItemName).newItemName);
//					console.log("oldListName = " + state.changesMap.get(updatedItemName).oldListName);
//					console.log("newListName = " + state.changesMap.get(updatedItemName).newListName);
//					console.log("description = " + state.changesMap.get(updatedItemName).description);
//					console.log("oldTags = " + state.changesMap.get(updatedItemName).oldTags);
//					console.log("newTags = " + state.changesMap.get(updatedItemName).newTags);
//					console.log("modified = " + state.changesMap.get(updatedItemName).modified);
					
					state.itemNamesMap.get(updatedItemName.firstElementChild.innerText)[0].add(newTagName.innerText);
//					console.log(state.itemNamesMap);
				}
				
				if (existingItemTagMinuses.length !== 0 && existingItemTagMinuses[0].classList.contains("displayNone") || existingItemTagMinuses.length === 0) {
					newTagMinus.classList.add("displayNone");
				}
				newTagMinus.addEventListener("click", deleteTag);
				newTagMinus.innerText = "-";
				newTag.appendChild(newTagName);
				newTag.appendChild(newTagMinus);
				event.target.parentElement.appendChild(newTag);
				event.target.value = "";
			}
			event.stopPropagation();
		}
		
		var tagsPluses = state.main.getElementsByClassName("inputTag");
		registerHandlers(tagsPluses, "blur", newTag);
		return newTag;
	})();

	
	
	/******************** U P D A T E   I T E M   -   N A M E ********************/
	var clickAndBlurItemNameElement = (function() {
		var oldItemName = "";
			
		function clickItemNameElement(event) {
//			console.log("clickItemNameElement");
			event.target.setAttribute("contentEditable", "true");
			oldItemName = event.target.innerText;
			event.target.focus();
			event.stopPropagation();
		}
		
		function blurClickItemNameElement(event) {
//			console.log("blurClickItemNameElement");
//			console.log("event.target.innerText.length = " + event.target.innerText.length);
			if (event.target.innerText !== "" && event.target.innerText.length < 61 && !state.itemNamesMap.has(event.target.innerText)) {
				if (oldItemName !== "" && event.target.innerText !== oldItemName) {
					var requestItem = state.changesMap.get(event.target.parentElement);
					if (requestItem === undefined) {
						var time = new Date();
						state.changesMap.set(event.target.parentElement,
							{
								action: "update",
								oldItemName: oldItemName,
								newItemName: event.target.innerText,
								oldListName: "",
								newListName: "",
								description: event.target.parentElement.nextElementSibling.querySelector(".description").value,
								newTags: [],
								oldTags: [],
								modified: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
							});
					}
					else { // either created already or already updated
//						if (requestItem.action === "updated") {
//							requestItem.oldItemName = requestItem.newItemName;
//						}
						requestItem.newItemName = event.target.innerText;
					}
					
//					console.log("reguestQueue:");
//					console.log("action = " + state.changesMap.get(event.target.parentElement).action);
//					console.log("oldItemName = " + state.changesMap.get(event.target.parentElement).oldItemName);
//					console.log("newItemName = " + state.changesMap.get(event.target.parentElement).newItemName);
//					console.log("oldListName = " + state.changesMap.get(event.target.parentElement).oldListName);
//					console.log("newListName = " + state.changesMap.get(event.target.parentElement).newListName);
//					console.log("description = " + state.changesMap.get(event.target.parentElement).description);
//					console.log("oldTags = " + state.changesMap.get(event.target.parentElement).oldTags);
//					console.log("newTags = " + state.changesMap.get(event.target.parentElement).newTags);
//					console.log("modified = " + state.changesMap.get(event.target.parentElement).modified);
					
					state.itemNamesMap.set(event.target.innerText, state.itemNamesMap.get(oldItemName));
					state.itemNamesMap.delete(oldItemName);
//					console.log(state.itemNamesMap);
				}
			}
			else {
				event.target.innerText = oldItemName;
			}
			
			
			event.target.setAttribute("contentEditable", "false");
			event.stopPropagation();
		}
		
		var itemNameElements = state.main.getElementsByClassName("itemNameElement");
		
		for (var i = 0; i < itemNameElements.length; ++i) {
			itemNameElements[i].addEventListener("click", clickItemNameElement, false);
			itemNameElements[i].addEventListener("focusout", blurClickItemNameElement, false);
		}
		
		return [clickItemNameElement, blurClickItemNameElement];
	})();
	
	
	
	/******************** U P D A T E   I T E M   -   L I S T ********************/
	var clickAndBlurItemList = (function() {
		var oldListName = "";
		
		function clickListName(event) {
//			console.log("click list name");
			oldListName = event.target.innerText;
			var listInput = event.target.previousElementSibling;
			listInput.classList.remove("displayNone");
			listInput.value = oldListName;
			event.target.innerText = "";
			event.target.classList.add("displayNone");
			listInput.focus();
			event.stopPropagation();
		}
		
		function clickListInput(event) {
//			console.log("click list input");
			oldListName = event.target.value;
			event.stopPropagation();
		}
		
		function blurListInput(event) {
//			console.log("blur list input");
//			console.log("event.target.value = " + event.target.value);
//			console.log("oldListName = " + oldListName);
			
			if (event.target.value !== oldListName) {
//				console.log("newListName differs from oldListName");
				var itemName = event.target.parentElement.parentElement.parentElement.previousElementSibling;
				var requestItem = state.changesMap.get(itemName);
				var originalListName = state.itemNamesMap.get(itemName.firstElementChild.innerText)[1];
				
				if (requestItem === undefined) {
//					console.log("requestItem undefined");
					var time = new Date();
					state.changesMap.set(itemName,
						{
							action: "update",
							oldItemName: itemName.firstElementChild.innerText,
							newItemName: "",
							oldListName: originalListName,
							newListName: event.target.value,
							description: "",
							newTags: [],
							oldTags: [],
							modified: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
						});
				}
				else {
//					console.log("requestItem already defined");
//					console.log("originalListName = " + originalListName);
					
					if (event.target.value === originalListName) {
						requestItem.oldListName = ""; // not removing it from existing list
						requestItem.newListName = ""; // not adding it to new list
					}
					else {
						requestItem.oldListName = originalListName;
						requestItem.newListName = event.target.value;
					}
				}
//				console.log("reguestQueue:");
//				console.log("action = " + state.changesMap.get(itemName).action);
//				console.log("oldItemName = " + state.changesMap.get(itemName).oldItemName);
//				console.log("newItemName = " + state.changesMap.get(itemName).newItemName);
//				console.log("oldListName = " + state.changesMap.get(itemName).oldListName);
//				console.log("newListName = " + state.changesMap.get(itemName).newListName);
//				console.log("description = " + state.changesMap.get(itemName).description);
//				console.log("oldTags = " + state.changesMap.get(itemName).oldTags);
//				console.log("newTags = " + state.changesMap.get(itemName).newTags);
//				console.log("modified = " + state.changesMap.get(itemName).modified);
			}
			
//			oldListName = event.target.value;
			
			var listName = event.target.nextElementSibling;
			if (event.target.value !== "") {
				listName.classList.remove("displayNone");
				listName.innerText = event.target.value;
				event.target.value  = "";
				event.target.classList.add("displayNone");
			}

			event.stopPropagation();
		}
		
		var listNameElements = state.main.getElementsByClassName("listName");
		var listInputElements = state.main.getElementsByClassName("listInput");
		
		for (var i = 0; i < listNameElements.length; ++i) {
			if (listNameElements[i].id !== "inputListName") {
				listNameElements[i].addEventListener("click", clickListName);
			}
		}
		
		for (var i = 0; i < listInputElements.length; ++i) {
			if (listInputElements[i].id !== "inputListInput") {
				listInputElements[i].addEventListener("click", clickListInput);
				listInputElements[i].addEventListener("focusout", blurListInput);
			}
		}
		
		return [clickListName, clickListInput, blurListInput];
	})();
	
	
	
	/******************** U P D A T E   I T E M   -   D E S C R I P T I O N ********************/
	
	var blurDescription = (function() {
		function blurDescription(event) {
//			console.log("blurDescription");
//			console.log("description:");
//			console.log(event.target.value);
			
			var itemName = event.target.parentElement.parentElement.previousElementSibling;
			var updatedItem = state.changesMap.get(itemName);
			
			if (updatedItem === undefined) {
				var time = new Date();
				state.changesMap.set(itemName,
					{
						action: "update",
						oldItemName: itemName.firstElementChild.innerText,
						newItemName: "",
						oldListName: "",
						newListName: "",
						description: event.target.value,
						newTags: [],
						oldTags: [],
						modified: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
					});
			}
			else {
				updatedItem.description = event.target.value;
			}
			
//			console.log("reguestQueue:");
//			console.log("action = " + state.changesMap.get(itemName).action);
//			console.log("oldItemName = " + state.changesMap.get(itemName).oldItemName);
//			console.log("newItemName = " + state.changesMap.get(itemName).newItemName);
//			console.log("oldListName = " + state.changesMap.get(itemName).oldListName);
//			console.log("newListName = " + state.changesMap.get(itemName).newListName);
//			console.log("description = " + state.changesMap.get(itemName).description);
//			console.log("oldTags = " + state.changesMap.get(itemName).oldTags);
//			console.log("newTags = " + state.changesMap.get(itemName).newTags);
//			console.log("modified = " + state.changesMap.get(itemName).modified);
		}
		
		var descriptions = document.getElementsByClassName("description");
		for (var i = 0; i < descriptions.length; ++i) {
			if (descriptions[i].id !== "inputDescription") {
				descriptions[i].addEventListener("focusout", blurDescription);
			}
		}
		
		return blurDescription;
	})();

	
	
	/******************** D E L E T E   I T E M ********************/
	var deleteItem = (function() {
		function deleteItem(event) {
			var deletedItem = state.changesMap.get(event.target.parentElement);
			
//			console.log("deletedItem:");
//			console.log(deletedItem);
			
			if (deletedItem === undefined) {
				var time = new Date();
				state.changesMap.set(event.target.parentElement,
					{
						action: "delete",
						oldItemName: event.target.previousElementSibling.innerText,
						newItemName: "",
						oldListName: "",
						newListName: "",
						description: "",
						newTags: [],
						oldTags: [],
						modified: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
					});
				
//				console.log("reguestQueue:");
//				console.log("action = " + state.changesMap.get(event.target.parentElement).action);
//				console.log("oldItemName = " + state.changesMap.get(event.target.parentElement).oldItemName);
			}
			else {
				var previousAction = deletedItem.action;
				var deletedItemName = deletedItem.oldItemName;
				state.changesMap.delete(event.target.parentElement);
				
				if (previousAction === "update") {
					var time = new Date();
					state.changesMap.set(event.target.parentElement,
						{
							action: "delete",
							oldItemName: deletedItemName,
							newItemName: "",
							oldListName: "",
							newListName: "",
							description: "",
							newTags: [],
							oldTags: [],
							modified: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
						});
					
//					console.log("reguestQueue:");
//					console.log("action = " + state.changesMap.get(event.target.parentElement).action);
//					console.log("oldItemName = " + state.changesMap.get(event.target.parentElement).oldItemName);
				}
			}
			
			state.itemNamesMap.delete(event.target.previousElementSibling.innerText);
//			console.log(state.itemNamesMap);
			event.target.parentElement.nextElementSibling.remove();
			event.target.parentElement.remove();
			event.stopPropagation();
		}
		
		var itemMinuses = document.getElementsByClassName("itemMinus");
		registerHandlers(itemMinuses, "click", deleteItem);
		return deleteItem;
	})();


	
	/******************** D E L E T E   T A G ********************/
	var deleteTag = (function() {
		function deleteTag(event) {
			var updatedItemName = event.target.parentElement.parentElement.parentElement.parentElement.previousElementSibling;
			
			if (updatedItemName.id !== "inputItemName") {
				var updatedItemCard = updatedItemName.nextElementSibling;
				var updatedItem = state.changesMap.get(updatedItemName);
				
				if (updatedItem === undefined) {
					var time = new Date();
					state.changesMap.set(updatedItemName,
						{
							action: "update",
							oldItemName: updatedItemName.firstElementChild.innerText,
							newItemName: "",
							oldListName: "",
							newListName: "",
							description: updatedItemCard.querySelector(".description").value,
							newTags: [],
							oldTags: [event.target.previousElementSibling.innerText],
							modified: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
						});
				}
				else {
					var found = false;
					var newTags = updatedItem.newTags;
					for (var i = 0; i < newTags.length; ++i) {
						if (newTags[i] === event.target.previousElementSibling.innerText) {
							found = true;
							newTags.splice(i, 1);
						}
					}
					if (!found) {
						console.log("delete tag - not found - tagName = " + event.target.previousElementSibling.innerText);
						updatedItem.oldTags.push(event.target.previousElementSibling.innerText);
					}
				}
				
//				console.log("reguestQueue:");
//				console.log("action = " + state.changesMap.get(updatedItemName).action);
//				console.log("oldItemName = " + state.changesMap.get(updatedItemName).oldItemName);
//				console.log("newItemName = " + state.changesMap.get(updatedItemName).newItemName);
//				console.log("oldListName = " + state.changesMap.get(updatedItemName).oldListName);
//				console.log("newListName = " + state.changesMap.get(updatedItemName).newListName);
//				console.log("description = " + state.changesMap.get(updatedItemName).description);
//				console.log("oldTags = " + state.changesMap.get(updatedItemName).oldTags);
//				console.log("newTags = " + state.changesMap.get(updatedItemName).newTags);
//				console.log("modified = " + state.changesMap.get(updatedItemName).modified);
				
				state.itemNamesMap.get(updatedItemName.firstElementChild.innerText)[0].delete(event.target.previousElementSibling.innerText);
//				console.log(state.itemNamesMap);
			}
			
			event.target.parentElement.remove();
		}
		
		var tagMinuses = document.getElementsByClassName("tagMinus");
		registerHandlers(tagMinuses, "click", deleteTag);
		return deleteTag;
	})();
})();
	
	
	
	

	

	
/*
ways of associating data with html elements:
- implement own way of associating data to be specific to an element and setting and accessing it properly
- ECMASScript6 WeakMap
- property of the DOM element ("data-" prefix), setAttribute and getAttribute, HTMLOrForeignElement.dataset
- jQuery .data
 */
	
//	function save1(event) {
//		var formData = new FormData();
////		var entries = formData.entries();
//		const headers = new Headers({ 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8' });
//		headers.append(document.getElementById("_csrf_header").content, document.getElementById("_csrf").content);
//		
//		function appendToRequest(value, key, map) {
////			formData['_csrf'] = document.getElementById("_csrf").content;
//			formData.append("name", key.innerText);
//			formData.append("type", value);
//			
//			
////			console.log(entries.next().value);
////			console.log(entries.next().value);
////			console.log(entries.next().value);
////			fetch('https://localhost:8443/SpringMVCExperiment/update', { method: 'POST', 'Content-type': 'multipart/form-data', body: formData });
//		}
//		
////		state.changesMap.forEach(appendToRequest);
//		
//		formData.append("updateItems[0].oldName", "jasonbourne");
//		formData.append("updateItems[0].type", "create");
//		formData.append("updateItems[1].oldName", "batman");
//		formData.append("updateItems[1].type", "delete");
//		formData.append("updateItems[0].description", "bournedescription. yeah!");
//		formData.append("updateItems[1].description", "batmandescription. yeah?");
//
//		// BEGIN ADDED
//		formData.append("updateItems[0].modified", "7-16-20");
//		formData.append("updateItems[0].newName", "Harry Potter");
//		formData.append("updateItems[0].oldList", "oldListName");
//		formData.append("updateItems[0].newList", "newListName");
//		formData.append("updateItems[0].removedTags", "oldTag1,oldTag2,oldTag3");
//		formData.append("updateItems[0].addedTags", "newTag1,newTag2,newTag3");
//		// END ADDED
//		
//		
//		const data = new URLSearchParams(formData);
//		
//		fetch('https://localhost:8443/SpringMVCExperiment/updateItem', { method: 'POST', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', headers:  headers, body: data });
//		
//		 //traverse list of saved items, calling fetch for all of them
//		 //traverse list of deleted item, calling fetch for all of them
//		 //for any errors, handle them (if needed) immediately upon the return of the fetch
//		 //prevent default save action
//	}
	
//	function submit(event) {
//		if (event.ctrlKey && event.key === 's') {
//			save1(); // pass in reference to the item
//			event.preventDefault();
//		}
//	}
	
	//// TEST3 - MULTIPART FORM DATA
	//
	//const formData2 = new FormData(document.getElementById('FORM7'));
	//formData2['_csrf'] = csrfInput.value;
	//
	//fetch('https://localhost:8443/SpringMVCExperiment/update', { method: 'POST', 'Content-Type': 'multipart/form-data', body: formData2 })
	////.then(response => response ? console.log("json response2: " + response.json()) : 'null response')
	//.then(response => console.log('success2: ' + response))
	//.catch(response => console.log('failure2: ' + response));

//	function updateItem(item) {
//		const csrfHeader = document.getElementById("_csrf_header");
//		const csrf = document.getElementById("_csrf");
//		const itemName = document.getElementById("itemName").innerText;
//		const itemDescription = document.getElementById("description").value;
//		const created = document.getElementById("created").innerText;
//		const modified = document.getElementById("modified").innerText;
//		const list = document.getElementById("inputListName");
//		const itemList = list.value;
//		var tagsElement = document.getElementById("tags");
//		var tags = "";
//		for (var i = 0; i < tagsElement.children.length; ++i) {
//			tags += tagsElement.children[i].innerText + ",";
//		}
//		tags = tags.substring(0,tags.length - 1);
//	
//		const formData = new FormData(document.getElementById('FORM7'));
//		
//		formData.append("description", itemDescription); console.log(itemDescription);
//		formData.append("name", itemName); console.log(itemName);
//		formData.append("created", created); console.log(created)
//		formData.append("modified", modified); console.log(modified);
//		formData.append("list", itemList); console.log(itemList);
//		formData.append("tags",tags); console.log(tags);
//		
//		const data = new URLSearchParams(formData);
//		const headers = new Headers({ 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8' });
//		headers.append(csrfHeader.content, csrf.content);
//		
//		fetch('https://localhost:8443/SpringMVCExperiment/newItem', { method: 'POST', 'Content-Type': 'application/x-www-form-urlencoded', body: data,
//			headers:  headers })
//		//.then(response => response ? console.log("json response1: " + response.json()) : 'null response')
//		.then(response => console.log('success1: ' + response))
//		.catch(response => console.log('failure1: ' + response));
//	}
	
//	function newItem () {
//		const csrfHeader = document.getElementById("_csrf_header");
//		const csrf = document.getElementById("_csrf");
//		const itemName = document.getElementById("itemName").innerText;
//		const itemDescription = document.getElementById("description").value;
//		const created = document.getElementById("created").innerText;
//		const modified = document.getElementById("modified").innerText;
//		const list = document.getElementById("inputListName");
//		const itemList = list.value;
//		var tagsElement = document.getElementById("tags");
//		var tags = "";
//		for (var i = 0; i < tagsElement.children.length; ++i) {
//			tags += tagsElement.children[i].innerText + ",";
//		}
//		tags = tags.substring(0,tags.length - 1);
//	
//		const formData = new FormData(document.getElementById('FORM7'));
//		
//		formData.append("description", itemDescription); console.log(itemDescription);
//		formData.append("name", itemName); console.log(itemName);
//		formData.append("created", created); console.log(created)
//		formData.append("modified", modified); console.log(modified);
//		formData.append("list", itemList); console.log(itemList);
//		formData.append("tags",tags); console.log(tags);
//		
//		const data = new URLSearchParams(formData);
//		const headers = new Headers({ 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8' });
//		headers.append(csrfHeader.content, csrf.content);
//		
//		fetch('https://localhost:8443/SpringMVCExperiment/newItem', { method: 'POST', 'Content-Type': 'application/x-www-form-urlencoded', body: data,
//			headers:  headers })
//		//.then(response => response ? console.log("json response1: " + response.json()) : 'null response')
//		.then(response => console.log('success1: ' + response))
//		.catch(response => console.log('failure1: ' + response));
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//	console.log("BEGIN - FETCHING");
	//	console.log("END - FETCHING");
	
		//// TEST3 - MULTIPART FORM DATA
		//
		//const formData2 = new FormData(document.getElementById('FORM7'));
		//formData2['_csrf'] = csrfInput.value;
		//
		//fetch('https://localhost:8443/SpringMVCExperiment/update', { method: 'POST', 'Content-Type': 'multipart/form-data', body: formData2 })
		////.then(response => response ? console.log("json response2: " + response.json()) : 'null response')
		//.then(response => console.log('success2: ' + response))
		//.catch(response => console.log('failure2: ' + response));
	
		//TEST2 - JSON DATA
	
		//const data3 = { attribute1: 'value1', attribute2: 'value2', attribute3: 'value3', '_csrf': csrfInput.value };
		//const csrfHeader = document.getElementById("_csrf_header");
		//const csrf = document.getElementById("_csrf");
		//const headers3 = new Headers({ 'Content-Type': 'application/json'});
		//console.log(csrfHeader.content);
		//console.log(csrf.content);
		//headers3.append(csrfHeader.content, csrf.content);
		//console.log(headers3);
		//
		//fetch('https://localhost:8443/SpringMVCExperiment/update', { method: 'POST', body: JSON.stringify(data3),
	//																 headers: headers3 })
		////.then(response => response ? console.log("json response3: " + response.json()) : 'null response')
		//.then(response => console.log('success3: ' + response))
		//.catch(response => console.log('failure3: ' + response));
	
		/*
		 * EXAMPLE CSRF
		 https://stackoverflow.com/questions/27834867/spring-security-csrf-token-not-working-with-ajax
		console.log("JS SCRIPT BEGIN");
		fetch('https://localhost:8443/SpringMVCExperiment/update', { method: 'POST' })
		.then(response => console.log('success: ' + response))
		.catch(response => console.log('failure: ' + response));
		console.log("JS SCRIPT END");
		*/
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	}
	
