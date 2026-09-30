/**
 * Kho video bài tập tuyển chọn (Curated Catalog) từ các Fitness YouTuber uy tín
 */
export const WORKOUT_LIBRARY = {
  warmups: [
    {
      id: "wu_01",
      type: "warmup",
      youtubeVideoId: "d3LPrhI0v-w", // 5 Min Warm Up for at Home Workouts
      title: "5 Phút Khởi Động Toàn Thân & Làm Nóng Khớp",
      channel: "MadFit",
      durationMinutes: 5,
      estimatedCalories: 30,
      description: "Làm nóng các khớp cổ tay, gối, vai và kích hoạt nhịp tim nhẹ nhàng.",
      isOptional: true,
    },
    {
      id: "wu_02",
      type: "warmup",
      youtubeVideoId: "2pLT-olgUJs",
      title: "7 Phút Kích Hoạt Cơ Bắp Động Tác Nhẹ Nhàng",
      channel: "Pamela Reif",
      durationMinutes: 7,
      estimatedCalories: 45,
      description: "Khởi động và làm giãn sơ các bó cơ trước bài tập cường độ cao.",
      isOptional: true,
    },
  ],
  mains: [
    {
      id: "main_hiit_20",
      type: "main",
      youtubeVideoId: "2MoGxae-zyo",
      title: "20 Min Full Body HIIT Fat Burn - No Equipment",
      channel: "BullyJuice",
      targetMuscle: "Toàn thân & Tim mạch",
      level: "Trung cấp",
      durationMinutes: 20,
      estimatedCalories: 260,
      intensity: "Đốt mỡ cao",
      equipment: "Không cần dụng cụ",
      description: "Chuỗi bài tập HIIT liên tục giúp tối ưu hóa lượng calo đốt cháy.",
      isOptional: false,
    },
    {
      id: "main_waist_15",
      type: "main",
      youtubeVideoId: "L_xrDAtykMI",
      title: "15 Min Standing Abs & Slim Waist Workout",
      channel: "Emi Wong",
      targetMuscle: "Bụng & Siết eo",
      level: "Mới bắt đầu",
      durationMinutes: 15,
      estimatedCalories: 140,
      intensity: "Vừa sức",
      equipment: "Không cần dụng cụ",
      description: "Tập trung các động tác siết eo đứng thon gọn vòng 2 hiệu quả.",
      isOptional: false,
    },
    {
      id: "main_abs_10",
      type: "main",
      youtubeVideoId: "UBMk30rjy0o",
      title: "10 Min Sixpack & Flat Belly Burn",
      channel: "Pamela Reif",
      targetMuscle: "Cơ bụng trên & dưới",
      level: "Trung cấp",
      durationMinutes: 10,
      estimatedCalories: 110,
      intensity: "Cường độ vừa - Cao",
      equipment: "Thảm tập",
      description: "10 phút siết chặt cơ bụng tạo rãnh cơ số 11 săn chắc.",
      isOptional: false,
    },
    {
      id: "main_dumbbell_20",
      type: "main",
      youtubeVideoId: "AnYl6Nk9GOA",
      title: "20 Min Full Body Dumbbell Tone & Strength",
      channel: "Juice & Toya",
      targetMuscle: "Thân trên & Chân mông",
      level: "Trung cấp",
      durationMinutes: 20,
      estimatedCalories: 230,
      intensity: "Kháng lực với tạ",
      equipment: "Tạ đơn (Dumbbells)",
      description: "Săn chắc bắp tay, vai và định hình phom người chuẩn với tạ.",
      isOptional: false,
    },
    {
      id: "main_cardio_25",
      type: "main",
      youtubeVideoId: "ml6cT4AZdqI",
      title: "25 Min Fat Burning Cardio & Core",
      channel: "MadFit",
      targetMuscle: "Toàn thân & Sức bền",
      level: "Trung cấp",
      durationMinutes: 25,
      estimatedCalories: 280,
      intensity: "Cardio nhịp tim",
      equipment: "Không cần dụng cụ",
      description: "Đốt mỡ toàn diện kết hợp săn chắc vùng cơ bụng.",
      isOptional: false,
    },
  ],
  cooldowns: [
    {
      id: "cd_01",
      type: "cooldown",
      youtubeVideoId: "2pLT-olgUJs", // 15 Min Daily Stretch Pamela Reif
      title: "10 Phút Giãn Cơ Toàn Thân & Phục Hồi Khớp",
      channel: "Pamela Reif",
      durationMinutes: 10,
      estimatedCalories: 45,
      description: "Giúp nhịp tim trở lại bình thường và giảm đau mỏi cơ sau tập.",
      isOptional: true,
    },
    {
      id: "cd_02",
      type: "cooldown",
      youtubeVideoId: "g_tea8ZNk5A", // 10 Min Cool Down Stretch MadFit
      title: "10 Phút Thả Lỏng & Hạ Nhiệt Nhịp Tim",
      channel: "MadFit",
      durationMinutes: 10,
      estimatedCalories: 40,
      description: "Hạ nhiệt cơ thể và giải phóng căng thẳng vùng thắt lưng, đùi.",
      isOptional: true,
    },
  ],
};

