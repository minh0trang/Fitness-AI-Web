/**
 * Tính toán BMR theo công thức Mifflin-St Jeor
 * @param {number} weight - Cân nặng (kg)
 * @param {number} height - Chiều cao (cm)
 * @param {number} age - Tuổi
 * @param {string} gender - 'male' hoặc 'female'
 * @returns {number} BMR (kcal/ngày)
 */
export function calculateBMR(weight, height, age, gender = 'male') {
  if (!weight || !height || !age) return 0;
  const base = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/**
 * Hệ số vận động theo lối sống
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: { factor: 1.2, label: 'Ít vận động (nhân viên văn phòng)' },
  light: { factor: 1.375, label: 'Vận động nhẹ (1 - 3 ngày/tuần)' },
  moderate: { factor: 1.55, label: 'Vận động vừa phải (3 - 5 ngày/tuần)' },
  active: { factor: 1.725, label: 'Năng động / Thể thao ngoài trời (6 - 7 ngày/tuần)' },
};

/**
 * Tính toán TDEE
 * @param {number} bmr - Chỉ số BMR
 * @param {string} activityLevel - 'sedentary' | 'light' | 'moderate' | 'active'
 * @returns {number} TDEE (kcal/ngày)
 */
export function calculateTDEE(bmr, activityLevel = 'moderate') {
  if (!bmr) return 0;
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.375;
  return Math.round(bmr * multiplier);
}

/**
 * Tính toán BMI
 */
export function calculateBMI(weight, height) {
  if (!weight || !height) return 0;
  const heightInMeters = Number(height) / 100;
  return (Number(weight) / (heightInMeters * heightInMeters)).toFixed(1);
}
