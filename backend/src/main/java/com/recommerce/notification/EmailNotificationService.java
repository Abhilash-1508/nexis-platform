package com.recommerce.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class EmailNotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@nexis.local}")
    private String fromEmail;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.messaging-service-sid:}")
    private String twilioMessagingServiceSid;

    @Value("${twilio.phone-number:}")
    private String twilioPhoneNumber;

    // ──────────────────────────────────────────────
    //  EMAIL
    // ──────────────────────────────────────────────

    public void sendEmail(String toEmail, String subject, String body) {
        System.out.println("---------- EMAIL OUTBOUND ----------");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: " + subject);
        System.out.println("------------------------------------");

        if (mailSender != null && toEmail != null && toEmail.contains("@")) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom(fromEmail);
                mailSender.send(message);
                System.out.println("✅ Email dispatched to: " + toEmail);
            } catch (Exception e) {
                System.err.println("❌ Email failed: " + e.getMessage());
            }
        } else {
            System.out.println("⚠️ Email skipped: mailSender not configured or invalid address.");
        }
    }

    public void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        System.out.println("------- HTML EMAIL OUTBOUND --------");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: " + subject);
        System.out.println("------------------------------------");

        if (mailSender != null && toEmail != null && toEmail.contains("@")) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlBody, true);
                helper.setFrom(fromEmail);
                mailSender.send(message);
                System.out.println("✅ HTML Email dispatched to: " + toEmail);
            } catch (Exception e) {
                System.err.println("❌ HTML Email failed: " + e.getMessage());
            }
        } else {
            System.out.println("⚠️ HTML Email skipped: mailSender not configured or invalid address.");
        }
    }

    public void sendSms(String phoneNumber, String body) {
        System.out.println("---------- SMS OUTBOUND ----------");
        System.out.println("To: " + phoneNumber);
        System.out.println("Message: " + (body != null ? body : "NULL"));
        System.out.println("----------------------------------");

        if (body == null || body.trim().isEmpty()) {
            System.err.println("❌ SMS failed: Message body is empty.");
            return;
        }

        if (twilioAccountSid == null || twilioAccountSid.isBlank() ||
            twilioAuthToken == null || twilioAuthToken.isBlank()) {
            System.err.println("⚠️ SMS skipped: Twilio credentials (Account SID/Auth Token) not configured in environment.");
            return;
        }

        try {
            // Validate & Normalize phone number — must be E.164 format e.g. +919876543210
            String formattedPhone = phoneNumber.trim().replaceAll("\\s+", "");
            if (!formattedPhone.startsWith("+")) {
                if (formattedPhone.length() == 10) {
                    formattedPhone = "+91" + formattedPhone; // Default to India if 10 digits
                } else {
                    formattedPhone = "+" + formattedPhone;
                }
            }

            if (!formattedPhone.matches("^\\+[1-9]\\d{1,14}$")) {
                System.err.println("❌ SMS failed: Destination phone number '" + formattedPhone + "' does not follow E.164 format.");
                return;
            }

            // Determine sender (MessagingServiceSid or From phone number)
            String senderParam;
            String senderValue;
            if (twilioMessagingServiceSid != null && !twilioMessagingServiceSid.isBlank()) {
                senderParam = "MessagingServiceSid";
                senderValue = twilioMessagingServiceSid.trim();
            } else if (twilioPhoneNumber != null && !twilioPhoneNumber.isBlank()) {
                senderParam = "From";
                senderValue = twilioPhoneNumber.trim();
                if (!senderValue.startsWith("+")) senderValue = "+" + senderValue;
            } else {
                System.err.println("❌ SMS failed: Neither 'twilio.messaging-service-sid' nor 'twilio.phone-number' is configured.");
                return;
            }

            // Build Twilio Messages endpoint URL
            String urlStr = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(15000);

            // Basic Auth: AccountSid:AuthToken → Base64
            String credentials = twilioAccountSid + ":" + twilioAuthToken;
            String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
            conn.setRequestProperty("Authorization", "Basic " + encoded);
            conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

            // POST body
            String postData = "To=" + URLEncoder.encode(formattedPhone, StandardCharsets.UTF_8)
                    + "&" + senderParam + "=" + URLEncoder.encode(senderValue, StandardCharsets.UTF_8)
                    + "&Body=" + URLEncoder.encode(body, StandardCharsets.UTF_8);

            conn.getOutputStream().write(postData.getBytes(StandardCharsets.UTF_8));

            int responseCode = conn.getResponseCode();
            if (responseCode == 200 || responseCode == 201) {
                System.out.println("✅ SMS sent successfully to: " + formattedPhone + " (HTTP " + responseCode + ")");
            } else {
                // Read error response
                String errBody = (conn.getErrorStream() != null) 
                    ? new String(conn.getErrorStream().readAllBytes(), StandardCharsets.UTF_8)
                    : "Unknown Error";
                System.err.println("❌ SMS failed: Twilio API returned HTTP " + responseCode + ". Reason: " + errBody);
            }
            conn.disconnect();

        } catch (Exception e) {
            System.err.println("❌ SMS failed: Network exception - " + e.getMessage());
        }
    }

    // ──────────────────────────────────────────────
    //  Convenience helpers
    // ──────────────────────────────────────────────

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendProductListedEmail(String toEmail, String productName) {
        String htmlBody = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>"
            + "<h2 style='color: #4f46e5;'>Your Listing is Live on Nexis!</h2>"
            + "<p>Your item <strong>" + productName + "</strong> has been successfully listed on the Nexis marketplace.</p>"
            + "<p>Buyers can now discover and purchase your product.</p>"
            + "<a href='" + frontendUrl + "' style='display:inline-block;padding:10px 20px;background:#4f46e5;color:white;border-radius:6px;text-decoration:none;'>View Marketplace</a>"
            + "</div>";
        sendHtmlEmail(toEmail, "✅ Nexis: Your listing is live — " + productName, htmlBody);
    }
}
