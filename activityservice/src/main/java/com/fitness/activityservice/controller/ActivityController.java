package com.fitness.activityservice.controller;

import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.dto.ActivityResquest;
import com.fitness.activityservice.service.ActivityService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/activities")
public class ActivityController {
    private final ActivityService activityService;
    @PostMapping
    public ResponseEntity<ActivityResponse> trackActivity(
            @RequestBody ActivityResquest resquest,
            @RequestHeader("X-User-ID") String userId
    ){
        if(userId!=null){
            resquest.setUserId(userId);
        }
        return ResponseEntity.ok(activityService.trackActivity(resquest));
    }
    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getUserActivity(
            @RequestHeader("X-User-ID") String userId
    ) {
        // Implement the logic to retrieve the activity by ID
        return ResponseEntity.ok(activityService.getUserActivity(userId)); // Placeholder response
    }
    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> getActivity(
            @PathVariable String activityId
    ){
        return ResponseEntity.ok(activityService.getActivity(activityId));
    }


}
