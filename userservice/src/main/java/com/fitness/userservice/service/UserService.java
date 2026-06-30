package com.fitness.userservice.service;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.model.User;
import com.fitness.userservice.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserService {
        @Autowired
        private UserRepository userRepository;
    public UserResponse register(@Valid RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());

        User saveUser=userRepository.save(user);
        UserResponse userResponse=new UserResponse();
        userResponse.setId(saveUser.getId());
        userResponse.setEmail(saveUser.getEmail());
        userResponse.setFirstname(saveUser.getFirstname());
        userResponse.setLastname(saveUser.getLastname());
        userResponse.setPassword(saveUser.getPassword());
        userResponse.setCreatedAt(saveUser.getCreatedAt());
        userResponse.setUpdatedAt(saveUser.getUpdatedAt());
        return userResponse;
    }
    public UserResponse getUserProfile(String userId) {
        User user=userRepository.findById(userId)
                        .orElseThrow(()->new RuntimeException("User not found"));
        UserResponse userResponse=new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstname(user.getFirstname());
        userResponse.setLastname(user.getLastname());
        userResponse.setPassword(user.getPassword());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setUpdatedAt(user.getUpdatedAt());
        return userResponse;
    }

    public Boolean existByUserId(String userId) {
        log.info("Calling User Validation API for a userID: " + userId);
        return userRepository.existsById(userId);
    }
}
