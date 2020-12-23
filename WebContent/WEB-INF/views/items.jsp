<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" session="true"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
	<head>
		<title>Items</title>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<meta id="_csrf" name="_csrf" content="${_csrf.token}"/>
    	<meta id="_csrf_header" name="_csrf_header" content="${_csrf.headerName}"/>
    	<link rel="stylesheet" type="text/css" href="<c:url value="/resources/css/experiment.css" />" />
		<link rel="icon" type="image/x-icon" href="<c:url value="/resources/images/favicon.ico" />" />
	</head>
	<body>
		<div id="body">
			<div id="leftSidebar">
				<span id="pageLabel">ITEMS</span>
				<a id="seeSettings" class="block">Settings</a>
				<form method="post" action="<c:url value="/logout" />">
					<input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />
<!-- 					<a id="logoutLink" onclick="this.parentNode.submit();">Logout</a> -->
					<a id="logoutLink">Logout</a>
				</form>
			</div>
			<div id="main">
				<div id="itemsPlusAndMinus"><span class="itemsPlus">+</span><span id="itemsMinus">-</span></div>
				<%@include file="/WEB-INF/views/inputItem.jsp" %>
				<c:forEach var="item" items="${items}">
					<div class="itemName">
						<span class="itemNameElement" contentEditable="false" maxlength="60" spellcheck="false"><c:out value="${item.name}"/></span>
						<span class="itemMinus displayNone">-</span>
					</div>
					<div class="itemCard displayNone">
						<div class="itemCardLeft">
							<label class="block italic inputList">List:
							<c:if test="${empty item.list}">
								<input class="listInput" list="listOptions" maxlength="60"/>
								<span class="listName displayNone nonItalic"><c:out value="${item.list}"/></span>
							</c:if>
							<c:if test="${not empty item.list}">
								<input class="listInput displayNone" list="listOptions" maxlength="60"/>
								<span class="listName nonItalic"><c:out value="${item.list}"/></span>
							</c:if>
							</label>
							<br/>
							<div class="dates">
								<label class="created italic block">Created: <span class="nonItalic"><c:out value="${item.created}"/></span></label>
								<label class="modified italic block">Modified: <span class="nonItalic"><c:out value="${item.modified}"/></span></label>
							</div>
						</div>
						<div class="itemCardCenter">
							<textarea class="description" maxlength="500" placeholder="Description:" rows="5" cols="50" spellcheck="false"><c:out value="${item.description}"/></textarea>
						</div>
						<div class="itemCardRight">
							<div class="tagsPlusAndMinus"><span class="tagsPlus">+</span><span class="tagsMinus">-</span></div>
							<div class="tags">
								<c:if test="${fn:length(item.tags) > 0 }">
									<div class="italic">Tags:</div>
									<input class="inputTag displayNone" list="tagOptions" placeholder="Tag:" maxlength="60"/>
								</c:if>
								<c:if test="${!(fn:length(item.tags) > 0)}">
									<div class="italic displayNone">Tags:</div>
									<input class="inputTag" list="tagOptions" placeholder="Tag:" maxlength="60"/>
								</c:if>
								<c:forEach var="tag" items="${item.tags}">
									<div class="tag"><span class="tagName"><c:out value="${tag}"/></span><span class="tagMinus displayNone">-</span></div>
								</c:forEach>
							</div>
						</div>
						<div class="clearBoth"></div>
					</div>
				</c:forEach>
				<datalist id="listOptions">
					<c:forEach var="listName" items="${listNames}">
						<option value="${listName}">${listName}</option>
					</c:forEach>
				</datalist>
				<datalist id="tagOptions">
					<c:forEach var="tagName" items="${tagNames}">
						<option value="${tagName}">${tagName}</option>
					</c:forEach>
				</datalist>
			</div>
			<div id="rightSidebar">
				<div id="filter">
					<label for="filterSearch">Filter: </label>
					<input id="filterSearch" type="search" class="fullMaxWidth"/>
				</div>
				<div id="orderBy">
					<label for="orderSelect">Order By: </label>
					<select id="orderSelect" class="fullMaxWidth">
						<option value="itemName">Name</option>
						<option value="created">Created</option>
						<option value="modified">Modified</option>
						<option value="listName">List Name</option>
					</select>
				</div>
				<div id="expandCollapseAll">Expand/Collapse All</div>
			</div>
		</div>
		<div id="loading" class="displayNone fadeIn fadeOut">
			<c:out value="Loading"/>
		</div>
		<script src="<c:url value="/resources/js/state.js"/>"></script>
		<script src="<c:url value="/resources/js/registerer.js"/>"></script>
		<script src="<c:url value="/resources/js/displayHandlers.js"/>"></script>
		<script src="<c:url value="/resources/js/handlers.js"/>"></script>
		<script src="<c:url value="/resources/js/saver.js"/>"></script>
		<script src="<c:url value="/resources/js/display.js"/>"></script>
		<form id="logoutForm" method="post" class="displayNone" action="<c:url value="/logoutSave" />">
			<input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />
		</form>
	</body>
</html>