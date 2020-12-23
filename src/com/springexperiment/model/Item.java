package com.springexperiment.model;

import java.util.List;
//import javax.validation.constraints.NotNull;
//import javax.validation.constraints.Size;

public class Item {
	private int id;
	private int userid;
	//@NotNull
	//@Size(min = 1, max = 60)
	private String name; // min=1,max=60, not null
	//@NotNull
	//@Size(min = 1, max = 500)
	private String description; // min=1,max=500, not null
	//@NotNull
	private String created; // format, not null
	//@NotNull
	private String modified; // format, not null
	private String list; // min=1, max=60
	private List<String> tags;
	// Constructors
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
	// Getters
	public int getId() {
		return id;
	}
	public int getUserid() {
		return userid;
	}
	public String getName() {
		return name;
	}
	public String getDescription() {
		return description;
	}
	public String getCreated() {
		return created;
	}
	public String getModified() {
		return modified;
	}
	public String getList() {
		return list;
	}
	public List<String> getTags() {
		return tags;
	}
	// Setters
	public void setId(int id) {
		this.id = id;
	}
	public void setUserid(int userid) {
		this.userid = userid;
	}
	public void setName(String name) {
		this.name = name;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public void setCreated(String created) {
		this.created = created;
	}
	public void setModified(String modified) {
		this.modified = modified;
	}
	public void setList(String list) {
		this.list = list;
	}
	public void setTags(List<String> tags) {
		this.tags = tags;
	}
}

//public Item(int id, int userid, String name, String description, String created, String modified, String list, List<String> tags) {
//this.id = id;
//this.userid = userid;
//this.name = name;
//this.description = description;
//this.created = created;
//this.modified = modified;
//this.list= list;
//this.tags = tags;
//}


