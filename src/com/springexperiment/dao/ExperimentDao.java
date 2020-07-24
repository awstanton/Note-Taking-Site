package com.springexperiment.dao;

import java.util.List;

import javax.sql.DataSource;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.springexperiment.model.Item;
import com.springexperiment.model.UpdateItem;

public class ExperimentDao {
	private PasswordEncoder passwordEncoder;
	
	public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
		this.passwordEncoder = passwordEncoder;
	}
	
	private enum TableNames {
		
	}
	
	private enum Query {
		getName("SELECT name FROM table1 WHERE id = ? AND quantity = ?"),
		getUser("SELECT COUNT(*) FROM Users2 WHERE username = ?");
//		getUserInfo("SELECT id, username, password FROM Users WHERE username = ?"),
//		getUserItems("SELECT name, description, created, modified FROM Items WHERE userid = ?"),
//		getUserTags("SELECT T.name FROM Tags T, ItemTags IT, Items I WHERE I.id = IT.itemid AND IT.tagid = T.id AND I.userid = ?"),
//		getUserItemTags("SELECT T.name FROM Tags T, ItemTags IT, Items I WHERE I.id = ? AND I.id = IT.itemid AND I.userid = ? AND T.id = IT.tagid"),
//		getUserLists("SELECT name, description, created, modified FROM Lists L WHERE L.userid = ?"),
//		getUserListItems("SELECT I.name FROM Items I, ListItems LI WHERE LI.listId = ? AND I.userid = ? AND I.id = LI.itemid");
		
		private final String query;
		
		Query(String query) {
			this.query = query;
		}
		
		String getQuery() {
			return query;
		}
	}
	
	private JdbcTemplate jdbcTemplate;
	
	public void setDataSource(DataSource dataSource) {
		this.jdbcTemplate = new JdbcTemplate(dataSource);
	}
	
	public void signUp(String username, String password) {
		String encodedPassword = passwordEncoder.encode(password);
//		System.out.println("ZZZ: " + password);
//		System.out.println("ZZZ: " + encodedPassword);
		jdbcTemplate.update("INSERT INTO Users3 VALUES(NULL,?,?,?)", username, encodedPassword, true);
		jdbcTemplate.update("INSERT INTO Authorities3 VALUES(?,'ROLE_USER')", username);
		// insert into Authorities1 also!!!
	}
	
	public List<Item> loadUserItems(String username) {
		int userid = jdbcTemplate.queryForObject("SELECT id FROM Users3 WHERE username = ?",
												 new String[] {username},
												 Integer.class);
		
		List<Item> items = jdbcTemplate.query("SELECT * FROM Items3 WHERE userid = ? ORDER BY name", new Integer[] {userid},
											  (resultSet, rowNum) -> { return new Item(
															 			resultSet.getInt(1),
															 			resultSet.getInt(2),
															 			resultSet.getString(3),
															 			resultSet.getString(4),
															 			resultSet.getString(5),
															 			resultSet.getString(6));
														  			}
		);
		
		for (Item item : items) {
			item.setTags(jdbcTemplate.queryForList("SELECT T.name FROM Tags3 T, ItemTags3 IT WHERE T.id = IT.tagid AND IT.itemid = ? ORDER BY T.name", String.class, item.getId()));
			try {
				item.setList(jdbcTemplate.queryForObject("SELECT L.name FROM Lists3 L, ListItems3 LI WHERE L.id = LI.listid AND LI.itemid = ?", new Integer[] {item.getId()}, String.class));
			} catch(EmptyResultDataAccessException dae) {
				item.setList("");
			}
		}
		
		return items;
	}
	public List<String> loadUserListNames(String username) {
		int userid = jdbcTemplate.queryForObject("SELECT id FROM Users3 WHERE username = ?", new String[] {username}, Integer.class);
		return jdbcTemplate.queryForList("SELECT name FROM Lists3 WHERE userid = ? ORDER BY name", String.class, userid);
	}
	public List<String> loadUserTagNames(String username) {
		int userid = jdbcTemplate.queryForObject("SELECT id FROM Users3 WHERE username = ?", new String[] {username}, Integer.class);
		return jdbcTemplate.queryForList("SELECT name FROM Tags3 WHERE userid = ? ORDER BY name", String.class, userid);
	}
	
	
	public int getUserIdByUserName(String username) {
		return jdbcTemplate.queryForObject("SELECT id FROM Users3 WHERE username = ?", new String[] {username}, Integer.class);
	}
	
	public void createItem(String username, UpdateItem item) {
		System.out.println("in createItem");
		System.out.println("username = " + username);
		System.out.println("item = " + item);
		int userid = jdbcTemplate.queryForObject("SELECT id FROM Users3 WHERE username = ?", new String[] {username}, Integer.class);
		
		jdbcTemplate.update("INSERT INTO Items3 VALUES(NULL,?,?,?,?,?)", userid, item.getNewName(), item.getDescription(), item.getModified(),item.getModified());
		
		int itemid = jdbcTemplate.queryForObject("SELECT id FROM Items3 WHERE name = ? AND userid = ?", new Object[] {item.getNewName(), userid}, Integer.class);
		
		if (item.getNewList() != "") {
			int listid = -1;
			try {
				listid = jdbcTemplate.queryForObject("SELECT id FROM Lists3 WHERE name = ? AND userid = ?", new Object[] {item.getNewList(), userid}, Integer.class);
			}
			catch(EmptyResultDataAccessException e) {
				jdbcTemplate.update("INSERT INTO Lists3 VALUES(NULL,?,?,?,?,?)", userid, item.getNewList(), "", item.getModified(), item.getModified());
				listid = jdbcTemplate.queryForObject("SELECT id FROM Lists3 WHERE name = ? AND userid = ?", new Object[] {item.getNewList(), userid}, Integer.class);
			}
			finally {
				jdbcTemplate.update("INSERT INTO ListItems3 VALUES(?,?)", listid, itemid);
			}
		}
		System.out.println("adding tags to item");
		for (String tagName : item.getAddedTags()) {
			int tagid = -1;
			try {
				tagid = jdbcTemplate.queryForObject("SELECT id FROM Tags3 WHERE name = ? AND userid = ?", new Object[] {tagName, userid}, Integer.class);
			}
			catch(EmptyResultDataAccessException e) {
				jdbcTemplate.update("INSERT INTO Tags3 VALUES(NULL,?,?)", userid, tagName);
				tagid = jdbcTemplate.queryForObject("SELECT id FROM Tags3 WHERE name = ? AND userid = ?", new Object[] {tagName, userid}, Integer.class);
			}
			finally {
				System.out.println("in finally");
				System.out.println("tagid = " + tagid);
				System.out.println("itemid = " + itemid);
				jdbcTemplate.update("INSERT INTO ItemTags3 VALUES(?,?)", itemid, tagid);
			}
		}
	}
	
	public void updateItem(String username, UpdateItem item) {
		System.out.println("in updateItem");
		System.out.println("username = " + username);
		System.out.println("item = " + item);
		System.out.println("newlist = " + item.getNewList());
		System.out.println("oldlist = " + item.getOldList());
		
		
		int userid = jdbcTemplate.queryForObject("SELECT id FROM Users3 WHERE username = ?", new String[] {username}, Integer.class);
		int itemid = jdbcTemplate.queryForObject("SELECT id FROM Items3 WHERE name = ? AND userid = ?", new Object[] {item.getOldName(), userid}, Integer.class);
		System.out.println("itemid = " + itemid);
		
		if (item.getNewName() != "") {
			jdbcTemplate.update("UPDATE Items3 SET name = ? WHERE id = ? AND userid = ?", item.getNewName(), itemid, userid);
		}
		if (item.getOldList() != "") {
			System.out.println("updating oldList");
			int listid = jdbcTemplate.queryForObject("SELECT id FROM Lists3 WHERE name = ? AND userid = ?", new Object[] {item.getOldList(), userid}, Integer.class);
			jdbcTemplate.update("DELETE FROM ListItems3 WHERE itemid = ? AND listid = ?", itemid, listid);
			if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ListItems3 WHERE listid = ?", new Object[] {listid}, Integer.class).equals(0)) {
				jdbcTemplate.update("DELETE FROM Lists3 WHERE id = ?", listid);
			}
		}
		if (item.getNewList() != "") {
			System.out.println("updating newList");
			if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Lists3 WHERE name = ? AND userid = ?", new Object[] {item.getNewList(), userid}, Integer.class).equals(0)) {
				System.out.println("inserting into lists");
				jdbcTemplate.update("INSERT INTO Lists3 VALUES(NULL,?,?,?,?,?)", userid, item.getNewList(), "", item.getModified(), item.getModified());
			}
			System.out.println("newlist = " + item.getNewList());
			System.out.println("userid = " + userid);
			System.out.println(jdbcTemplate.queryForObject("SELECT id FROM Lists3 WHERE name = ? AND userid = ?", new Object[] {item.getNewList(), userid}, Integer.class));
			int listid = jdbcTemplate.queryForObject("SELECT id FROM Lists3 WHERE name = ? AND userid = ?", new Object[] {item.getNewList(), userid}, Integer.class);
			jdbcTemplate.update("INSERT INTO ListItems3 VALUES(?,?)", new Object[] {listid, itemid});
			
		}
		if (item.getDescription() != "") {
			System.out.println("updating description");
			jdbcTemplate.update("UPDATE Items3 SET description = ? WHERE id = ? AND userid = ?", item.getDescription(), itemid, userid);
		}
		if (!item.getAddedTags().isEmpty()) {
			System.out.println("adding tags to item");
			for (String tagName : item.getAddedTags()) {
				System.out.println("tagName = " + tagName);
				int tagid = -1;
				try {
					System.out.println("in try");
					tagid = jdbcTemplate.queryForObject("SELECT id FROM Tags3 WHERE name = ? AND userid = ?", new Object[] {tagName, userid}, Integer.class);
				}
				catch(EmptyResultDataAccessException e) {
					System.out.println("class = " + e.getClass());
					System.out.println("in catch");
					jdbcTemplate.update("INSERT INTO Tags3 VALUES(NULL,?,?)", userid, tagName);
					tagid = jdbcTemplate.queryForObject("SELECT id FROM Tags3 WHERE name = ? AND userid = ?", new Object[] {tagName, userid}, Integer.class);
				}
				finally {
					System.out.println("in finally");
					System.out.println("tagid = " + tagid);
					System.out.println("itemid = " + itemid);
					jdbcTemplate.update("INSERT INTO ItemTags3 VALUES(?,?)", itemid, tagid);
				}
			}
		}
		if (!item.getRemovedTags().isEmpty()) {
			System.out.println("removing tags from item");
			for (String tagName : item.getRemovedTags()) {
				int tagid = -1;
				tagid = jdbcTemplate.queryForObject("SELECT id FROM Tags3 WHERE name = ? AND userid = ?", new Object[] {tagName, userid}, Integer.class);
				jdbcTemplate.update("DELETE FROM ItemTags3 WHERE itemid = ? AND tagid = ?", itemid, tagid);
				if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ItemTags3 WHERE tagid = ?", new Object[] {tagid}, Integer.class).equals(0)) {
					jdbcTemplate.update("DELETE FROM Tags3 WHERE id = ?", tagid);
				}
			}
		}
		
		jdbcTemplate.update("UPDATE Items3 SET modified = ? WHERE id = ? AND userid = ?", item.getModified(), itemid, userid);
	}
	
	public void deleteItem(String username, UpdateItem item) {
		int userid = jdbcTemplate.queryForObject("SELECT id FROM Users3 WHERE username = ?", new String[] {username}, Integer.class);
		int itemid = jdbcTemplate.queryForObject("SELECT id FROM Items3 WHERE name = ? AND userid = ?", new Object[] {item.getOldName(), userid}, Integer.class);
		
		List<Integer> tagids = jdbcTemplate.queryForList("SELECT tagid FROM ItemTags3 WHERE itemid = ?", new Object[] {itemid}, Integer.class);
		
		jdbcTemplate.update("DELETE FROM ItemTags3 WHERE itemid = ?", itemid);
		
		for (Integer tagid : tagids) {
			if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ItemTags3 WHERE tagid = ?", new Object[] {tagid}, Integer.class).equals(0)) {
				jdbcTemplate.update("DELETE FROM Tags3 WHERE id = ?", tagid);
			}
		}
		
		if (item.getOldList() != "") {
			int listid = jdbcTemplate.queryForObject("SELECT id FROM Lists3 WHERE name = ? AND userid = ?", new Object[] {item.getOldList(), userid}, Integer.class);
			jdbcTemplate.update("DELETE FROM ListItems3 WHERE itemid = ? AND listid = ?", itemid, listid);
			if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ListItems3 WHERE listid = ?", new Object[] {listid}, Integer.class).equals(0)) {
				jdbcTemplate.update("DELETE FROM Lists3 WHERE id = ?", listid);
			}
		}
		
		jdbcTemplate.update("DELETE FROM Items3 WHERE id = ?", itemid);
	}
	
	
	// CREATE:
	// check if item name present for that user
	// if item name present, do nothing
	// else
	// for each old tag:
	// 		delete from itemtags, if last one present in itemtags
	// for each new tag:
	// 		check if tag is already in itemTags, if so, then no action, else insert into itemtags, and if not present at all in tags, then insert there
	// for each deleted old tag, if last one in itemtags
	// 		delete from tags too
	// if oldlist, then remove from listitems, if last one present in listitems, then remove from lists
	// if newlist, then add to listitems, if not already present in lists, then add to lists
	// update description
	// update modified
	//
	// UPDATE: same as CREATE except item should be present rather than not present, and need to check whether new item name is already taken or not,
	// 		   and if new item name not already taken, then update it; otherwise, no action
	// DELETE: check if item there, andd if so, delete; otherwise, no action
	// remove tags from itemtags, if any of them are the last in itemtags, then remove from items as well
	// remove list, if any, from listitems, if last one there, then remove from lists as well
	
	
	
	
	
	
////	public String getName() {
////	return jdbcTemplate.queryForObject(Query.getName.getQuery(), String.class, 1, 5);
////}
////
////public String checkUser(String username) {
////	return jdbcTemplate.queryForObject(Query.getUser.getQuery(), String.class, username); // is there way to gracefully handle exception instead of having extra query?
////}
//
//public void addUserItem() {
////	jdbcTemplate.update("INSERT INTO Items3 VALUES(?,'ROLE_USER')", username);
//}
//
//public void updateUserItem() {
//	
//}
//
//public void removeUserItem() {
//	
//}
//	public void testEncode(String password) {
//		System.out.println(passwordEncoder.encode(password));
//	}
}
