package com.organizationx.payroll.controller;

import com.organizationx.payroll.dto.ApiResponse;
import com.organizationx.payroll.model.Employee;
import com.organizationx.payroll.service.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeById(@PathVariable String id) {
        Employee emp = employeeService.getEmployeeById(id);
        if (emp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Employee not found"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Found employee", emp));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Employee>> addEmployee(@RequestBody Employee employee) {
        Employee created = employeeService.addEmployee(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Employee added successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> deleteEmployee(@PathVariable String id) {
        Employee deleted = employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.ok("Employee removed successfully", deleted));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Employee>> toggleStatus(@PathVariable String id) {
        Employee updated = employeeService.toggleEmployeeStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Employee status updated", updated));
    }
}
