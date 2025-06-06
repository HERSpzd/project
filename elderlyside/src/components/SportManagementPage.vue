<template>
  <div class="page">
    <el-aside width="220px" class="side">
      <!-- System Name -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu
          default-active="/sport-management"
          class="el-menu-1"
          :router="true"
        >
          <el-menu-item index="/home">
            <el-icon><Platform /></el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          <el-menu-item index="/health-monitoring">
            <el-icon><Monitor /></el-icon>
            <span>Health monitoring</span>
          </el-menu-item>
          <el-menu-item index="/health-knowledge">
            <el-icon><DocumentCopy /></el-icon>
            <span>Health Knowledge</span>
          </el-menu-item>
          <el-menu-item index="/user-settings">
            <el-icon><Setting /></el-icon>
            <span>User Settings</span>
          </el-menu-item>
          <el-menu-item index="/ai-consultation">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI Consultation</span>
          </el-menu-item>
          <el-menu-item index="/diet-management">
            <el-icon><Food /></el-icon>
            <span>Diet Management</span>
          </el-menu-item>
          <el-menu-item index="/sport-management">
            <el-icon><Basketball /></el-icon>
            <span>Sports Management</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- User Info (Bottom) -->
      <div class="uInfo" v-if="userInfo">
        <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        <span>{{ userInfo.username }}</span>
      </div>
    </el-aside>

    <!-- Main Content -->
    <div class="main">
      <!-- Page Title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Sports Management</h1>
          <span class="sub-title"
            >Track your workouts and book coaching sessions</span
          >
        </div>
      </div>

      <!-- Exercise Check-in Card -->
      <el-card class="check-in-card">
        <template #header>
          <div class="card-header">Exercise Check-in</div>
        </template>
        <p>Record your daily exercise activities.</p>
        <el-form :model="checkInForm" label-width="150px">
          <!-- Adjusted label-width -->
          <el-form-item label="Exercise Type">
            <el-select
              v-model="checkInForm.exerciseType"
              placeholder="Select exercise type"
            >
              <el-option label="Walking" value="walking"></el-option>
              <el-option label="Running" value="running"></el-option>
              <el-option label="Cycling" value="cycling"></el-option>
              <el-option label="Swimming" value="swimming"></el-option>
              <el-option label="Yoga" value="yoga"></el-option>
              <el-option label="Other" value="other"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Duration (minutes)">
            <el-input-number
              v-model="checkInForm.duration"
              :min="1"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="Notes">
            <el-input
              v-model="checkInForm.notes"
              type="textarea"
              :rows="2"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="handleCheckIn"
              :loading="checkInLoading"
              >Check In</el-button
            >
          </el-form-item>
        </el-form>

        <el-alert
          v-if="checkInResult"
          :title="checkInResult.title"
          :type="checkInResult.type"
          show-icon
          closable
          @close="checkInResult = null"
          style="margin-top: 15px"
        ></el-alert>
      </el-card>

      <!-- Exercise History Card -->
      <el-card class="exercise-history-card">
        <template #header>
          <div class="card-header">Exercise History</div>
        </template>

        <div v-if="exerciseHistoryLoading">
          <el-skeleton :rows="5" animated />
        </div>
        <el-alert
          v-else-if="exerciseHistoryError"
          :title="exerciseHistoryError"
          type="error"
          show-icon
        ></el-alert>
        <div v-else class="table-container">
          <el-table :data="exerciseHistory" style="width: 100%">
            <el-table-column
              prop="exercise_type"
              label="Exercise Type"
            ></el-table-column>
            <el-table-column
              prop="duration"
              label="Duration (minutes)"
              width="150"
            ></el-table-column>
            <el-table-column prop="notes" label="Notes"></el-table-column>
            <el-table-column
              prop="checkin_time"
              label="Check-in Time"
              width="180"
            ></el-table-column>
          </el-table>
        </div>
      </el-card>

      <!-- Coach Booking Card -->
      <el-card class="coach-booking-card">
        <template #header>
          <div class="card-header">Book a Coach</div>
        </template>
        <p>Find and book a personal coach.</p>

        <!-- Coach List -->
        <div v-if="coachesLoading">
          <el-skeleton :rows="3" animated />
        </div>
        <el-alert
          v-else-if="coachesError"
          :title="coachesError"
          type="error"
          show-icon
        ></el-alert>
        <div v-else class="coach-list">
          <el-card
            v-for="coach in coaches"
            :key="coach.coach_id"
            class="coach-card"
            shadow="hover"
            @click="openBookingDialog(coach)"
          >
            <img
              :src="coach.image_url"
              class="coach-avatar"
              alt="Coach Avatar"
            />
            <div class="coach-info">
              <h4>{{ coach.name }}</h4>
              <p>{{ coach.specialty }}</p>
              <el-tag size="small">{{ coach.availability }}</el-tag>
            </div>
          </el-card>
        </div>
      </el-card>

      <!-- Coach Booking History Card -->
      <el-card class="booking-history-card">
        <template #header>
          <div class="card-header">Coach Booking History</div>
        </template>

        <div v-if="bookingHistoryLoading">
          <el-skeleton :rows="5" animated />
        </div>
        <el-alert
          v-else-if="bookingHistoryError"
          :title="bookingHistoryError"
          type="error"
          show-icon
        ></el-alert>
        <div v-else class="table-container">
          <el-table :data="bookingHistory" style="width: 100%">
            <el-table-column
              prop="coach_name"
              label="Coach Name"
            ></el-table-column>
            <el-table-column
              prop="coach_specialty"
              label="Specialty"
            ></el-table-column>
            <el-table-column
              prop="booking_date"
              label="Date"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="booking_time"
              label="Time"
              width="100"
            ></el-table-column>
            <el-table-column prop="notes" label="Notes"></el-table-column>
            <el-table-column
              prop="status"
              label="Status"
              width="100"
            ></el-table-column>
            <el-table-column
              prop="created_at"
              label="Booking Time"
              width="180"
            ></el-table-column>
          </el-table>
        </div>
      </el-card>

      <!-- Coach Booking Dialog -->
      <el-dialog
        v-model="bookingDialogVisible"
        title="Book Coach"
        width="40%"
        center
      >
        <div v-if="selectedCoach">
          <h3>Booking Session with {{ selectedCoach.name }}</h3>
          <el-form :model="bookingForm" label-width="120px">
            <el-form-item label="Date">
              <el-date-picker
                v-model="bookingForm.date"
                type="date"
                placeholder="Select date"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="Time">
              <el-time-select
                v-model="bookingForm.time"
                start="09:00"
                step="00:30"
                end="21:00"
                placeholder="Select time"
              >
              </el-time-select>
            </el-form-item>
            <el-form-item label="Notes">
              <el-input
                v-model="bookingForm.notes"
                type="textarea"
                :rows="2"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="bookingDialogVisible = false">Cancel</el-button>
            <el-button
              type="primary"
              @click="confirmBooking"
              :loading="bookingLoading"
              >Confirm Booking</el-button
            >
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import axios from "axios";
import {
  Platform,
  DocumentCopy,
  Setting,
  Monitor,
  ChatDotRound,
  Food,
  Basketball,
} from "@element-plus/icons-vue";

