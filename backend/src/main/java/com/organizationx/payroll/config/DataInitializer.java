package com.organizationx.payroll.config;

import com.organizationx.payroll.model.ActivityLog;
import com.organizationx.payroll.model.Employee;
import com.organizationx.payroll.model.PayrollRecord;
import com.organizationx.payroll.repository.ActivityLogRepository;
import com.organizationx.payroll.repository.EmployeeRepository;
import com.organizationx.payroll.repository.PayrollRecordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final ActivityLogRepository activityLogRepository;

    public DataInitializer(EmployeeRepository employeeRepository,
                           PayrollRecordRepository payrollRecordRepository,
                           ActivityLogRepository activityLogRepository) {
        this.employeeRepository = employeeRepository;
        this.payrollRecordRepository = payrollRecordRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    public void run(String... args) {
        if (employeeRepository.count() == 0) {
            List<Employee> seedEmployees = Arrays.asList(
                new Employee("EMP001", "John Doe", "Software Engineer", "IT", 5000.00, LocalDate.parse("2026-09-01"), "Active"),
                new Employee("EMP002", "Jane Smith", "HR Manager", "HR", 4500.00, LocalDate.parse("2026-08-15"), "Active"),
                new Employee("EMP003", "Carlos Rivera", "Accountant", "Finance", 4200.00, LocalDate.parse("2026-07-01"), "Active"),
                new Employee("EMP004", "Aisha Patel", "Operations Lead", "Operations", 5500.00, LocalDate.parse("2026-06-01"), "Active"),
                new Employee("EMP005", "Leo Nguyen", "QA Engineer", "IT", 3800.00, LocalDate.parse("2026-09-10"), "Active")
            );

            employeeRepository.saveAll(seedEmployees);

            List<LocalDate> payDates = Arrays.asList(LocalDate.parse("2026-09-15"), LocalDate.parse("2026-09-22"));
            int counter = 0;
            for (LocalDate date : payDates) {
                for (Employee emp : seedEmployees) {
                    double gross = emp.getSalary();
                    double tax = gross * 0.15;
                    double insurance = gross * 0.05;
                    double net = gross - tax - insurance;
                    PayrollRecord rec = new PayrollRecord(
                            "PAY-INIT-" + emp.getId() + "-" + counter++,
                            emp.getId(),
                            emp.getName(),
                            emp.getDept(),
                            gross,
                            160.0,
                            tax,
                            insurance,
                            net,
                            date
                    );
                    payrollRecordRepository.save(rec);
                }
            }

            activityLogRepository.save(new ActivityLog("System", "Java Spring Boot Backend initialized with 5 demo employees", "success"));
        }
    }
}
