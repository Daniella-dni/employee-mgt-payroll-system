package com.organizationx.payroll.service;

import com.organizationx.payroll.model.ActivityLog;
import com.organizationx.payroll.model.Employee;
import com.organizationx.payroll.repository.ActivityLogRepository;
import com.organizationx.payroll.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ActivityLogRepository activityLogRepository;

    public EmployeeService(EmployeeRepository employeeRepository, ActivityLogRepository activityLogRepository) {
        this.employeeRepository = employeeRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Employee ID cannot be null or empty");
        }
        return employeeRepository.findById(id).orElse(null);
    }

    public Employee addEmployee(Employee emp) {
        if (emp.getName() == null || emp.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Employee name is required");
        }
        if (emp.getId() == null || emp.getId().trim().isEmpty()) {
            throw new IllegalArgumentException("Employee ID is required");
        }
        if (emp.getRole() == null || emp.getRole().trim().isEmpty()) {
            throw new IllegalArgumentException("Role/Position is required");
        }
        if (emp.getDept() == null || emp.getDept().trim().isEmpty()) {
            throw new IllegalArgumentException("Department is required");
        }
        if (emp.getSalary() == null) {
            throw new IllegalArgumentException("Valid salary is required");
        }
        if (emp.getSalary() < 0) {
            throw new IllegalArgumentException("Salary cannot be negative");
        }

        String formattedId = emp.getId().trim().toUpperCase();
        if (employeeRepository.existsById(formattedId)) {
            throw new IllegalArgumentException("Employee ID \"" + formattedId + "\" already exists");
        }

        emp.setId(formattedId);
        emp.setName(emp.getName().trim());
        emp.setRole(emp.getRole().trim());
        emp.setDept(emp.getDept().trim());
        if (emp.getStartDate() == null) {
            emp.setStartDate(LocalDate.now());
        }
        emp.setStatus("Active");

        Employee saved = employeeRepository.save(emp);
        activityLogRepository.save(new ActivityLog("Admin User", "Added employee \"" + saved.getName() + "\" (" + saved.getId() + ")", "success"));
        return saved;
    }

    public Employee deleteEmployee(String id) {
        Employee emp = getEmployeeById(id);
        if (emp == null) {
            throw new IllegalArgumentException("Employee not found with ID: " + id);
        }
        employeeRepository.deleteById(id);
        activityLogRepository.save(new ActivityLog("Admin User", "Removed employee \"" + emp.getName() + "\" (" + emp.getId() + ")", "danger"));
        return emp;
    }

    public Employee toggleEmployeeStatus(String id) {
        Employee emp = getEmployeeById(id);
        if (emp == null) {
            throw new IllegalArgumentException("Employee not found with ID: " + id);
        }
        emp.setStatus("Active".equalsIgnoreCase(emp.getStatus()) ? "Inactive" : "Active");
        Employee updated = employeeRepository.save(emp);
        activityLogRepository.save(new ActivityLog("Admin User", "Updated status of " + emp.getName() + " to " + emp.getStatus(), "info"));
        return updated;
    }
}
