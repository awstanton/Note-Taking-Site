package com.springexperiment.dao;

import java.util.List;

import javax.sql.DataSource;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
//import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.springexperiment.controller.ExperimentController;
import com.springexperiment.model.Item;
import com.springexperiment.model.UpdateItem;

public class ExperimentDao {
	private static final Logger logger = LogManager.getLogger(ExperimentController.class);
	private PasswordEncoder passwordEncoder;
	private JdbcTemplate jdbcTemplate;
	
	public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
		this.passwordEncoder = passwordEncoder;
	}
	public void setDataSource(DataSource dataSource) {
		this.jdbcTemplate = new JdbcTemplate(dataSource);
	}
	
	private enum Queries {
		insertUsers("INSERT INTO users VALUES(NULL,?,?,?)"),
		insertAuthorities("INSERT INTO authorities VALUES(?,?)"),
		insertItems("INSERT INTO items VALUES(NULL,?,?,?,?,?)"),
		insertTags("INSERT INTO tags VALUES(NULL,?,?)"),
		insertItemTags("INSERT INTO itemtags VALUES(?,?)"),
		insertLists("INSERT INTO lists VALUES(NULL,?,?,?,?,?)"),
		insertListItems("INSERT INTO listitems VALUES(?,?)"),
		getUserIdByUsername("SELECT id FROM users WHERE username = ?"),
		getItemIdByNameAndUserId("SELECT id FROM items WHERE name = ? AND userid = ?"),
		getItemsByUserId("SELECT * FROM items WHERE userid = ? ORDER BY name"),
		getTagNamesByItemId("SELECT T.name FROM tags T, itemtags IT WHERE T.id = IT.tagid AND IT.itemid = ? ORDER BY T.name"),
		getTagNamesByUserId("SELECT name FROM tags WHERE userid = ? ORDER BY name"),
		getTagIdByNameAndUserId("SELECT id FROM tags WHERE name = ? AND userid = ?"),
		getTagIdByItemId("SELECT tagid FROM itemtags WHERE itemid = ?"),
		getItemTagCountByTagId("SELECT COUNT(*) FROM itemtags WHERE tagid = ?"),
		getListIdByNameAndUserId("SELECT id FROM lists WHERE name = ? AND userid = ?"),
		getListNamesByItemId("SELECT L.name FROM lists L, listitems LI WHERE L.id = LI.listid AND LI.itemid = ?"),
		getListNameByUserId("SELECT name FROM lists WHERE userid = ? ORDER BY name"),
		getListCountByNameAndUserId("SELECT COUNT(*) FROM lists WHERE name = ? AND userid = ?"),
		getListItemCountByListId("SELECT COUNT(*) FROM listitems WHERE listid = ?"),
		updateItemDescriptionByIdAndUserId("UPDATE items SET description = ? WHERE id = ? AND userid = ?"),
		updateItemNameByIdAndUserId("UPDATE items SET name = ? WHERE id = ? AND userid = ?"),
		updateItemModifiedByIdAndUserId("UPDATE items SET modified = ? WHERE id = ? AND userid = ?"),
		deleteItemsById("DELETE FROM items WHERE id = ?"),
		deleteTagById("DELETE FROM tags WHERE id = ?"),
		deleteItemTagsByItemId("DELETE FROM itemtags WHERE itemid = ?"),
		deleteItemTagsByItemIdAndTagId("DELETE FROM itemtags WHERE itemid = ? AND tagid = ?"),
		deleteListById("DELETE FROM lists WHERE id = ?"),
		deleteListItemsByItemIdAndListId("DELETE FROM listitems WHERE itemid = ? AND listid = ?");
		
		private String query;
		private Queries(String query) {
			this.query = query;
		}
		public String getQuery() {
			return query;
		}
	}
	
	public String signUp(String username, String password) {
		logger.debug("saving new user");
		try {
			jdbcTemplate.queryForObject(Queries.getUserIdByUsername.getQuery(), Integer.class, username);
		}
		catch(EmptyResultDataAccessException erdae) {
			String encodedPassword = passwordEncoder.encode(password);
			jdbcTemplate.update(Queries.insertUsers.getQuery(), username, encodedPassword, true);
			jdbcTemplate.update(Queries.insertAuthorities.getQuery(), username, "ROLE_USER");
			return "";
		}
		return "duplicate username";
	}
	
	public List<Item> loadUserItems(String username) {
		logger.debug("getting user items");
		Integer userid = jdbcTemplate.queryForObject(Queries.getUserIdByUsername.getQuery(), Integer.class, username);
		
		List<Item> items = jdbcTemplate.query(Queries.getItemsByUserId.getQuery(), new Integer[] {userid}, (resultSet, rowNum) -> {
			return new Item(resultSet.getInt(1), resultSet.getInt(2), resultSet.getString(3), resultSet.getString(4), resultSet.getString(5), resultSet.getString(6));
  		});

		for (Item item : items) {
			item.setTags(jdbcTemplate.queryForList(Queries.getTagNamesByItemId.getQuery(), String.class, item.getId()));
			try {
				item.setList(jdbcTemplate.queryForObject(Queries.getListNamesByItemId.getQuery(), String.class, item.getId()));
			}
			catch(EmptyResultDataAccessException dae) {
				item.setList("");
			}
		}
		
		return items;
	}
	
	public List<String> loadUserListNames(String username) {
		logger.debug("getting list names");
		Integer userid = jdbcTemplate.queryForObject(Queries.getUserIdByUsername.getQuery(), Integer.class, username);
		return jdbcTemplate.queryForList(Queries.getListNameByUserId.getQuery(), String.class, userid);
	}
	
	public List<String> loadUserTagNames(String username) {
		logger.debug("getting tag names");
		Integer userid = jdbcTemplate.queryForObject(Queries.getUserIdByUsername.getQuery(), Integer.class, username);
		return jdbcTemplate.queryForList(Queries.getTagNamesByUserId.getQuery(), String.class, userid);
	}
	
	public void createItem(String username, UpdateItem item) {
		logger.debug("saving item");
//		System.out.println("in createItem");
//		System.out.println("username = " + username);
//		System.out.println("item = " + item);
		Integer userid = jdbcTemplate.queryForObject(Queries.getUserIdByUsername.getQuery(), Integer.class, username);
		
		jdbcTemplate.update(Queries.insertItems.getQuery(), userid, item.getNewName(), item.getDescription(), item.getModified(), item.getModified());
		
		Integer itemid = jdbcTemplate.queryForObject(Queries.getItemIdByNameAndUserId.getQuery(), Integer.class, item.getNewName(), userid);
		
		if (item.getNewList() != "") {
			Integer listid = -1;
			try {
				listid = jdbcTemplate.queryForObject(Queries.getListIdByNameAndUserId.getQuery(), Integer.class, item.getNewList(), userid);
			}
			catch(EmptyResultDataAccessException e) {
				jdbcTemplate.update(Queries.insertLists.getQuery(), userid, item.getNewList(), "", item.getModified(), item.getModified());
				listid = jdbcTemplate.queryForObject(Queries.getListIdByNameAndUserId.getQuery(), Integer.class, item.getNewList(), userid);
			}
			finally {
				jdbcTemplate.update(Queries.insertListItems.getQuery(), listid, itemid);
			}
		}
//		System.out.println("adding tags to item");
		for (String tagName : item.getAddedTags()) {
			Integer tagid = -1;
			try {
				tagid = jdbcTemplate.queryForObject(Queries.getTagIdByNameAndUserId.getQuery(), Integer.class, tagName, userid);
			}
			catch(EmptyResultDataAccessException e) {
				jdbcTemplate.update(Queries.insertTags.getQuery(), userid, tagName);
				tagid = jdbcTemplate.queryForObject(Queries.getTagIdByNameAndUserId.getQuery(), Integer.class, tagName, userid);
			}
			finally {
//				System.out.println("in finally");
//				System.out.println("tagid = " + tagid);
//				System.out.println("itemid = " + itemid);
				jdbcTemplate.update(Queries.insertItemTags.getQuery(), itemid, tagid);
			}
		}
	}
	
	public void updateItem(String username, UpdateItem item) {
		logger.debug("saving updates");
//		System.out.println("in updateItem");
//		System.out.println("username = " + username);
//		System.out.println("item = " + item);
//		System.out.println("newlist = " + item.getNewList());
//		System.out.println("oldlist = " + item.getOldList());
		
		Integer userid = jdbcTemplate.queryForObject(Queries.getUserIdByUsername.getQuery(), Integer.class, username);
		Integer itemid = jdbcTemplate.queryForObject(Queries.getItemIdByNameAndUserId.getQuery(), Integer.class, item.getOldName(), userid);
//		System.out.println("itemid = " + itemid);
		
		if (item.getNewName() != "") {
			jdbcTemplate.update(Queries.updateItemNameByIdAndUserId.getQuery(), item.getNewName(), itemid, userid);
		}
		if (item.getOldList() != "") {
//			System.out.println("updating oldList");
			Integer listid = jdbcTemplate.queryForObject(Queries.getListIdByNameAndUserId.getQuery(), Integer.class, item.getOldList(), userid);
			jdbcTemplate.update(Queries.deleteListItemsByItemIdAndListId.getQuery(), itemid, listid);
			if (jdbcTemplate.queryForObject(Queries.getListItemCountByListId.getQuery(), Integer.class, listid).equals(0)) {
				jdbcTemplate.update(Queries.deleteListById.getQuery(), listid);
			}
		}
		if (item.getNewList() != "") {
//			System.out.println("updating newList");
			if (jdbcTemplate.queryForObject(Queries.getListCountByNameAndUserId.getQuery(), Integer.class, item.getNewList(), userid).equals(0)) {
//				System.out.println("inserting into lists");
				jdbcTemplate.update(Queries.insertLists.getQuery(), userid, item.getNewList(), "", item.getModified(), item.getModified());
			}
//			System.out.println("newlist = " + item.getNewList());
//			System.out.println("userid = " + userid);
//			System.out.println(jdbcTemplate.queryForObject("SELECT id FROM Lists WHERE name = ? AND userid = ?", new Object[] {item.getNewList(), userid}, Integer.class));
			Integer listid = jdbcTemplate.queryForObject(Queries.getListIdByNameAndUserId.getQuery(), Integer.class, item.getNewList(), userid);
			jdbcTemplate.update(Queries.insertListItems.getQuery(), listid, itemid);
			
		}
		if (item.getDescription() != "") {
//			System.out.println("updating description");
			jdbcTemplate.update(Queries.updateItemDescriptionByIdAndUserId.getQuery(), item.getDescription(), itemid, userid);
		}
		if (!item.getAddedTags().isEmpty()) {
//			System.out.println("adding tags to item");
			for (String tagName : item.getAddedTags()) {
//				System.out.println("tagName = " + tagName);
				Integer tagid = -1;
				try {
//					System.out.println("in try");
					tagid = jdbcTemplate.queryForObject(Queries.getTagIdByNameAndUserId.getQuery(), Integer.class, tagName, userid);
				}
				catch(EmptyResultDataAccessException e) {
//					System.out.println("class = " + e.getClass());
//					System.out.println("in catch");
					jdbcTemplate.update(Queries.insertTags.getQuery(), userid, tagName);
					tagid = jdbcTemplate.queryForObject(Queries.getTagIdByNameAndUserId.getQuery(), Integer.class, tagName, userid);
				}
				finally {
//					System.out.println("in finally");
//					System.out.println("tagid = " + tagid);
//					System.out.println("itemid = " + itemid);
					jdbcTemplate.update(Queries.insertItemTags.getQuery(), itemid, tagid);
				}
			}
		}
		if (!item.getRemovedTags().isEmpty()) {
//			System.out.println("removing tags from item");
			for (String tagName : item.getRemovedTags()) {
				Integer tagid = -1;
				tagid = jdbcTemplate.queryForObject(Queries.getTagIdByNameAndUserId.getQuery(), Integer.class, tagName, userid);
				jdbcTemplate.update(Queries.deleteItemTagsByItemIdAndTagId.getQuery(), itemid, tagid);
				if (jdbcTemplate.queryForObject(Queries.getItemTagCountByTagId.getQuery(), Integer.class, tagid).equals(0)) {
					jdbcTemplate.update(Queries.deleteTagById.getQuery(), tagid);
				}
			}
		}
		
		jdbcTemplate.update(Queries.updateItemModifiedByIdAndUserId.getQuery(), item.getModified(), itemid, userid);
	}
	
	public void deleteItem(String username, UpdateItem item) {
		logger.debug("removing item");
		Integer userid = jdbcTemplate.queryForObject(Queries.getUserIdByUsername.getQuery(), Integer.class, username);
		Integer itemid = jdbcTemplate.queryForObject(Queries.getItemIdByNameAndUserId.getQuery(), Integer.class, item.getOldName(), userid);
		
		List<Integer> tagids = jdbcTemplate.queryForList(Queries.getTagIdByItemId.getQuery(), Integer.class, itemid);
		
		jdbcTemplate.update(Queries.deleteItemTagsByItemId.getQuery(), itemid);
		
		for (Integer tagid : tagids) {
			if (jdbcTemplate.queryForObject(Queries.getItemTagCountByTagId.getQuery(), Integer.class, tagid).equals(0)) {
				jdbcTemplate.update(Queries.deleteTagById.getQuery(), tagid);
			}
		}
		
		if (item.getOldList() != "") {
			Integer listid = jdbcTemplate.queryForObject(Queries.getListIdByNameAndUserId.getQuery(), Integer.class, item.getOldList(), userid);
			jdbcTemplate.update(Queries.deleteListItemsByItemIdAndListId.getQuery(), itemid, listid);
			if (jdbcTemplate.queryForObject(Queries.getListItemCountByListId.getQuery(), Integer.class, listid).equals(0)) {
				jdbcTemplate.update(Queries.deleteListById.getQuery(), listid);
			}
		}
		
		jdbcTemplate.update(Queries.deleteItemsById.getQuery(), itemid);
	}
	
}
