package com.springexperiment.model;

import java.util.ArrayList;
import java.util.List;

public class UpdateItemList {
	private List<UpdateItem> updateItems;
	
	public List<UpdateItem> getUpdateItems() {
		return updateItems;
	}

	public void setUpdateItems(List<UpdateItem> updateItems) {
		this.updateItems = updateItems;
	}

	public UpdateItemList() {
		super();
		updateItems = new ArrayList<UpdateItem>();
	}
	
	public UpdateItem get(int index) {
		return updateItems.get(index);
	}
	
	public String toString() {
		String result = "[";
		
		for (int i = 0; i < updateItems.size() - 1; ++i) {
			result += updateItems.get(i) + ", ";
		}
		if (updateItems.size() - 1 >= 0) {
			result += updateItems.get(updateItems.size() - 1);
		}
		
		
		return result;
	}
	
}
