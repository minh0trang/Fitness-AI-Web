package com.fitness.activityservice.service;

import com.fitness.activityservice.model.Exercise;
import com.fitness.activityservice.model.ExerciseVideo;
import com.fitness.activityservice.repository.ExerciseRepository;
import com.fitness.activityservice.repository.ExerciseVideoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExerciseCatalogServiceTest {

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private ExerciseVideoRepository exerciseVideoRepository;

    @InjectMocks
    private ExerciseCatalogService exerciseCatalogService;

    private Exercise sampleExercise;
    private ExerciseVideo sampleVideoBeginner;
    private ExerciseVideo sampleVideoIntermediate;

    @BeforeEach
    void setUp() {
        sampleExercise = Exercise.builder()
                .id("ex-001")
                .code("PUSH_UP")
                .name("Hít đất cơ bản")
                .focus("Chest")
                .difficulty("BEGINNER")
                .equipment(List.of("BODYWEIGHT"))
                .build();

        sampleVideoBeginner = ExerciseVideo.builder()
                .id("vid-001")
                .exerciseId("ex-001")
                .exerciseCode("PUSH_UP")
                .title("Hít đất cho người mới")
                .youtubeUrl("https://youtube.com/watch?v=IODxDxX7oi4")
                .youtubeVideoId("IODxDxX7oi4")
                .level("BEGINNER")
                .equipment(List.of("BODYWEIGHT"))
                .duration(300)
                .build();

        sampleVideoIntermediate = ExerciseVideo.builder()
                .id("vid-002")
                .exerciseId("ex-001")
                .exerciseCode("PUSH_UP")
                .title("Hít đất nâng cao biến thể")
                .youtubeUrl("https://youtube.com/watch?v=advance")
                .youtubeVideoId("advance")
                .level("INTERMEDIATE")
                .equipment(List.of("BODYWEIGHT", "DUMBBELL"))
                .duration(400)
                .build();
    }

    @Test
    @DisplayName("getExerciseByCode - Tìm thấy bài tập theo mã (case-insensitive và trim)")
    void testGetExerciseByCode_Found() {
        when(exerciseRepository.findByCode("PUSH_UP")).thenReturn(Optional.of(sampleExercise));

        Optional<Exercise> result = exerciseCatalogService.getExerciseByCode(" push_up ");

        assertThat(result).isPresent();
        assertThat(result.get().getCode()).isEqualTo("PUSH_UP");
        assertThat(result.get().getName()).isEqualTo("Hít đất cơ bản");
    }

    @Test
    @DisplayName("getExerciseByCode - Trả về empty khi mã không tồn tại")
    void testGetExerciseByCode_NotFound() {
        when(exerciseRepository.findByCode("UNKNOWN_EX")).thenReturn(Optional.empty());

        Optional<Exercise> result = exerciseCatalogService.getExerciseByCode("UNKNOWN_EX");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getExercisesByCodes - Tra cứu nhiều bài tập theo danh sách mã code")
    void testGetExercisesByCodes() {
        when(exerciseRepository.findByCodeIn(List.of("PUSH_UP", "SQUAT")))
                .thenReturn(List.of(sampleExercise));

        List<Exercise> results = exerciseCatalogService.getExercisesByCodes(Arrays.asList("push_up", "SQUAT"));

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCode()).isEqualTo("PUSH_UP");
    }

    @Test
    @DisplayName("findBestVideo - Ưu tiên video khớp cả level và equipment của user")
    void testFindBestVideo_ExactMatch() {
        when(exerciseVideoRepository.findByExerciseCode("PUSH_UP"))
                .thenReturn(List.of(sampleVideoBeginner, sampleVideoIntermediate));

        Optional<ExerciseVideo> result = exerciseCatalogService.findBestVideo("PUSH_UP", "BEGINNER", List.of("BODYWEIGHT"));

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo("vid-001");
        assertThat(result.get().getLevel()).isEqualTo("BEGINNER");
    }

    @Test
    @DisplayName("findBestVideo - Video khớp equipment khi level không trùng")
    void testFindBestVideo_EquipmentMatchOnly() {
        when(exerciseVideoRepository.findByExerciseCode("PUSH_UP"))
                .thenReturn(List.of(sampleVideoBeginner, sampleVideoIntermediate));

        // User ADVANCED nhưng chỉ có BODYWEIGHT -> chọn sampleVideoBeginner vì sampleVideoIntermediate đòi DUMBBELL
        Optional<ExerciseVideo> result = exerciseCatalogService.findBestVideo("PUSH_UP", "ADVANCED", List.of("BODYWEIGHT"));

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo("vid-001");
    }

    @Test
    @DisplayName("findBestVideo - Trả về empty khi không có video nào cho mã bài tập")
    void testFindBestVideo_NoVideos() {
        when(exerciseVideoRepository.findByExerciseCode("UNKNOWN_CODE")).thenReturn(Collections.emptyList());

        Optional<ExerciseVideo> result = exerciseCatalogService.findBestVideo("UNKNOWN_CODE", "BEGINNER", List.of("BODYWEIGHT"));

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("initCatalogIfEmpty - Tự động seed dữ liệu khi kho bài tập trống")
    void testInitCatalogIfEmpty_SeedsWhenEmpty() {
        when(exerciseRepository.count()).thenReturn(0L);
        when(exerciseRepository.save(any(Exercise.class))).thenAnswer(i -> {
            Exercise ex = i.getArgument(0);
            ex.setId("gen-id-" + ex.getCode());
            return ex;
        });

        exerciseCatalogService.initCatalogIfEmpty();

        verify(exerciseRepository, atLeast(5)).save(any(Exercise.class));
        verify(exerciseVideoRepository, atLeast(5)).save(any(ExerciseVideo.class));
    }

    @Test
    @DisplayName("initCatalogIfEmpty - Bỏ qua seed khi kho bài tập đã có dữ liệu")
    void testInitCatalogIfEmpty_SkipsWhenNotEmpty() {
        when(exerciseRepository.count()).thenReturn(10L);

        exerciseCatalogService.initCatalogIfEmpty();

        verify(exerciseRepository, never()).save(any(Exercise.class));
        verify(exerciseVideoRepository, never()).save(any(ExerciseVideo.class));
    }
}
