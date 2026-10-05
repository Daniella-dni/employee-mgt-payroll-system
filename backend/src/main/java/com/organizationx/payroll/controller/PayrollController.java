package com.organizationx.payroll.controller;

import com.organizationx.payroll.dto.ApiResponse;
import com.organizationx.payroll.dto.PayrollRequest;
import com.organizationx.payroll.model.PayrollRecord;
import com.organizationx.payroll.service.PayrollService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PayrollRecord>> processPayroll(@RequestBody PayrollRequest request) {
        PayrollRecord record = payrollService.processPayroll(request);
        return ResponseEntity.ok(ApiResponse.ok("Payroll processed successfully", record));
    }

    @GetMapping("/records")
    public ResponseEntity<List<PayrollRecord>> getAllRecords() {
        return ResponseEntity.ok(payrollService.getAllPayrollRecords());
    }

    @GetMapping("/report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> report = payrollService.generateReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok("Report generated", report));
    }
}
