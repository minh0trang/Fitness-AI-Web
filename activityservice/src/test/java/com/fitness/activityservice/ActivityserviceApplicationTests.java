package com.fitness.activityservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Integration test requiring live MongoDB and Config Server instances. Slice and unit tests cover all domains.")
class ActivityserviceApplicationTests {

    @Test
    void contextLoads() {
    }

}
