import axios from "axios";

// Primary access via API Gateway (port 8080), fallback to user-service direct (port 8081) if needed
const GATEWAY_URL = "http://localhost:8080/api/users";

const getHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Auto-sync Keycloak authenticated user with backend PostgreSQL database.
 * Returns user identity and whether the physical profile is completed.
 */
export async function syncUserWithBackend(token, userData) {
  try {
    const payload = {
      keycloakId: userData.keycloakId || userData.sub,
      email: userData.email,
      firstName: userData.firstName || userData.given_name || "",
      lastName: userData.lastName || userData.family_name || "",
    };

    const response = await axios.post(`${GATEWAY_URL}/sync`, payload, {
      headers: getHeaders(token),
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.warn("Backend user sync failed (services might be starting):", error?.message);
    return null;
  }
}

/**
 * Fetch physical profile, body biometrics, and workout constraints.
 */
export async function getUserProfile(token, keycloakId) {
  try {
    const response = await axios.get(`${GATEWAY_URL}/${keycloakId}/profile`, {
      headers: getHeaders(token),
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.warn("Failed to fetch user profile from backend:", error?.message);
    return null;
  }
}

/**
 * Save / Update physical profile and mark onboarding completed.
 */
export async function updateUserProfile(token, keycloakId, profileData) {
  const response = await axios.put(`${GATEWAY_URL}/${keycloakId}/profile`, profileData, {
    headers: getHeaders(token),
    timeout: 8000,
  });
  return response.data;
}
