package com.organizationx.payroll.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    private String id;
    private String name;
    private String role;
    private String dept;
    private Double salary;
    private LocalDate startDate;
    private String status;
    private LocalDateTime createdAt;

    public Employee() {}

    public Employee(String id, String name, String role, String dept, Double salary, LocalDate startDate, String status) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.dept = dept;
        this.salary = salary;
        this.startDate = startDate;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDept() { return dept; }
    public void setDept(String dept) { this.dept = dept; }

    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