const store = useStore();

const userInfo = computed(() => store.getters.userInfo);

// --- Exercise Check-in State and Logic ---
const checkInForm = ref({
  exerciseType: "",
  duration: 30,
  notes: "",
});
const checkInLoading = ref(false);
const checkInResult = ref(null);

const handleCheckIn = async () => {
  if (!checkInForm.value.exerciseType || !checkInForm.value.duration) {
    ElMessage.warning("Please select exercise type and duration.");
    return;
  }

  checkInLoading.value = true;
  checkInResult.value = null;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:3060/api/homecare2/checkin",
      checkInForm.value,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      checkInResult.value = {
        title: "Check-in successful!",
        type: "success",
      };
      checkInForm.value = { exerciseType: "", duration: 30, notes: "" };
      fetchExerciseHistory();
    } else {
      checkInResult.value = {
        title: response.data.message || "Check-in failed.",
        type: "error",
      };
      ElMessage.error(checkInResult.value.title);
    }
  } catch (err) {
    console.error("Error during check-in:", err);
    checkInResult.value = {
      title: "Network error, please try again later.",
      type: "error",
    };
    ElMessage.error(checkInResult.value.title);
  } finally {
    checkInLoading.value = false;
  }
};

// --- Exercise History State and Logic ---
const exerciseHistory = ref([]);
const exerciseHistoryLoading = ref(false);
const exerciseHistoryError = ref(null);

const fetchExerciseHistory = async () => {
  exerciseHistoryLoading.value = true;
  exerciseHistoryError.value = null;
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3060/api/homecare2/sports/history",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.data.success) {
      nextTick(() => {
        exerciseHistory.value = response.data.exerciseHistory;
      });
    } else {
      exerciseHistoryError.value =
        response.data.message || "Failed to fetch exercise history.";
      ElMessage.error(exerciseHistoryError.value);
    }
  } catch (err) {
    console.error("Error fetching exercise history:", err);
    exerciseHistoryError.value =
      "Network error, failed to load exercise history.";
    ElMessage.error(exerciseHistoryError.value);
  } finally {
    exerciseHistoryLoading.value = false;
  }
};

// --- Coach Booking State and Logic ---
const coaches = ref([]);
const coachesLoading = ref(false);
const coachesError = ref(null);

const selectedCoach = ref(null);
const bookingDialogVisible = ref(false);
const bookingForm = ref({
  date: "",
  time: "",
  notes: "",
});
const bookingLoading = ref(false);

