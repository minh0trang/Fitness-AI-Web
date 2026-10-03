package com.fitness.activityservice.service;

import com.fitness.activityservice.model.Exercise;
import com.fitness.activityservice.model.ExerciseVideo;
import com.fitness.activityservice.repository.ExerciseRepository;
import com.fitness.activityservice.repository.ExerciseVideoRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExerciseCatalogService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseVideoRepository exerciseVideoRepository;

    /**
     * Tra cứu bài tập trong Catalog theo mã chuẩn hóa.
     */
    public Optional<Exercise> getExerciseByCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return Optional.empty();
        }
        return exerciseRepository.findByCode(code.trim().toUpperCase());
    }

    /**
     * Tra cứu nhiều bài tập theo danh sách mã code.
     */
    public List<Exercise> getExercisesByCodes(Collection<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> upperCodes = codes.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toUpperCase)
                .toList();
        return exerciseRepository.findByCodeIn(upperCodes);
    }

    /**
     * Lấy toàn bộ danh sách mã bài tập chuẩn trong Catalog.
     */
    public List<String> getAllExerciseCodes() {
        return exerciseRepository.findAll().stream()
                .map(Exercise::getCode)
                .filter(Objects::nonNull)
                .toList();
    }

    /**
     * Tìm clip video phù hợp nhất cho bài tập dựa trên trình độ và dụng cụ của người dùng.
     */
    public Optional<ExerciseVideo> findBestVideo(String exerciseCode, String userLevel, List<String> userEquipment) {
        if (exerciseCode == null || exerciseCode.trim().isEmpty()) {
            return Optional.empty();
        }

        List<ExerciseVideo> videos = exerciseVideoRepository.findByExerciseCode(exerciseCode.trim().toUpperCase());
        if (videos.isEmpty()) {
            return Optional.empty();
        }

        Set<String> userEquipSet = userEquipment != null ? new HashSet<>(userEquipment) : Collections.emptySet();

        // Ưu tiên 1: Cùng trình độ (level) và dụng cụ nằm trong tập dụng cụ user có
        Optional<ExerciseVideo> exactMatch = videos.stream()
                .filter(v -> userLevel != null && userLevel.equalsIgnoreCase(v.getLevel()))
                .filter(v -> v.getEquipment() == null || v.getEquipment().isEmpty() || userEquipSet.containsAll(v.getEquipment()))
                .findFirst();

        if (exactMatch.isPresent()) {
            return exactMatch;
        }

        // Ưu tiên 2: Bất kỳ video nào phù hợp dụng cụ của user
        Optional<ExerciseVideo> equipMatch = videos.stream()
                .filter(v -> v.getEquipment() == null || v.getEquipment().isEmpty() || userEquipSet.containsAll(v.getEquipment()))
                .findFirst();

        if (equipMatch.isPresent()) {
            return equipMatch;
        }

        // Fallback: Trả về video đầu tiên có trong kho của bài tập này
        return Optional.of(videos.get(0));
    }

    /**
     * Tự động khởi tạo dữ liệu kho bài tập chuẩn khi catalog đang trống.
     */
    @PostConstruct
    public void initCatalogIfEmpty() {
        if (exerciseRepository.count() > 0) {
            log.info("Exercise Catalog already initialized with {} exercises.", exerciseRepository.count());
            return;
        }

        log.info("Initializing Exercise & Video Catalog with default fitness exercises...");

        // 1. Warm-up
        seedExerciseWithVideo(
                "WARMUP_DYNAMIC_STRETCH",
                "Khởi động khớp & Giãn cơ động",
                "Warmup",
                "BEGINNER",
                List.of("BODYWEIGHT"),
                "Bài khởi động toàn thân 5 phút kích hoạt khớp",
                "https://www.youtube.com/watch?v=y87vQ6kG70k",
                "y87vQ6kG70k",
                "https://img.youtube.com/vi/y87vQ6kG70k/hqdefault.jpg",
                300
        );

        seedExerciseWithVideo(
                "WARMUP_CARDIO_ACTIVATION",
                "Khởi động nâng nhịp tim nhẹ",
                "Warmup",
                "BEGINNER",
                List.of("BODYWEIGHT"),
                "Khởi động làm nóng cơ thể và tăng tuần hoàn máu",
                "https://www.youtube.com/watch?v=4vTj6pnd9v0",
                "4vTj6pnd9v0",
                "https://img.youtube.com/vi/4vTj6pnd9v0/hqdefault.jpg",
                300
        );

        // 2. Core & Abs
        seedExerciseWithVideo(
                "PLANK_BASIC",
                "Plank cẳng tay chuẩn form",
                "Core",
                "BEGINNER",
                List.of("BODYWEIGHT"),
                "Hướng dẫn Plank đúng tư thế không đau lưng",
                "https://www.youtube.com/watch?v=1f8yoFFdkLU",
                "1f8yoFFdkLU",
                "https://img.youtube.com/vi/1f8yoFFdkLU/hqdefault.jpg",
                600
        );

        seedExerciseWithVideo(
                "BICYCLE_CRUNCH",
                "Gập bụng đạp xe siết cơ liên sườn",
                "Core",
                "INTERMEDIATE",
                List.of("BODYWEIGHT"),
                "Bicycle Crunch siết eo thon gọn",
                "https://www.youtube.com/watch?v=1f8yoFFdkLU",
                "1f8yoFFdkLU",
                "https://img.youtube.com/vi/1f8yoFFdkLU/hqdefault.jpg",
                600
        );

        seedExerciseWithVideo(
                "BIRD_DOG",
                "Bài tập Bird-Dog ổn định cột sống",
                "Core",
                "BEGINNER",
                List.of("BODYWEIGHT"),
                "Bird Dog kích hoạt cơ lõi bảo vệ thắt lưng",
                "https://www.youtube.com/watch?v=1f8yoFFdkLU",
                "1f8yoFFdkLU",
                "https://img.youtube.com/vi/1f8yoFFdkLU/hqdefault.jpg",
                600
        );

        // 3. Chest & Upper Body
        seedExerciseWithVideo(
                "PUSH_UP",
                "Hít đất cơ bản",
                "Chest",
                "BEGINNER",
                List.of("BODYWEIGHT"),
                "Hướng dẫn hít đất cho người mới bắt đầu",
                "https://www.youtube.com/watch?v=IODxDxX7oi4",
                "IODxDxX7oi4",
                "https://img.youtube.com/vi/IODxDxX7oi4/hqdefault.jpg",
                600
        );

        seedExerciseWithVideo(
                "DUMBBELL_SHOULDER_PRESS",
                "Đẩy vai với tạ đơn",
                "Shoulders",
                "INTERMEDIATE",
                List.of("DUMBBELL"),
                "Hướng dẫn Dumbbell Shoulder Press chuẩn form",
                "https://www.youtube.com/watch?v=qEwKCR5JCog",
                "qEwKCR5JCog",
                "https://img.youtube.com/vi/qEwKCR5JCog/hqdefault.jpg",
                600
        );

        // 4. Legs & Glutes
        seedExerciseWithVideo(
                "BODYWEIGHT_SQUAT",
                "Squat thể trọng cơ bản",
                "Legs",
                "BEGINNER",
                List.of("BODYWEIGHT"),
                "Tập Squat đúng chuẩn cho người mới",
                "https://www.youtube.com/watch?v=aclHkVaku9U",
                "aclHkVaku9U",
                "https://img.youtube.com/vi/aclHkVaku9U/hqdefault.jpg",
                600
        );

        seedExerciseWithVideo(
                "GLUTE_BRIDGE",
                "Nâng hông Glute Bridge kích hoạt mông",
                "Legs",
                "BEGINNER",
                List.of("BODYWEIGHT"),
                "Glute Bridge siết mông không áp lực khớp gối",
                "https://www.youtube.com/watch?v=wPM8icPu6H8",
                "wPM8icPu6H8",
                "https://img.youtube.com/vi/wPM8icPu6H8/hqdefault.jpg",
                600
        );

        seedExerciseWithVideo(
                "LUNGE_WALKING",
                "Lunge bước tiến",
                "Legs",
                "INTERMEDIATE",
                List.of("BODYWEIGHT"),
                "Lunge săn chắc đùi trước và cơ mông",
                "https://www.youtube.com/watch?v=L8fvypPrzzs",
                "L8fvypPrzzs",
                "https://img.youtube.com/vi/L8fvypPrzzs/hqdefault.jpg",
                600
        );

        // 5. Cooldown & Recovery
        seedExerciseWithVideo(
                "COOLDOWN_STATIC_STRETCH",
                "Giãn cơ tĩnh & Hạ nhịp tim",
                "Cooldown",
                "BEGINNER",
                List.of("BODYWEIGHT"),
                "Bài giãn cơ phục hồi 8 phút sau tập",
                "https://www.youtube.com/watch?v=4vTj6pnd9v0",
                "4vTj6pnd9v0",
                "https://img.youtube.com/vi/4vTj6pnd9v0/hqdefault.jpg",
                480
        );

        seedExerciseWithVideo(
                "COOLDOWN_YOGA_FLOW",
                "Yoga thư giãn cơ bắp sau buổi tập",
                "Cooldown",
                "BEGINNER",
                List.of("BODYWEIGHT"),
                "Chuỗi động tác Yoga thư giãn lưng và khớp",
                "https://www.youtube.com/watch?v=4vTj6pnd9v0",
                "4vTj6pnd9v0",
                "https://img.youtube.com/vi/4vTj6pnd9v0/hqdefault.jpg",
                480
        );

        log.info("Exercise Catalog initialized successfully.");
    }

    private void seedExerciseWithVideo(
            String code, String name, String focus, String difficulty, List<String> equipment,
            String videoTitle, String youtubeUrl, String youtubeVideoId, String thumbnailUrl, int duration) {

        Exercise exercise = Exercise.builder()
                .code(code)
                .name(name)
                .focus(focus)
                .difficulty(difficulty)
                .equipment(new ArrayList<>(equipment))
                .build();
        Exercise savedExercise = exerciseRepository.save(exercise);

        ExerciseVideo video = ExerciseVideo.builder()
                .exerciseId(savedExercise.getId())
                .exerciseCode(savedExercise.getCode())
                .title(videoTitle)
                .youtubeUrl(youtubeUrl)
                .youtubeVideoId(youtubeVideoId)
                .thumbnailUrl(thumbnailUrl)
                .duration(duration)
                .level(difficulty)
                .equipment(new ArrayList<>(equipment))
                .build();
        exerciseVideoRepository.save(video);
    }
}
