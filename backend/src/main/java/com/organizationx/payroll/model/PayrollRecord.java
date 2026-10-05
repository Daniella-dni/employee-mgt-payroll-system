package com.organizationx.payroll.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_records")
public class PayrollRecord {

    @Id
    private String id;
    private String employeeId;
    private String employeeName;
    private String dept;
    private Double grossSalary;
    private Double hoursWorked;
    private Double tax;
    private Double insurance;
    private Double netPay;
    private LocalDate paymentDate;
    private LocalDateTime processedAt;

    public PayrollRecord() {}

    public PayrollRecord(String id, String employeeId, String employeeName, String dept, Double grossSalary, Double hoursWorked, Double tax, Double insurance, Double netPay, LocalDate paymentDate) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.dept = dept;
        this.grossSalary = grossSalary;
        this.hoursWorked = hoursWorked;
        this.tax = tax;
        this.insurance = insurance;
        this.netPay = netPay;
        this.paymentDate = paymentDate;
        this.processedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getDept() { return dept; }
    public void setDept(String dept) { this.dept = dept; }

    public Double getGrossSalary() { return grossSalary; }
    public void setGrossSalary(Double grossSalary) { this.grossSalary = grossSalary; }

    public Double getHoursWorked() { return hoursWorked; }
    public void setHoursWorked(Double hoursWorked) { this.hoursWorked = hoursWorked; }

    public Double getTax() { return tax; }
    public void setTax(Double tax) { this.tax = tax; }

    public Double getInsurance() { return insurance; }
    public void setInsurance(Double insurance) { this.insurance = insurance; }

    public Double getNetPay() { return netPay; }
    public void setNetPay(Double netPay) { this.netPay = netPay; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}
