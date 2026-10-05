package com.organizationx.payroll.service;

import com.organizationx.payroll.dto.PayrollRequest;
import com.organizationx.payroll.model.ActivityLog;
import com.organizationx.payroll.model.Employee;
import com.organizationx.payroll.model.PayrollRecord;
import com.organizationx.payroll.repository.ActivityLogRepository;
import com.organizationx.payroll.repository.EmployeeRepository;
import com.organizationx.payroll.repository.PayrollRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class PayrollService {

    private static final double TAX_RATE = 0.15;
    private static final double INSURANCE_RATE = 0.05;

    private final EmployeeRepository employeeRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final ActivityLogRepository activityLogRepository;

    public PayrollService(EmployeeRepository employeeRepository,
                          PayrollRecordRepository payrollRecordRepository,
                          ActivityLogRepository activityLogRepository) {
        this.employeeRepository = employeeRepository;
        this.payrollRecordRepository = payrollRecordRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public double calculateNetPay(double grossSalary, boolean hasTax, boolean hasInsurance) {
        if (grossSalary < 0) {
            throw new IllegalArgumentException("Salary cannot be negative");
        }

        double netPay = grossSalary;

        if (hasTax && hasInsurance) {
            netPay = grossSalary - (grossSalary * TAX_RATE) - (grossSalary * INSURANCE_RATE);
        } else if (hasTax && !hasInsurance) {
            netPay = grossSalary - (grossSalary * TAX_RATE);
        } else if (!hasTax && hasInsurance) {
            netPay = grossSalary - (grossSalary * INSURANCE_RATE);
        } else {
            netPay = grossSalary;
        }

        return Math.round(netPay * 100.0) / 100.0;
    }

    public PayrollRecord processPayroll(PayrollRequest request) {
        if (request.getEmployeeId() == null || request.getEmployeeId().trim().isEmpty()) {
            throw new IllegalArgumentException("Employee ID is required");
        }

        Employee emp = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + request.getEmployeeId()));

        double hours = request.getHoursWorked() != null ? request.getHoursWorked() : 160.0;
        if (hours < 0) {
            throw new IllegalArgumentException("Hours worked must be a non-negative number");
        }

        boolean hasTax = Boolean.TRUE.equals(request.getHasTax());
        boolean hasInsurance = Boolean.TRUE.equals(request.getHasInsurance());

        double grossSalary = (hours == 0) ? 0.0 : emp.getSalary();
        double netPay = calculateNetPay(grossSalary, hasTax, hasInsurance);
        double tax = hasTax ? Math.round(grossSalary * TAX_RATE * 100.0) / 100.0 : 0.0;
        double insurance = hasInsurance ? Math.round(grossSalary * INSURANCE_RATE * 100.0) / 100.0 : 0.0;

        String payId = "PAY-" + System.currentTimeMillis() + "-" + emp.getId();

        PayrollRecord record = new PayrollRecord(
                payId,
                emp.getId(),
                emp.getName(),
                emp.getDept(),
                grossSalary,
                hours,
                tax,
                insurance,
                netPay,
                LocalDate.now()
        );

        PayrollRecord saved = payrollRecordRepository.save(record);
        activityLogRepository.save(new ActivityLog("Admin User", "Processed payroll for " + emp.getName() + " — Net Pay: $" + String.format("%.2f", netPay), "success"));
        return saved;
    }

    public List<PayrollRecord> getAllPayrollRecords() {
        return payrollRecordRepository.findAllByOrderByProcessedAtDesc();
    }

    public Map<String, Object> generateReport(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        List<PayrollRecord> records;
        if (startDate != null && endDate != null) {
            records = payrollRecordRepository.findByPaymentDateBetween(startDate, endDate);
        } else {
            records = payrollRecordRepository.findAll();
        }

        double totalGross = 0;
        double totalTax = 0;
        double totalInsurance = 0;
        double totalNet = 0;

        for (PayrollRecord r : records) {
            totalGross += r.getGrossSalary();
            totalTax += r.getTax();
            totalInsurance += r.getInsurance();
            totalNet += r.getNetPay();
        }

        Map<String, Object> report = new HashMap<>();
        report.put("totalEmployees", employeeRepository.count());
        report.put("recordsProcessed", records.size());
        report.put("totalGross", Math.round(totalGross * 100.0) / 100.0);
        report.put("totalTax", Math.round(totalTax * 100.0) / 100.0);
        report.put("totalInsurance", Math.round(totalInsurance * 100.0) / 100.0);
        report.put("totalNetPay", Math.round(totalNet * 100.0) / 100.0);
        report.put("records", records);

        return report;
    }
}
