package com.organizationx.payroll.dto;

public class PayrollRequest {
    private String employeeId;
    private Double hoursWorked;
    private Boolean hasTax;
    private Boolean hasInsurance;

    public PayrollRequest() {}

    public PayrollRequest(String employeeId, Double hoursWorked, Boolean hasTax, Boolean hasInsurance) {
        this.employeeId = employeeId;
        this.hoursWorked = hoursWorked;
        this.hasTax = hasTax;
        this.hasInsurance = hasInsurance;
    }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public Double getHoursWorked() { return hoursWorked; }
    public void setHoursWorked(Double hoursWorked) { this.hoursWorked = hoursWorked; }

    public Boolean getHasTax() { return hasTax; }
    public void setHasTax(Boolean hasTax) { this.hasTax = hasTax; }

    public Boolean getHasInsurance() { return hasInsurance; }
    public void setHasInsurance(Boolean hasInsurance) { this.hasInsurance = hasInsurance; }
}
