package com.fitness.activityservice.service;


import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.dto.ActivityResquest;
import com.fitness.activityservice.model.Activity;
import com.fitness.activityservice.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final UserValidationService userValidationService;

    public ActivityResponse trackActivity(ActivityResquest resquest) {
        boolean isValidUser =userValidationService.validateUser(resquest.getUserId());
        if(!isValidUser){
            throw new RuntimeException("Invalid request: "+resquest.getUserId());
        }
        Activity activity =  Activity.builder()
                .userId(resquest.getUserId())
                .type(resquest.getType())
                .duration(resquest.getDuration())
                .caloriesBurned(resquest.getCaloriesBurned())
                .startTime(resquest.getStartTime())
                .additionalMetrics(resquest.getAdditionalMetrics())
                .build();
        Activity savedActivity = activityRepository.save(activity);
        return maptoResponse(savedActivity);
    }
    private ActivityResponse maptoResponse(Activity activity) {
        ActivityResponse activityResponse = new ActivityResponse();
        activityResponse.setId(activity.getId());
        activityResponse.setUserId(activity.getUserId());
        activityResponse.setType(activity.getType());
        activityResponse.setDuration(activity.getDuration());
        activityResponse.setCaloriesBurned(activity.getCaloriesBurned());
        activityResponse.setStartTime(activity.getStartTime());
        activityResponse.setAdditionalMetrics(activity.getAdditionalMetrics());
        activityResponse.setCreatedAt(activity.getCreatedAt());
        activityResponse.setUpdatedAt(activity.getUpdatedAt());
        return activityResponse;
    }

    public List<ActivityResponse> getUserActivity(String userId) {
        List<Activity> activities=activityRepository.findByUserId(userId);
        return activities.stream()
                .map(this::maptoResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse getActivity(String activityId) {
        return  activityRepository.findById(activityId)
                .map(this::maptoResponse)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
    }
}
