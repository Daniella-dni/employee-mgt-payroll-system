package com.organizationx.payroll.repository;

import com.organizationx.payroll.model.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, String> {
    List<PayrollRecord> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
    List<PayrollRecord> findAllByOrderByProcessedAtDesc();
}
