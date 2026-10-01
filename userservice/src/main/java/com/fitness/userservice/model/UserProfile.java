package com.fitness.userservice.model;

import com.fitness.userservice.model.enums.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "user_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private Integer age;

    private Double height;

    private Double weight;

    private Double chest;

    private Double waist;

    private Double hips;

    @Enumerated(EnumType.STRING)
    private ActivityLevel activityLevel;

    @Enumerated(EnumType.STRING)
    private FitnessGoal fitnessGoal;

    @Column(length = 1000)
    private String customWishes;

    private String workoutDuration;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_selected_days", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "day_number")
    @Builder.Default
    private List<Integer> selectedDays = new ArrayList<>();

    @ElementCollection(targetClass = PhysicalLimitation.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_limitations", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "limitation")
    @Builder.Default
    private Set<PhysicalLimitation> limitations = new HashSet<>();

    @ElementCollection(targetClass = EquipmentType.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_equipment", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "equipment")
    @Builder.Default
    private Set<EquipmentType> equipment = new HashSet<>();

    @Column(name = "is_profile_completed", nullable = false)
    @Builder.Default
    private Boolean isProfileCompleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
