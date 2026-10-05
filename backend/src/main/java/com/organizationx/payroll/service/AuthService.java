package com.organizationx.payroll.service;

import com.organizationx.payroll.dto.LoginRequest;
import com.organizationx.payroll.dto.LoginResponse;
import com.organizationx.payroll.model.ActivityLog;
import com.organizationx.payroll.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final ActivityLogRepository activityLogRepository;

    private int failedAttempts = 0;
    private LocalDateTime lockedUntil = null;

    private static final int MAX_ATTEMPTS = 3;
    private static final int LOCKOUT_MINUTES = 5;

    public AuthService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public synchronized LoginResponse authenticate(LoginRequest request) {
        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        String password = request.getPassword() != null ? request.getPassword() : "";

        // Check if locked out (WB-09)
        if (lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil)) {
            long remainingMins = java.time.Duration.between(LocalDateTime.now(), lockedUntil).toMinutes() + 1;
            throw new IllegalStateException("LOCKED:Account locked. Contact administrator. Try again in " + remainingMins + " min.");
        }

        // Reset lockout if expired
        if (lockedUntil != null && LocalDateTime.now().isAfter(lockedUntil)) {
            failedAttempts = 0;
            lockedUntil = null;
        }

        // Check valid admin credentials (admin / Admin@1234)
        if ("admin".equalsIgnoreCase(username) && "Admin@1234".equals(password)) {
            failedAttempts = 0;
            lockedUntil = null;
            activityLogRepository.save(new ActivityLog("Admin User", "Logged in successfully", "success"));
            return new LoginResponse(true, "Authentication successful", "admin", "Admin User", "System Administrator");
        }

        // Increment failed attempts
        failedAttempts++;
        if (failedAttempts >= MAX_ATTEMPTS) {
            lockedUntil = LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES);
            activityLogRepository.save(new ActivityLog("System", "Account locked due to 3 failed login attempts", "danger"));
            throw new IllegalStateException("LOCKED:Account locked. Contact administrator.");
        }

        int remaining = MAX_ATTEMPTS - failedAttempts;
        activityLogRepository.save(new ActivityLog("Anonymous", "Failed login attempt for user: " + username, "warning"));
        throw new IllegalArgumentException("INVALID:Invalid username or password. " + remaining + " attempt(s) remaining.");
    }

    public synchronized void logout(String user) {
        activityLogRepository.save(new ActivityLog(user != null ? user : "Admin User", "Logged out", "info"));
    }
}
