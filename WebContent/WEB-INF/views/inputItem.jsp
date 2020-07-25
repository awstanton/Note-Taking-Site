<html>
<!-- only differences between inputItem and regular items:
- inputItem name has id inputItemName while regular has no id
- inputItem name element has id inputItemNameElement while regular has no id
- inputItem has no item minus while regular does
- inputItem card has id inputItemCard while regular does not -->
	<body>
		<div id="inputItemName" class="displayNone">
<!-- 			<input id="inputItemNameElement" type="text" placeholder="Name:"/> -->
			<span id="inputItemNameElement" class="itemNameElement" maxlength="60" contentEditable="true" spellcheck="false"></span>
		</div>
		<div id="inputItemCard" class="itemCard displayNone">
			<div class="itemCardLeft">
				<label class="block italic inputList">List:
					<input id="inputListInput" class="listInput" list="listOptions" maxlength="60"/>
					<span id="inputListName" class="listName displayNone nonItalic">${item.list}</span>
				</label>
				<br/>
				<div class="dates">
					<label class="created italic block">Created: <span class="nonItalic"></span></label>
					<label class="modified italic block">Modified: <span class="nonItalic"></span></label>
				</div>
			</div>
			<div class="itemCardCenter">
				<textarea id="inputDescription" class="description" maxlength="500" placeholder="Description:" rows="5" cols="50" spellcheck="false"></textarea>
			</div>
			<div class="itemCardRight">
				<div class="tagsPlusAndMinus"><span class="tagsPlus">+</span><span class="tagsMinus">-</span></div>
				<div class="tags">
					<div class="italic">Tags:</div>
					<input class="inputTag" list="tagOptions" placeholder="Tag:" maxlength="30"/>
				</div>
			</div>
			<div class="clearBoth"></div>
		</div>
	</body>
</html>