/**
 * Lịch tập tuần mẫu với Cấu trúc Buổi tập nhiều video (Khởi động -> 1-2 Bài chính -> Giãn cơ)
 */
export const DEFAULT_WEEKLY_SCHEDULE = [
  {
    dayIndex: 1,
    dayName: "Thứ Hai",
    shortName: "T2",
    dateStr: "29/09",
    status: "completed", // 'completed' | 'today' | 'upcoming' | 'rest'
    focusTitle: "Đốt Mỡ Toàn Thân & Siết Eo",
    warmup: WORKOUT_LIBRARY.warmups[0],
    mainWorkouts: [
      WORKOUT_LIBRARY.mains[0], // 20 min BullyJuice
      WORKOUT_LIBRARY.mains[1], // 15 min Emi Wong
    ],
    cooldown: WORKOUT_LIBRARY.cooldowns[0],
    totalMinutes: 47,
    totalCalories: 465,
    userRating: 5,
    userFeeling: "energetic",
    userNote: "Đốt mỡ cực đã, cơ bụng mỏi nhừ nhưng cảm giác sảng khoái!",
    checkInPhoto: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
  },
  {
    dayIndex: 2,
    dayName: "Thứ Ba",
    shortName: "T3",
    dateStr: "30/09",
    status: "today",
    focusTitle: "Tập Trung Rãnh Bụng & Thon Gọn Eo",
    warmup: WORKOUT_LIBRARY.warmups[1],
    mainWorkouts: [
      WORKOUT_LIBRARY.mains[1], // 15 min Emi Wong
      WORKOUT_LIBRARY.mains[2], // 10 min Pamela Reif Abs
    ],
    cooldown: WORKOUT_LIBRARY.cooldowns[1],
    totalMinutes: 37,
    totalCalories: 330,
    userRating: null,
    userFeeling: null,
    userNote: null,
    checkInPhoto: null,
  },
  {
    dayIndex: 3,
    dayName: "Thứ Tư",
    shortName: "T4",
    dateStr: "01/10",
    status: "rest", // Ngày nghỉ
    focusTitle: "Nghỉ Ngơi Phục Hồi Cơ Bắp 🧘",
    warmup: null,
    mainWorkouts: [],
    cooldown: null,
    totalMinutes: 0,
    totalCalories: 0,
    userRating: null,
    userFeeling: null,
    userNote: null,
    checkInPhoto: null,
  },
  {
    dayIndex: 4,
    dayName: "Thứ Năm",
    shortName: "T5",
    dateStr: "02/10",
    status: "upcoming",
    focusTitle: "Kháng Lực Tạ Đơn & Săn Chắc Tay Vai",
    warmup: WORKOUT_LIBRARY.warmups[0],
    mainWorkouts: [
      WORKOUT_LIBRARY.mains[3], // 20 min Dumbbell
    ],
    cooldown: WORKOUT_LIBRARY.cooldowns[0],
    totalMinutes: 32,
    totalCalories: 295,
    userRating: null,
    userFeeling: null,
    userNote: null,
    checkInPhoto: null,
  },
  {
    dayIndex: 5,
    dayName: "Thứ Sáu",
    shortName: "T6",
    dateStr: "03/10",
    status: "upcoming",
    focusTitle: "Cardio Tim Mạch Đốt Mỡ Thần Tốc",
    warmup: WORKOUT_LIBRARY.warmups[1],
    mainWorkouts: [
      WORKOUT_LIBRARY.mains[4], // 25 min MadFit Cardio
    ],
    cooldown: WORKOUT_LIBRARY.cooldowns[1],
    totalMinutes: 37,
    totalCalories: 350,
    userRating: null,
    userFeeling: null,
    userNote: null,
    checkInPhoto: null,
  },
  {
    dayIndex: 6,
    dayName: "Thứ Bảy",
    shortName: "T7",
    dateStr: "04/10",
    status: "upcoming",
    focusTitle: "Tổng Hợp Full Body Thể Lực",
    warmup: WORKOUT_LIBRARY.warmups[0],
    mainWorkouts: [
      WORKOUT_LIBRARY.mains[0], // 20 min HIIT
    ],
    cooldown: WORKOUT_LIBRARY.cooldowns[0],
    totalMinutes: 32,
    totalCalories: 325,
    userRating: null,
    userFeeling: null,
    userNote: null,
    checkInPhoto: null,
  },
  {
    dayIndex: 0,
    dayName: "Chủ Nhật",
    shortName: "CN",
    dateStr: "05/10",
    status: "rest",
    focusTitle: "Nghỉ Ngơi & Tái Tạo Năng Lượng 🌿",
    warmup: null,
    mainWorkouts: [],
    cooldown: null,
    totalMinutes: 0,
    totalCalories: 0,
    userRating: null,
    userFeeling: null,
    userNote: null,
    checkInPhoto: null,
  },
];

