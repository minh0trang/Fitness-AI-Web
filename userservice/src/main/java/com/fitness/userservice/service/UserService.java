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
            User existingUser=userRepository.findByEmail(request.getEmail());
            UserResponse userResponse=new UserResponse();
            userResponse.setId(existingUser.getId());
            userResponse.setKeycloackId(existingUser.getKeycloackId());
            userResponse.setEmail(existingUser.getEmail());
            userResponse.setFirstname(existingUser.getFirstname());
            userResponse.setLastname(existingUser.getLastname());
            userResponse.setPassword(existingUser.getPassword());
            userResponse.setCreatedAt(existingUser.getCreatedAt());
            userResponse.setUpdatedAt(existingUser.getUpdatedAt());
            return userResponse;
        }
        User user = new User();
        user.setFirstname(request.getFirstName());
        user.setLastname(request.getLastName());
        user.setKeycloackId(request.getKeycloakId());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());

        User saveUser=userRepository.save(user);
        UserResponse userResponse=new UserResponse();
        userResponse.setId(saveUser.getId());
        userResponse.setKeycloackId(saveUser.getKeycloackId());
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
        return userRepository.existsByKeycloackId(userId);
    }
}
