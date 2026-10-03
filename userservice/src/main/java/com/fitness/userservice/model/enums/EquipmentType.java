package com.fitness.userservice.model.enums;

public enum EquipmentType {
    BODYWEIGHT,        // Không dụng cụ
    DUMBBELL,          // Tạ đơn
    BARBELL,           // Tạ đòn
    RESISTANCE_BAND,   // Dây kháng lực
    CABLE_MACHINE,     // Máy cáp
    MACHINE,           // Máy tập
    SMITH_MACHINE,     // Máy Smith
    TRX,               // TRX

    // Legacy values kept for database backward compatibility
    YOGA_MAT,
    CHAIR_WALL,
    KETTLEBELL,
    SWISS_BALL
}
