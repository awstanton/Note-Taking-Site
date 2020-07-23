package com.springexperiment.controller;

import java.security.Principal;

import com.springexperiment.model.UpdateItemList;
import com.springexperiment.model.UpdateItem;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.ui.Model;

import com.springexperiment.dao.ExperimentDao;
import com.springexperiment.model.Item;

import org.springframework.beans.propertyeditors.CustomCollectionEditor;
import org.springframework.http.HttpStatus;

@RequestMapping(value="/")
public class ExperimentController {
	
	private static final Logger LOGGER = LogManager.getLogger(ExperimentController.class);
	private static final Logger rootLogger = LogManager.getRootLogger();
	
	private ExperimentDao experimentDao;
	
	public void setExperimentDao(ExperimentDao experimentDao) {
		this.experimentDao = experimentDao;
	}
	
	protected void initBinder(WebDataBinder binder) throws Exception {
		binder.registerCustomEditor(Set.class, "updateItems", new CustomCollectionEditor(List.class) {
			@Override
			protected Object convertElement(Object element) {
				System.out.println("in convertElement and element is " + element.toString());
				return null;
			}
		});
	}
	
	
//	private SessionRegistry sessionRegistry;
//	
//	public void setSessionRegistry(SessionRegistry sessionRegistry) {
//		this.sessionRegistry = sessionRegistry;
//	}
	
	@RequestMapping(value="/")
	public ModelAndView experiment() {
//		System.out.println(experimentDao.getName());
		return new ModelAndView("experimentPage");
	}
	
	@GetMapping("/login")
	public String login(HttpServletRequest req, HttpServletResponse res) {
		System.out.println("login reached in controller");
		System.out.println("request is: " + req.getHeaderNames() + "," + req.getPathInfo());
		System.out.println("response is: " + res.getHeaderNames());
		return "login";
	}
	@PostMapping("/logoutSave")
	public String logout(@ModelAttribute("updateItems") UpdateItemList updateItems, Principal principal) {
		System.out.println("inside logout method");
		for (UpdateItem item : updateItems.getUpdateItems()) {
			switch(item.getType()) {
			case "create":
				experimentDao.createItem(principal.getName(), item);
				break;
			case "update":
				experimentDao.updateItem(principal.getName(), item);
				break;
			case "delete":
				experimentDao.deleteItem(principal.getName(), item);
				break;
			}
		}
		return "redirect:/logout";
	}
	@GetMapping("/logout")
	public String logout() {
		return "login";
	}
//	@PostMapping("/saveAndLogout")
//	public String saveAndLogout() {
//		System.out.println("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ");
//
//		return "/redirect:/logout";
//	}
	
//	@PostMapping("/login")
//	public String loginin() {
//		System.out.println("logging in and going to items page!!!");
//		return "items";
//	}
	@PostMapping("/signup")
	public String signup(@RequestParam("username") String username, @RequestParam("password") String password, @RequestParam("confirmPassword") String confirmPassword) {
		System.out.println("signup reached in controller");
		System.out.println("username = " + username + " and password = " + password + " and confirm password = " + confirmPassword);
		experimentDao.signUp(username, password);
		return "login";
	}
	@PostMapping("/denied")
	public String denied() {
		System.out.println("denied");
		return "denied";
	}
//	@ResponseStatus(HttpStatus.CREATED)
//	@PostMapping(path = "/newItem", consumes = "application/x-www-form-urlencoded")
//	public void newItem(@ModelAttribute NewItem newItem) {
//		System.out.println(newItem);
//	}
	
	
	
