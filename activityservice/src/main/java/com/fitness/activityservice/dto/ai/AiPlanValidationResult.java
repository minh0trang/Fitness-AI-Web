package com.fitness.activityservice.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPlanValidationResult {

    private boolean valid;

    @Builder.Default
    private List<String> errors = new ArrayList<>();

    public static AiPlanValidationResult success() {
        return AiPlanValidationResult.builder()
                .valid(true)
                .errors(new ArrayList<>())
                .build();
    }

    public static AiPlanValidationResult fail(List<String> errors) {
        return AiPlanValidationResult.builder()
                .valid(false)
                .errors(errors != null ? errors : new ArrayList<>())
                .build();
    }

    public static AiPlanValidationResult fail(String error) {
        List<String> errors = new ArrayList<>();
        errors.add(error);
        return fail(errors);
    }
}
