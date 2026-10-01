package com.fitness.activityservice.service;

import com.fitness.activityservice.model.ExerciseVideo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class VideoResolver {

    private final ExerciseCatalogService exerciseCatalogService;

    /**
     * Tra cứu và ghép video clip YouTube phù hợp nhất từ Video Catalog cho bài tập.
     *
     * @param exerciseCode  Mã bài tập chuẩn trong Catalog
     * @param userLevel     Trình độ người dùng (BEGINNER, INTERMEDIATE, ADVANCED)
     * @param userEquipment Danh sách dụng cụ người dùng sở hữu
     * @return youtubeVideoId hoặc null nếu không tìm thấy
     */
    public String resolveVideoId(String exerciseCode, String userLevel, List<String> userEquipment) {
        Optional<ExerciseVideo> videoOpt = exerciseCatalogService.findBestVideo(exerciseCode, userLevel, userEquipment);
        return videoOpt.map(ExerciseVideo::getYoutubeVideoId).orElse(null);
    }
}
