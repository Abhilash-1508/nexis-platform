package com.recommerce.payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    @Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:}")
    private String razorpayKeySecret;

    public PaymentController(PaymentRepository paymentRepository, PaymentService paymentService, 
                           OrderRepository orderRepository,
                           @Value("${stripe.api.key:sk_test_mock}") String stripeApiKey) {
        this.paymentRepository = paymentRepository;
        this.paymentService = paymentService;
        this.orderRepository = orderRepository;
        Stripe.apiKey = stripeApiKey;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> request) {
        try {
            double amountInRupees = Double.parseDouble(request.get("amount").toString());
            int amountInPaise = (int) (amountInRupees * 100);
            String currency = "INR";

            if (razorpayKeyId == null || razorpayKeyId.isBlank()) {
                // Mock response if Razorpay not configured
                Map<String, Object> mockResp = new HashMap<>();
                mockResp.put("id", "order_mock_" + System.currentTimeMillis());
                mockResp.put("amount", amountInPaise);
                mockResp.put("currency", currency);
                mockResp.put("key", "rzp_test_mock_key");
                System.out.println("⚠️ Razorpay not configured. Returning mock order response.");
                return ResponseEntity.ok(mockResp);
            }

            // Call Razorpay API manually using HttpURLConnection
            URL url = new URL("https://api.razorpay.com/v1/orders");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            
            String auth = razorpayKeyId + ":" + razorpayKeySecret;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            conn.setRequestProperty("Authorization", "Basic " + encodedAuth);
            conn.setRequestProperty("Content-Type", "application/json");

            Map<String, Object> body = new HashMap<>();
            body.put("amount", amountInPaise);
            body.put("currency", currency);
            body.put("receipt", "receipt_" + System.currentTimeMillis());

            ObjectMapper mapper = new ObjectMapper();
            String jsonBody = mapper.writeValueAsString(body);
            conn.getOutputStream().write(jsonBody.getBytes(StandardCharsets.UTF_8));

            int code = conn.getResponseCode();
            if (code == 200 || code == 201) {
                @SuppressWarnings("unchecked")
                Map<String, Object> resp = mapper.readValue(conn.getInputStream(), Map.class);
                resp.put("key", razorpayKeyId); // Frontend needs the key to launch checkout
                return ResponseEntity.ok(resp);
            } else {
                String err = new String(conn.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
                return ResponseEntity.status(code).body(Map.of("error", "Razorpay order creation failed: " + err));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            if (Stripe.apiKey == null || Stripe.apiKey.equals("sk_test_mock") || Stripe.apiKey.isEmpty()) {
                Map<String, String> mockResponse = new HashMap<>();
                mockResponse.put("clientSecret", "mock_client_secret_for_testing_123");
                return ResponseEntity.ok(mockResponse);
            }

            Integer amount = (Integer) request.get("amount"); 

            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setAmount(amount != null ? Long.valueOf(amount) : 1000L)
                            .setCurrency("usd")
                            .setAutomaticPaymentMethods(
                                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                            .setEnabled(true)
                                            .build()
                                    )
                            .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            Map<String, String> responseData = new HashMap<>();
            responseData.put("clientSecret", paymentIntent.getClientSecret());

            return ResponseEntity.ok(responseData);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Payment>> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentRepository.findByOrderId(orderId));
    }

    @PostMapping("/confirm/{paymentId}")
    public ResponseEntity<Void> confirm(@PathVariable Long paymentId) {
        paymentService.markSuccess(paymentId);
        return ResponseEntity.ok().build();
    }
}
