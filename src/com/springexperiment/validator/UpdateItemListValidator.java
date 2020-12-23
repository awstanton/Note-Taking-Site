package com.springexperiment.validator;

import java.util.regex.Pattern;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import com.springexperiment.model.UpdateItem;
import com.springexperiment.model.UpdateItemList;

public class UpdateItemListValidator implements Validator {
	private static final Logger logger = LogManager.getLogger(UpdateItemListValidator.class);
	
	@Override
    public boolean supports(Class<?> c) {
		logger.debug("supports");
        return UpdateItemList.class.equals(c);
    }
	
    @Override
    public void validate(Object target, Errors errors) {
    	logger.debug("validate");
    	UpdateItemList uil = (UpdateItemList) target;
    	System.out.println("uil = " + uil);
    	for (UpdateItem ui : uil.getUpdateItems()) {
    		if (ui.getNewName() != "" && !Pattern.matches("[a-zA-Z0-9\\s\\!\\@\\^\\*]{1,60}", ui.getNewName())) { // ui.getNewName().length() < 1 || ui.getNewName().length() > 60
    			ui.setType("none");
    			System.out.println("item name not matching");
    		}
    		else if (ui.getOldName() != "" && !Pattern.matches("[a-zA-Z0-9\\s\\!\\@\\^\\*]{1,60}", ui.getOldName())) { // ui.getNewName().length() < 1 || ui.getNewName().length() > 60
    			ui.setType("none");
    			System.out.println("old item name not matching");
    		}
    		else if (ui.getNewList() != "" && !Pattern.matches("[a-zA-Z0-9\\s\\!\\@\\^\\*]{1,60}", ui.getNewList())) { // ui.getNewList().length() < 1 || ui.getNewList().length() > 60
    			ui.setType("none");
    			System.out.println("list not matching");
    		}
    		else if (ui.getOldList() != "" && !Pattern.matches("[a-zA-Z0-9\\s\\!\\@\\^\\*]{1,60}", ui.getOldList())) { // ui.getNewList().length() < 1 || ui.getNewList().length() > 60
    			ui.setType("none");
    			System.out.println("old list not matching");
    		}
    		else if (ui.getDescription() != "" && !Pattern.matches("[a-zA-Z0-9\\s\\!\\@\\^\\*\\?\\.\\,\\(\\)\\/\\-]{1,500}", ui.getDescription())) { // ui.getDescription().length() < 1 || ui.getDescription().length() > 500
    			ui.setType("none");
    			System.out.println("description not matching");
    		}
    		else if (ui.getModified() != "" && !Pattern.matches("^\\d{4}-\\d{2}-\\d{2}$", ui.getModified())) { // ui.getModified().length() != 10
    			System.out.println("date not matching");
    			ui.setType("none");
    		}
    		else {
    			for (String tag: ui.getAddedTags()) {
    				System.out.println("tag = " + tag);
        			if (!Pattern.matches("[a-zA-Z0-9\\s\\!\\@\\^\\*]{1,60}", tag)) { // tag.length() < 1 || tag.length() > 30
        				ui.setType("none");
        				System.out.println("tag not matching");
        			}
        			break;
        		}
    			for (String tag: ui.getRemovedTags()) {
    				System.out.println("tag = " + tag);
        			if (!Pattern.matches("[a-zA-Z0-9\\s\\!\\@\\^\\*]{1,60}", tag)) { // tag.length() < 1 || tag.length() > 30
        				ui.setType("none");
        				System.out.println("old tag not matching");
        			}
        			break;
        		}
    		}
    		
    	}
    }
	
	
}