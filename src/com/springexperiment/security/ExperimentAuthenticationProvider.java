package com.springexperiment.security;

import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.springexperiment.controller.ExperimentController;
import com.springexperiment.dao.ExperimentDao;
import com.springexperiment.validator.ExperimentValidator;
import com.springexperiment.validator.UpdateItemListValidator;

public class ExperimentAuthenticationProvider implements AuthenticationProvider {
	private PasswordEncoder passwordEncoder;
	private ExperimentDao experimentDao;
	private ExperimentValidator experimentValidator;
	
	public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
		this.passwordEncoder = passwordEncoder;
	}
	
	public void setExperimentDao(ExperimentDao experimentDao) {
		this.experimentDao = experimentDao;
	}
	public void setExperimentValidator(ExperimentValidator experimentValidator) {
		this.experimentValidator = experimentValidator;
	}
	
	
	@Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		System.out.println("AUTHENTICATING");
		String username = authentication.getName();
		String password = authentication.getCredentials().toString();
		if (experimentValidator.isStringValid(username,  4, 64)) {
			if (experimentValidator.isStringValid(password, 4, 64)) {
				String encodedPassword = experimentDao.getPassword(username);
				if (encodedPassword == "") {
					System.out.println("USERNAME NOT FOUND");
					throw new UsernameNotFoundException("incorrect username");
				}
				else if (passwordEncoder.matches(password, encodedPassword)) {
					System.out.println("SUCCESS");
					
					ArrayList<GrantedAuthority> authorities = new ArrayList<>(); 
					List<String> auths = experimentDao.getAuthorities(username);
					for (String auth : auths) {
						System.out.println("auth = " + auth);
						authorities.add(new SimpleGrantedAuthority(auth));
					}
					UsernamePasswordAuthenticationToken result = new UsernamePasswordAuthenticationToken(username, authentication.getCredentials(), authorities);
					result.setDetails(authentication.getDetails());
					return result;
				}
				else {
					System.out.println("WRONG PASSWORD");
					throw new BadCredentialsException("invalid credentials");
				}
			}
			else {
				System.out.println("INVALID PASSWORD");
				throw new BadCredentialsException("invalid password");
			}
		}
		else {
			System.out.println("INVALID USERNAME");
			throw new BadCredentialsException("invalid username");
		}
		
	}
	
	@Override
	public boolean supports(Class<?> authentication) {
		return authentication.equals(UsernamePasswordAuthenticationToken.class);
	}
}
