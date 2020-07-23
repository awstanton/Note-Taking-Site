package com.springexperiment.model;

import java.util.List;

public class Item {
	
//	public Item(int id, int userid, String name, String description, String created, String modified, String list, List<String> tags) {
//		this.id = id;
//		this.userid = userid;
//		this.name = name;
//		this.description = description;
//		this.created = created;
//		this.modified = modified;
//		this.list= list;
//		this.tags = tags;
//	}
	public Item(int userid) {
		id = -1;
		this.userid = userid;
		name = "";
		description = "";
		created = "";
		modified = "";
	}
	public Item(int id, int userid, String name, String description, String created, String modified) {
		this.id = id;
		this.userid = userid;
		this.name = name;
		this.description = description;
		this.created = created;
		this.modified = modified;
	}
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public int getUserid() {
		return userid;
	}
	public void setUserid(int userid) {
		this.userid = userid;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getCreated() {
		return created;
	}
	public void setCreated(String created) {
		this.created = created;
	}
	public String getModified() {
		return modified;
	}
	public void setModified(String modified) {
		this.modified = modified;
	}
	public String getList() {
		return list;
	}
	public void setList(String list) {
		this.list = list;
	}
	public List<String> getTags() {
		return tags;
	}
	public void setTags(List<String> tags) {
		this.tags = tags;
	}

	private int id;
	private int userid;
	private String name;
	private String description;
	private String created;
	private String modified;
	private String list;
	private List<String> tags;
}