// Function to fetch coaches from the backend
const fetchCoaches = async () => {
  coachesLoading.value = true;
  coachesError.value = null;
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3060/api/homecare2/coaches",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.data.success) {
      coaches.value = response.data.coaches;
    } else {
      coachesError.value = response.data.message || "Failed to fetch coaches.";
      ElMessage.error(coachesError.value);
    }
  } catch (err) {
    console.error("Error fetching coaches:", err);
    coachesError.value = "Network error, failed to load coaches.";
    ElMessage.error(coachesError.value);
  } finally {
    coachesLoading.value = false;
  }
};

const openBookingDialog = (coach) => {
  selectedCoach.value = coach;
  bookingDialogVisible.value = true;
  // Reset booking form
  bookingForm.value = { date: "", time: "", notes: "" };
};

const confirmBooking = async () => {
  if (
    !selectedCoach.value ||
    !bookingForm.value.date ||
    !bookingForm.value.time
  ) {
    ElMessage.warning("Please select a coach, date, and time.");
    return;
  }

  bookingLoading.value = true;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:3060/api/homecare2/book-coach",
      {
        coachId: selectedCoach.value.coach_id,
        date: bookingForm.value.date,
        time: bookingForm.value.time,
        notes: bookingForm.value.notes,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      ElMessage.success("Coach booked successfully!");
      bookingDialogVisible.value = false;
      fetchBookingHistory();
    } else {
      ElMessage.error(response.data.message || "Failed to book coach.");
    }
  } catch (err) {
    console.error("Error during coach booking:", err);
    let errorMessage = "Network error, please try again later.";
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    ElMessage.error(errorMessage);
  } finally {
    bookingLoading.value = false;
  }
};

// --- Coach Booking History State and Logic ---
const bookingHistory = ref([]);
const bookingHistoryLoading = ref(false);
const bookingHistoryError = ref(null);

const fetchBookingHistory = async () => {
  bookingHistoryLoading.value = true;
  bookingHistoryError.value = null;
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3060/api/homecare2/booking-history",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.data.success) {
      nextTick(() => {
        bookingHistory.value = response.data.bookingHistory;
      });
    } else {
      bookingHistoryError.value =
        response.data.message || "Failed to fetch booking history.";
      ElMessage.error(bookingHistoryError.value);
    }
  } catch (err) {
    console.error("Error fetching booking history:", err);
    bookingHistoryError.value =
      "Network error, failed to load booking history.";
    ElMessage.error(bookingHistoryError.value);
  } finally {
    bookingHistoryLoading.value = false;
  }
};

onMounted(() => {
  fetchCoaches();
  fetchExerciseHistory();
  fetchBookingHistory();
});
</script>

<style scoped>
.page {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.side {
  width: 220px;
  background-color: #001529;
  border-right: none;
  transition: width 0.28s;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 10;
}

.sTitle {
  color: #fff;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.menuWrap {
  height: calc(100vh - 180px);
  overflow: auto;
}

.el-menu {
  border-right: none;
  background-color: #001529;
  flex: 1;
}

.el-menu-item,
.el-sub-menu__title {
  color: rgba(255, 255, 255, 0.65);
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  background-color: #000c17;
  color: #fff;
}

.el-menu-item.is-active {
  background-color: #1890ff;
  color: #fff;
}

.el-sub-menu.is-active .el-sub-menu__title {
  color: #fff;
}

.el-menu--inline {
  background-color: #000c17 !important;
}

.el-menu--inline .el-menu-item:hover {
  background-color: #002a4d !important;
  color: #fff;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 220px;
  min-height: 100%;
}

.el-menu-item .el-icon,
.el-sub-menu__title .el-icon {
  vertical-align: middle;
  margin-right: 10px;
  width: 24px;
  text-align: center;
  font-size: 18px;
}

.el-sub-menu .el-menu-item {
  min-width: 220px;
  padding-left: 48px !important;
}

.main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-left: 220px;
}

.pHeader {
  margin-bottom: 24px;
}

.hTitle h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
  font-weight: 600;
}

.sub-title {
  color: #606266;
  font-size: 14px;
  margin-top: 4px;
}

.el-card {
  margin-bottom: 24px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.uInfo {
  display: flex;
  align-items: center;
  padding: 20px;
  color: #fff;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.uInfo span {
  margin-left: 10px;
  font-size: 16px;
}

.sport-management-page .el-card {
  margin-bottom: 24px;
}

.check-in-card .el-form,
.coach-booking-card .el-form {
  margin-top: 15px;
}

.coach-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.coach-card {
  cursor: pointer;
  padding: 15px;
  text-align: center;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.coach-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
  border: 2px solid #409eff;
}

.coach-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.coach-info p {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.coach-info .el-tag {
  margin-top: 5px;
}

.dialog-footer {
  text-align: right;
}

.el-form-item__label {
  font-size: 14px;
  color: #606266;
}

.table-container {
  margin-top: 15px;
}
</style>
