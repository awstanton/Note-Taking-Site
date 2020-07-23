package com.springexperiment.model;

import java.lang.reflect.Field;
import java.util.List;

public class UpdateItem {
	private String type;
	private String oldName;
	private String newName;
	private String oldList;
	private String newList;
	private String description;
	private List<String> removedTags;
	private List<String> addedTags;
	private String modified;
	
	public UpdateItem() {
		super();
//		oldName = "";
//		newName = "";
//		type = "";
	}
	
	public String getModified() {
	return modified;
}
public void setModified(String modified) {
	this.modified = modified;
}
	
	public String getOldName() {
		return oldName;
	}
	public void setOldName(String oldName) {
		this.oldName = oldName;
	}

	public String getNewName() {
		return newName;
	}
	public void setNewName(String newName) {
		this.newName = newName;
	}
	
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getOldList() {
		return oldList;
	}
	public void setOldList(String oldList) {
		this.oldList = oldList;
	}
	public String getNewList() {
		return newList;
	}
	public void setNewList(String newList) {
		this.newList = newList;
	}
	public List<String> getRemovedTags() {
		return removedTags;
	}
	public void setRemovedTags(List<String> removedTags) {
		this.removedTags = removedTags;
	}
	public List<String> getAddedTags() {
		return addedTags;
	}
	public void setAddedTags(List<String> addedTags) {
		this.addedTags = addedTags;
	}
	@Override
	public String toString() {
		String result = "";
		try {
			for (Field field : this.getClass().getDeclaredFields()) {
				result += field.getName() + ": " + field.get(this) + "\n";
			}
		}
		catch(IllegalAccessException iae) {
			iae.printStackTrace();
		}
		return result;
	}
	
}
