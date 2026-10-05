package com.organizationx.payroll.controller;

import com.organizationx.payroll.dto.ApiResponse;
import com.organizationx.payroll.dto.LoginRequest;
import com.organizationx.payroll.dto.LoginResponse;
import com.organizationx.payroll.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestParam(required = false) String username) {
        authService.logout(username);
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }
}