	@ResponseStatus(HttpStatus.CREATED)
	@PostMapping(path = "/updateItem", consumes = "application/x-www-form-urlencoded")
	public void updateItem(@ModelAttribute("updateItems") UpdateItemList updateItems, Principal principal) {
		System.out.println("updateItem start");
		
		System.out.println(updateItems);
		
		for (UpdateItem item : updateItems.getUpdateItems()) {
			switch(item.getType()) {
			case "create":
				experimentDao.createItem(principal.getName(), item);
				break;
			case "update":
				experimentDao.updateItem(principal.getName(), item);
				break;
			case "delete":
				experimentDao.deleteItem(principal.getName(), item);
				break;
			}
		}
		
		
		
		
//		System.out.println(updateItems.get(0));
//		System.out.println(updateItems.get(1));
		
		System.out.println("updateItem end");
	}
	
	
//	@ResponseStatus(HttpStatus.CREATED)
//	@PostMapping(path = "/updateItem1", consumes = "application/x-www-form-urlencoded")
//	public void updateItem1(@RequestBody String body) {
//		System.out.println("updateItem start");
//		System.out.println(body);
////		System.out.println(updateItems.size());
//		System.out.println("updateItem end");
//	}
	
	
	
//	@ResponseStatus(HttpStatus.CREATED)
//	@PostMapping(path = "/deleteItem", consumes = "application/x-www-form-urlencoded")
//	public void deleteItem(@ModelAttribute DeleteItem deleteItem) {
//		System.out.println(deleteItem);
//	}
//	@PostMapping("/removeItem")
//	@PostMapping("/modifyItem")
	
	
	
//	@ResponseStatus(HttpStatus.CREATED)
//	@PostMapping(path = "/update", consumes = "application/x-www-form-urlencoded")
//	public void update1(@RequestBody String body) {
//		System.out.println("URLENCODED - updating");
//		System.out.println("request body: " + body);
//	}
//	@ResponseStatus(HttpStatus.CREATED)
//	@PostMapping(path = "/update", consumes = "application/json")
//	public void update2(@RequestBody String body) {
//		System.out.println("JSON - updating");
//		System.out.println("request body: " + body);
//	}
//	@ResponseStatus(HttpStatus.CREATED)
//	@PostMapping(path = "/update", consumes = "multipart/form-data")
//	public void update3(@RequestPart("_csrf") String token) {
//		System.out.println("MULTIPART - updating");
//		System.out.println("request part - token: " + token);
//	}
	

	
	@GetMapping("/items")
	public String items(Model model, Principal principal) {
		System.out.println("Items Page");
//		Item item = new Item(1,1,"item name", "this is a description","6/4/20", "6/4/20");
//		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//		String username = auth.getName();
//		experimentDao.loadUserItems(username);
//		experimentDao.loadUserListNames(username);
//		experimentDao.loadUserTagNames(username);
//		System.out.println("username: " + principal.getName());
		
		List<Item> items = experimentDao.loadUserItems(principal.getName());
		List<String> listNames = experimentDao.loadUserListNames(principal.getName());
		List<String> tagNames = experimentDao.loadUserTagNames(principal.getName());
		
		System.out.println("items: " + items);
		System.out.println("listNames: " + listNames);
		System.out.println("tagNames: " + tagNames);
		
//		items.add(item);
		model.addAttribute("items", items);
		model.addAttribute("listNames", listNames);
		model.addAttribute("tagNames", tagNames);
		model.addAttribute("updateItems", new UpdateItemList());
		/*
		 * for each item
		 * 		query database for its list's name
		 * 		query database for its tags' names
		 * query database for all list names of the user
		 * query database for all tag names of the user 
		 * 
		 * 
		 * 
		 */
		
//		model.addAttribute("items", items);
		
		
		
		
//		ArrayList<List> lists = experimentDao.getUserLists();
//		ArrayList<Tag> tags = experimentDao.getTags();
//		model.addAttribute(items);
//		model.addAttribute(lists);
//		model.addAttribute(tags);
//		model.addAttribute(attributeValue)
//		System.out.println("REGISTRY SAYS: " + sessionRegistry.getAllPrincipals());
		
		return "items";
	}
	@GetMapping("/admin")
	public String admin() {
		System.out.println("admin!");
		return "privatePage";
	}
}
