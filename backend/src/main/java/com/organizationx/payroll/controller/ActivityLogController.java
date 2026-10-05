package com.organizationx.payroll.controller;

import com.organizationx.payroll.model.ActivityLog;
import com.organizationx.payroll.repository.ActivityLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class ActivityLogController {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogController(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getLogs() {
        return ResponseEntity.ok(activityLogRepository.findTop50ByOrderByIdDesc());
    }
}