/**
 * Lịch hoạt động theo tháng (Monthly Activity Calendar Data - Tháng 9/2026)
 * Các trạng thái: 'completed' (xanh), 'missed' (đỏ/cam), 'rest' (xám), 'today' (viền xanh), 'future' (trắng)
 */
export const MONTHLY_CALENDAR_DATA = [
  { dayNumber: 1, status: "completed", calories: 420, title: "HIIT & Core Burn", rating: 5, photo: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80", note: "Khởi đầu tháng 9 tuyệt vời!" },
  { dayNumber: 2, status: "rest", calories: 0, title: "Nghỉ ngơi" },
  { dayNumber: 3, status: "completed", calories: 350, title: "Siết Eo & Mông Đùi", rating: 4, photo: null, note: "Tập trung gồng cơ bụng." },
  { dayNumber: 4, status: "missed", calories: 0, title: "Bỏ lỡ", note: "Bận việc đột xuất không tập được." },
  { dayNumber: 5, status: "completed", calories: 480, title: "Kháng Lực & Tạ Đơn", rating: 5, photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80", note: "Lưng xô và vai rất căng nét." },
  { dayNumber: 6, status: "completed", calories: 310, title: "Cardio Giảm Mỡ", rating: 4, photo: null },
  { dayNumber: 7, status: "rest", calories: 0, title: "Nghỉ ngơi" },

  { dayNumber: 8, status: "completed", calories: 390, title: "Cardio & Eo Thon", rating: 5, photo: null },
  { dayNumber: 9, status: "completed", calories: 440, title: "Full Body HIIT", rating: 5, photo: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80", note: "Cân nặng đã giảm 0.5kg!" },
  { dayNumber: 10, status: "rest", calories: 0, title: "Nghỉ ngơi" },
  { dayNumber: 11, status: "missed", calories: 0, title: "Bỏ lỡ", note: "Người hơi mệt sau chuyến công tác." },
  { dayNumber: 12, status: "completed", calories: 370, title: "Siết Eo & Cơ Bụng", rating: 4, photo: null },
  { dayNumber: 13, status: "completed", calories: 450, title: "Tạ Đơn & Kháng Lực", rating: 5, photo: null },
  { dayNumber: 14, status: "rest", calories: 0, title: "Nghỉ ngơi" },

  { dayNumber: 15, status: "completed", calories: 410, title: "Cardio Đốt Mỡ", rating: 5, photo: null },
  { dayNumber: 16, status: "completed", calories: 360, title: "Cơ Bụng Săn Chắc", rating: 4, photo: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80", note: "Vòng eo đo lại giảm được 1.5cm!" },
  { dayNumber: 17, status: "rest", calories: 0, title: "Nghỉ ngơi" },
  { dayNumber: 18, status: "completed", calories: 430, title: "HIIT Sức Bền", rating: 5, photo: null },
  { dayNumber: 19, status: "completed", calories: 380, title: "Tạ Đơn Thân Trên", rating: 4, photo: null },
  { dayNumber: 20, status: "completed", calories: 450, title: "Cardio Toàn Thân", rating: 5, photo: null },
  { dayNumber: 21, status: "rest", calories: 0, title: "Nghỉ ngơi" },

  { dayNumber: 22, status: "completed", calories: 400, title: "Siết Eo Rãnh Bụng", rating: 5, photo: null },
  { dayNumber: 23, status: "completed", calories: 420, title: "HIIT Nâng Cao", rating: 5, photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80" },
  { dayNumber: 24, status: "rest", calories: 0, title: "Nghỉ ngơi" },
  { dayNumber: 25, status: "completed", calories: 390, title: "Kháng Lực Toàn Thân", rating: 4, photo: null },
  { dayNumber: 26, status: "missed", calories: 0, title: "Bỏ lỡ" },
  { dayNumber: 27, status: "completed", calories: 460, title: "Cardio Cuối Tuần", rating: 5, photo: null },
  { dayNumber: 28, status: "rest", calories: 0, title: "Nghỉ ngơi" },

  { dayNumber: 29, status: "completed", calories: 465, title: "Đốt Mỡ Toàn Thân & Siết Eo", rating: 5, photo: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80", note: "Đốt mỡ cực đã, cơ bụng mỏi nhừ nhưng cảm giác sảng khoái!" },
  { dayNumber: 30, status: "today", calories: 330, title: "Tập Trung Rãnh Bụng & Thon Gọn Eo", isToday: true },
];

export const WEEKLY_CHART_DATA = [
  { day: "T2", date: "16/9", calories: 410, minutes: 40 },
  { day: "T3", date: "17/9", calories: 360, minutes: 35 },
  { day: "T4", date: "18/9", calories: 0, minutes: 0 },
  { day: "T5", date: "19/9", calories: 430, minutes: 42 },
  { day: "T6", date: "20/9", calories: 380, minutes: 35 },
  { day: "T7", date: "21/9", calories: 450, minutes: 45 },
  { day: "CN", date: "22/9", calories: 0, minutes: 0 },
  { day: "T2", date: "23/9", calories: 400, minutes: 38 },
  { day: "T3", date: "24/9", calories: 420, minutes: 40 },
  { day: "T4", date: "25/9", calories: 0, minutes: 0 },
  { day: "T5", date: "26/9", calories: 390, minutes: 35 },
  { day: "T6", date: "27/9", calories: 0, minutes: 0 },
  { day: "T7", date: "28/9", calories: 460, minutes: 45 },
  { day: "CN", date: "29/9", calories: 465, minutes: 47, isToday: true },
];

export const INITIAL_JOURNAL_ENTRIES = [
  {
    id: "j_1",
    date: "29/09/2026",
    workoutTitle: "Đốt Mỡ Toàn Thân & Siết Eo",
    durationMinutes: 47,
    caloriesBurned: 465,
    rating: 5,
    feeling: "energetic",
    feelingLabel: "Tràn đầy năng lượng 🔥",
    notes: "Đốt mỡ cực đã, cơ bụng mỏi nhừ nhưng cảm giác sảng khoái!",
    checkInPhoto: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
    encouragement: "Tuyệt vời lắm! Mỗi giọt mồ hôi hôm nay là một bước tiến gần hơn đến vóc dáng mơ ước! 🌟",
  },
];

/**
 * Hồ sơ thể lực mặc định
 */
export const DEFAULT_USER_PROFILE = {
  name: "Minh Trang",
  gender: "female",
  age: 24,
  height: 162,
  weight: 53,
  bust: 84,
  waist: 65,
  hips: 90,
  activityLevel: "light",
  fitnessGoal: "Tập trung giảm 3cm vòng eo và săn chắc cơ thể",
  customWishes: "Mong muốn giảm 3cm vòng eo trước cuối tháng sau, hạn chế các bài nhảy mạnh tránh đau khớp gối.",
};

export const WEIGHT_HISTORY_DATA = {
  startWeight: 72.0,
  currentWeight: 70.5,
  goalWeight: 68.0,
  unit: "kg",
  history: [
    { date: "01/9", weight: 72.0 },
    { date: "08/9", weight: 71.6 },
    { date: "15/9", weight: 71.2 },
    { date: "22/9", weight: 70.8 },
    { date: "29/9", weight: 70.5, isNow: true },
  ],
};

/**
 * Sinh lịch tập 7 ngày thông minh với AI dựa trên ngày tập, thời lượng và tags hạn chế
 */
export function generateAiWeeklyPlan(config = {}) {
  const {
    selectedDays = [1, 2, 4, 5, 7], // T2, T3, T5, T6, CN
    duration = "30-45",
    tags = ["knee_pain", "no_jumping", "bodyweight", "yoga_mat"],
    limitations = [],
    equipment = [],
    fitnessGoal = "Tập trung giảm 3cm vòng eo và săn chắc cơ thể",
    customWishes = "",
  } = config;

  const dayNames = [
    { dayIndex: 1, dayName: "Thứ Hai", shortName: "T2", dateStr: "29/09" },
    { dayIndex: 2, dayName: "Thứ Ba", shortName: "T3", dateStr: "30/09" },
    { dayIndex: 3, dayName: "Thứ Tư", shortName: "T4", dateStr: "01/10" },
    { dayIndex: 4, dayName: "Thứ Năm", shortName: "T5", dateStr: "02/10" },
    { dayIndex: 5, dayName: "Thứ Sáu", shortName: "T6", dateStr: "03/10" },
    { dayIndex: 6, dayName: "Thứ Bảy", shortName: "T7", dateStr: "04/10" },
    { dayIndex: 7, dayName: "Chủ Nhật", shortName: "CN", dateStr: "05/10" },
  ];

  const themes = [
    { title: "Đốt Mỡ Low-Impact & Siết Eo An Toàn Khớp", mains: [WORKOUT_LIBRARY.mains[0], WORKOUT_LIBRARY.mains[1]] },
    { title: "Tập Trung Rãnh Bụng & Thon Gọn Eo Không Nhảy", mains: [WORKOUT_LIBRARY.mains[1], WORKOUT_LIBRARY.mains[2]] },
    { title: "Kháng Lực Thân Trên & Định Hình Bắp Tay Săn Chắc", mains: [WORKOUT_LIBRARY.mains[3]] },
    { title: "Cardio Nhịp Tim Nhẹ Nhàng Phù Hợp Chung Cư", mains: [WORKOUT_LIBRARY.mains[4]] },
    { title: "Pilates Siết Core Toàn Diện & Phục Hồi Thắt Lưng", mains: [WORKOUT_LIBRARY.mains[1], WORKOUT_LIBRARY.mains[0]] },
    { title: "Cardio Đốt Mỡ Thần Tốc & Bảo Vệ Khớp Gối", mains: [WORKOUT_LIBRARY.mains[4]] },
    { title: "Giãn Cơ Phục Hồi & Thon Gọn Vóc Dáng Cuối Tuần", mains: [WORKOUT_LIBRARY.mains[1]] },
  ];

  return dayNames.map((d, idx) => {
    const isWorkoutDay = selectedDays.includes(d.dayIndex);
    const theme = themes[idx % themes.length];

    if (!isWorkoutDay) {
      return {
        ...d,
        status: "rest",
        focusTitle: "Nghỉ Ngơi Phục Hồi Cơ Bắp 🧘",
        warmup: null,
        mainWorkouts: [],
        cooldown: null,
        totalMinutes: 0,
        totalCalories: 0,
        userRating: null,
        userFeeling: null,
        userNote: null,
        checkInPhoto: null,
      };
    }

    const warmup = WORKOUT_LIBRARY.warmups[idx % WORKOUT_LIBRARY.warmups.length];
    const cooldown = WORKOUT_LIBRARY.cooldowns[idx % WORKOUT_LIBRARY.cooldowns.length];

    let selectedMains = theme.mains;
    if (duration === "15-20") {
      selectedMains = [theme.mains[0]];
    } else if (duration === "45-60") {
      selectedMains = theme.mains.length >= 2 ? theme.mains : [theme.mains[0], WORKOUT_LIBRARY.mains[2]];
    }

    const mainMinutes = selectedMains.reduce((acc, m) => acc + (m.durationMinutes || 0), 0);
    const mainCalories = selectedMains.reduce((acc, m) => acc + (m.estimatedCalories || 0), 0);

    const totalMinutes = (warmup?.durationMinutes || 0) + mainMinutes + (cooldown?.durationMinutes || 0);
    const totalCalories = (warmup?.estimatedCalories || 0) + mainCalories + (cooldown?.estimatedCalories || 0);

    let status = "upcoming";
    if (d.dayIndex === 2) status = "today";
    else if (d.dayIndex === 1) status = "completed";

    return {
      ...d,
      status,
      focusTitle: theme.title,
      warmup,
      mainWorkouts: selectedMains,
      cooldown,
      totalMinutes,
      totalCalories,
      userRating: d.dayIndex === 1 ? 5 : null,
      userFeeling: d.dayIndex === 1 ? "energetic" : null,
      userNote: d.dayIndex === 1 ? "Đốt mỡ cực đã, cơ bụng mỏi nhừ nhưng cảm giác sảng khoái!" : null,
      checkInPhoto: d.dayIndex === 1 ? "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80" : null,
    };
  });
}
