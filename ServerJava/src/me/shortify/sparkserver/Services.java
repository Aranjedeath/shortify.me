package me.shortify.sparkserver;

import static spark.Spark.before;
import static spark.Spark.get;
import static spark.Spark.options;
import static spark.Spark.post;
import static spark.Spark.externalStaticFileLocation;

import java.util.Calendar;

import me.shortify.dao.CassandraDAO;
import me.shortify.utils.geoLocation.CountryIPInformation;
import me.shortify.utils.shortenerUrl.Algorithm;

import org.json.JSONException;
import org.json.JSONObject;

import com.maxmind.geoip2.exception.AddressNotFoundException;

public class Services {
	private static final String API_CONTEXT = "/api/v1";
	
	public static void setupEndpoints() {	
		
		//folder del client web
		externalStaticFileLocation("/ClientAngular");
		
		setConversione();
    	setVisitaShortUrl();    
    	setOpzioni();
    }
	
	
	private static void setConversione() {
		post(API_CONTEXT + API.CONVERT, (request, response) -> {
    		
    		String json = request.body();
    		System.out.println("Parametro passato: " + json) ;
    		JSONObject jsonObject = new JSONObject(json);
    		
    		//si ottiene il long url dalla richiesta
    		String url = jsonObject.getString("longurl");
    		
    		String customText;
    		String shortUrl = "";
    		
    		try {
    			
    			//se e' stato inserito un custom text
    			customText = jsonObject.getString("customText");
    		} catch(JSONException e) {
    			customText = "";
    		}
    		
    		CassandraDAO d = new CassandraDAO();
    		
    		if(customText == "") { 
    			
	    		//conversione dell'url
	    		shortUrl = Algorithm.buildShortUrl(url);
	    		jsonObject = new JSONObject();
	    		
	    		System.out.println("Risultato conversione: " + shortUrl);
	    		
    		} else {
    			
    			//TODO controlli richiesti
    			shortUrl = customText;
    			
    			System.out.println("Custom URL inserito: " + shortUrl);
    		}
    				
    		if (!d.checkUrl(shortUrl)) {
    			d.putUrl(shortUrl, url);
    			
    			//json con short url
        		jsonObject.put("shortUrl", shortUrl);
    		} else {
    			System.out.println("ShortUrl gi� presente nel DB");
    			response.status(401);
    		}
    			
    	    return jsonObject.toString();
    	});
	}
	
	private static void setVisitaShortUrl() {
    	get("/:goto", (request, response) -> {
    		String shortUrl = request.params(":goto"); 
    		String ip = request.ip();
    		String country = "";
    		System.out.println("Valore di shortUrl: " + shortUrl);
    		
    		CountryIPInformation cIPi = new CountryIPInformation();
    		cIPi.setDataIP(ip);
    		
    		try {
    			country = cIPi.getCountry();
    		} catch (AddressNotFoundException e) {
    			country = "NULL";
    		}
    		
    		CassandraDAO d = new CassandraDAO();	
    		String longUrl = d.getUrl(shortUrl, country, ip, Calendar.getInstance());
    		
    		System.out.println("IP: " + ip);
    		System.out.println("Country: " +  country);
    		System.out.println("Long Url:" + longUrl);
    		
    		if (longUrl != "") {  		
    			response.redirect(longUrl);   		
    		} else {
    			response.status(404);
    		}
    		
    	    return null;
    	});
	}

	private static void setOpzioni() {
    	options("/*", (request,response)->{

    	    String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
    	    if (accessControlRequestHeaders != null) {
    	        response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
    	    }

    	    String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
    	    if(accessControlRequestMethod != null){
    		response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
    	    }

    	    return "OK";
    	});

    	before((request,response)->{
    	    response.header("Access-Control-Allow-Origin", "*");
    	});
	}
}
