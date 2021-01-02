package com.springexperiment.validator;

import java.util.regex.Pattern;

public class ExperimentValidator {
	public boolean isStringValid(String str, int minLength, int maxLength) {
		System.out.println("validating string");
		return (Pattern.matches("[a-zA-Z0-9\\s\\!\\@\\^\\*]{" + minLength + "," + maxLength + "}", str)) ? true : false;
	}
}
