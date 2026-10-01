package com.fitness.userservice.service;

import com.fitness.userservice.dto.UserProfileDto;
import com.fitness.userservice.dto.UserSyncRequest;
import com.fitness.userservice.dto.UserSyncResponse;
import com.fitness.userservice.model.User;
import com.fitness.userservice.model.UserProfile;
import com.fitness.userservice.model.enums.*;
import com.fitness.userservice.repository.UserProfileRepository;
import com.fitness.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @InjectMocks
    private UserService userService;

    private User mockUser;
    private UserProfile mockProfile;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId("u-12345");
        mockUser.setKeycloackId("kc-test-user-999");
        mockUser.setEmail("alex@example.com");
        mockUser.setFirstname("Alex");
        mockUser.setLastname("Fitness");
        mockUser.setPassword("KEYCLOAK_MANAGED");

        mockProfile = UserProfile.builder()
                .id("p-99999")
                .user(mockUser)
                .age(28)
                .height(175.0)
                .weight(70.0)
                .chest(95.0)
                .waist(78.0)
                .hips(92.0)
                .gender(Gender.MALE)
                .activityLevel(ActivityLevel.LIGHT)
                .fitnessGoal(FitnessGoal.FAT_LOSS)
                .experience(ExperienceLevel.BEGINNER)
                .workoutPreferences(new HashSet<>(Arrays.asList(WorkoutPreference.CARDIO, WorkoutPreference.PILATES)))
                .workoutDuration("30-45p")
                .selectedDays(Arrays.asList(1, 3, 5))
                .limitations(new HashSet<>(Collections.singletonList(PhysicalLimitation.KNEE_PAIN)))
                .equipment(new HashSet<>(Arrays.asList(EquipmentType.BODYWEIGHT, EquipmentType.DUMBBELL)))
                .customWishes("Tập trung giảm mỡ bụng, hạn chế nhảy")
                .isProfileCompleted(true)
                .build();
    }

    @Test
    @DisplayName("syncUser - Khi User mới hoàn toàn từ Keycloak, tạo User và UserProfile với isProfileCompleted = false")
    void testSyncUser_NewUser() {
        UserSyncRequest request = UserSyncRequest.builder()
                .keycloakId("kc-test-user-999")
                .email("alex@example.com")
                .firstName("Alex")
                .lastName("Fitness")
                .build();

        when(userProfileRepository.findByUserKeycloackId(request.getKeycloakId())).thenReturn(Optional.empty());
        when(userRepository.existsByKeycloackId(request.getKeycloakId())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        UserProfile incompleteProfile = UserProfile.builder()
                .user(mockUser)
                .isProfileCompleted(false)
                .build();
        when(userProfileRepository.findByUserId(mockUser.getId())).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(incompleteProfile);

        UserSyncResponse response = userService.syncUser(request);

        assertThat(response).isNotNull();
        assertThat(response.getKeycloakId()).isEqualTo("kc-test-user-999");
        assertThat(response.getEmail()).isEqualTo("alex@example.com");
        assertThat(response.getIsProfileCompleted()).isFalse();

        verify(userRepository, times(1)).save(any(User.class));
        verify(userProfileRepository, times(1)).save(any(UserProfile.class));
    }

    @Test
    @DisplayName("syncUser - Khi User đã tồn tại và đã hoàn thành Profile, trả về isProfileCompleted = true")
    void testSyncUser_ExistingUserCompletedProfile() {
        UserSyncRequest request = UserSyncRequest.builder()
                .keycloakId("kc-test-user-999")
                .email("alex@example.com")
                .build();

        when(userProfileRepository.findByUserKeycloackId(request.getKeycloakId())).thenReturn(Optional.of(mockProfile));
        when(userProfileRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockProfile));

        UserSyncResponse response = userService.syncUser(request);

        assertThat(response).isNotNull();
        assertThat(response.getIsProfileCompleted()).isTrue();
        assertThat(response.getKeycloakId()).isEqualTo("kc-test-user-999");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("getUserProfile - Lấy profile hợp lệ thành công")
    void testGetUserProfile_Success() {
        when(userProfileRepository.findByUserKeycloackId("kc-test-user-999")).thenReturn(Optional.of(mockProfile));

        UserProfileDto dto = userService.getUserProfile("kc-test-user-999");

        assertThat(dto).isNotNull();
        assertThat(dto.getAge()).isEqualTo(28);
        assertThat(dto.getHeight()).isEqualTo(175.0);
        assertThat(dto.getWeight()).isEqualTo(70.0);
        assertThat(dto.getGender()).isEqualTo("MALE");
        assertThat(dto.getActivityLevel()).isEqualTo("LIGHT");
        assertThat(dto.getFitnessGoal()).isEqualTo("FAT_LOSS");
        assertThat(dto.getExperience()).isEqualTo("BEGINNER");
        assertThat(dto.getWorkoutPreferences()).contains("CARDIO", "PILATES");
        assertThat(dto.getWorkoutDuration()).isEqualTo("30-45p");
        assertThat(dto.getLimitations()).contains("KNEE_PAIN");
        assertThat(dto.getEquipment()).contains("BODYWEIGHT", "DUMBBELL");
        assertThat(dto.getCustomWishes()).isEqualTo("Tập trung giảm mỡ bụng, hạn chế nhảy");
        assertThat(dto.getIsProfileCompleted()).isTrue();
    }

    @Test
    @DisplayName("getUserProfile - Ném RuntimeException khi không tìm thấy Profile")
    void testGetUserProfile_NotFound() {
        when(userProfileRepository.findByUserKeycloackId("unknown-id")).thenReturn(Optional.empty());
        when(userProfileRepository.findByUserId("unknown-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserProfile("unknown-id"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Profile not found");
    }

    @Test
    @DisplayName("updateUserProfile - Cập nhật số đo, ràng buộc và đánh dấu isProfileCompleted = true")
    void testUpdateUserProfile_Success() {
        UserProfileDto updateDto = UserProfileDto.builder()
                .age(29)
                .height(176.0)
                .weight(68.5)
                .waist(75.0)
                .gender("MALE")
                .activityLevel("MODERATE")
                .fitnessGoal("STRENGTH")
                .experience("INTERMEDIATE")
                .workoutPreferences(new HashSet<>(Arrays.asList("STRENGTH", "HIIT")))
                .workoutDuration("45-60p")
                .selectedDays(Arrays.asList(1, 2, 4, 6))
                .limitations(new HashSet<>(Collections.singletonList("LOWER_BACK")))
                .equipment(new HashSet<>(Arrays.asList("BODYWEIGHT", "RESISTANCE_BAND")))
                .customWishes("Cải thiện cơ liên sườn")
                .build();

        when(userProfileRepository.findByUserKeycloackId("kc-test-user-999")).thenReturn(Optional.of(mockProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileDto result = userService.updateUserProfile("kc-test-user-999", updateDto);

        assertThat(result).isNotNull();
        assertThat(result.getAge()).isEqualTo(29);
        assertThat(result.getHeight()).isEqualTo(176.0);
        assertThat(result.getWeight()).isEqualTo(68.5);
        assertThat(result.getWaist()).isEqualTo(75.0);
        assertThat(result.getGender()).isEqualTo("MALE");
        assertThat(result.getActivityLevel()).isEqualTo("MODERATE");
        assertThat(result.getFitnessGoal()).isEqualTo("STRENGTH");
        assertThat(result.getExperience()).isEqualTo("INTERMEDIATE");
        assertThat(result.getWorkoutPreferences()).contains("STRENGTH", "HIIT");
        assertThat(result.getWorkoutDuration()).isEqualTo("45-60p");
        assertThat(result.getSelectedDays()).containsExactly(1, 2, 4, 6);
        assertThat(result.getLimitations()).contains("LOWER_BACK");
        assertThat(result.getEquipment()).contains("BODYWEIGHT", "RESISTANCE_BAND");
        assertThat(result.getCustomWishes()).isEqualTo("Cải thiện cơ liên sườn");
        assertThat(result.getIsProfileCompleted()).isTrue();

        verify(userProfileRepository, times(1)).save(mockProfile);
    }
}
