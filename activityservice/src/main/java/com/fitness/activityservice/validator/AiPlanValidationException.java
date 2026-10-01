package com.fitness.activityservice.validator;

import lombok.Getter;

import java.util.List;

@Getter
public class AiPlanValidationException extends RuntimeException {

    private final List<String> errors;

    public AiPlanValidationException(List<String> errors) {
        super(errors != null && !errors.isEmpty() ? String.join("; ", errors) : "AI Plan validation failed");
        this.errors = errors;
    }

    public AiPlanValidationException(String message) {
        super(message);
        this.errors = List.of(message);
    }
}
