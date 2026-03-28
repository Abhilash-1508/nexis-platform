package com.recommerce.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Value("${openai.api-key:sk-proj-placeholder}")
    private String openAiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String openAiModel;

    @Value("${openai.url:https://api.openai.com/v1/chat/completions}")
    private String openAiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public ResponseEntity<Map<String, String>> handleChat(@RequestBody Map<String, String> request) {
        String userMsg = request.getOrDefault("message", "").trim();
        System.out.println("[Chat] Input: " + userMsg);

        Map<String, String> response = new HashMap<>();

        if (userMsg.isEmpty()) {
            response.put("reply", "System: Input required.");
            return ResponseEntity.ok(response);
        }

        try {
            // Attempt REAL AI Call
            if (openAiKey != null && !openAiKey.contains("placeholder") && !openAiKey.isBlank()) {
                String aiReply = callOpenAI(userMsg);
                if (aiReply != null && !aiReply.isBlank()) {
                    response.put("reply", aiReply);
                    return ResponseEntity.ok(response);
                }
            }
        } catch (Exception e) {
            System.err.println("[Chat] OpenAI error: " + e.getMessage());
        }

        // FALLBACK: Keyword Logic if AI fails or key is missing
        String message = userMsg.toLowerCase();
        System.out.println("[Chat] Using fallback logic for: " + message);

        if (message.contains("tanker") || message.contains("book")) {
            response.put("reply", "🚚 Intent: Tanker Logistics. I can help you schedule a delivery. Please describe your site location.");
        } else if (message.contains("product") || message.contains("show") || message.contains("browse")) {
            response.put("reply", "🛍️ Intent: Product Discovery. You can view all listings on our Home and Tanker pages. Any specific category?");
        } else if (message.contains("order") || message.contains("track")) {
            response.put("reply", "📦 Intent: Tracking. Please provide your Order ID (starts with #) or check Profile → Order History.");
        } else if (message.contains("payment") || message.contains("upi")) {
            response.put("reply", "💰 Intent: Billing. We support UPI, Razorpay, and COD. Payments are secured via end-to-end encryption.");
        } else {
            response.put("reply", "I'm your Nexis AI assistant. I'm currently running in high-reliability mode. How can I assist you with tankers, products, or orders today?");
        }

        return ResponseEntity.ok(response);
    }

    private String callOpenAI(String message) {
        String url = openAiUrl;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", openAiModel);
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are the Nexis AI assistant for a tech marketplace. Help users with products, orders, and technical specs.");
        messages.add(systemMessage);
        
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", message);
        messages.add(userMsg);
        
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>) (Class<?>) Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<?> choices = (List<?>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                    Map<?, ?> messageObj = (Map<?, ?>) firstChoice.get("message");
                    return (String) messageObj.get("content");
                }
            }
        } catch (Exception e) {
            System.err.println("OpenAI API Failure: " + e.getMessage());
        }
        return null; 
    }
}
