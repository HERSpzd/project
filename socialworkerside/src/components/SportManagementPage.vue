<template>
  <div class="page">
    <!-- Left Sidebar (Remains the same) -->
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
          <el-menu-item index="/health-data">
            <el-icon><Monitor /></el-icon>
            <span>Health Data</span>
          </el-menu-item>

          <el-menu-item index="/health-knowledge/list">
            <el-icon><DocumentCopy /></el-icon>
            <span>Health Knowledge</span>
          </el-menu-item>

          <el-menu-item index="/user-management">
            <el-icon><Setting /></el-icon>
            <span>Elderly Users Overview</span>
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
      <!-- Page Title (Remains the same) -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Sports Management</h1>
          <span class="sub-title"
            >Track your workouts and book coaching sessions</span
          >
        </div>
      </div>

      <!-- Exercise History Card (Remains the same) -->
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
              prop="user_id"
              label="User ID"
              width="80"
            ></el-table-column>
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

      <!-- Coach Booking History Card (Remains the same) -->
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
              prop="user_id"
              label="User ID"
              width="80"
            ></el-table-column>
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
            <!-- Added Actions Column -->
            <el-table-column label="Actions" width="100">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDeleteBooking(scope.row)"
                  >Delete</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import {
  Platform,
  DocumentCopy,
  Setting,
  Monitor,
  Food,
  Basketball,
  ChatDotRound,
} from "@element-plus/icons-vue";

const store = useStore();

const userInfo = computed(() => store.getters.userInfo);
const isLoggedIn = computed(() => store.getters.isLoggedIn);

// --- Exercise History State and Logic ---
const exerciseHistory = ref([]);
const exerciseHistoryLoading = ref(false);
const exerciseHistoryError = ref(null);

const fetchExerciseHistory = async () => {
  exerciseHistoryLoading.value = true;
  exerciseHistoryError.value = null;
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      exerciseHistoryError.value = "Authentication required. Please log in.";
      ElMessage.warning(exerciseHistoryError.value);
      exerciseHistoryLoading.value = false;
      return;
    }

    const response = await axios.get(
      "http://localhost:3060/api/homecare2/all-exercise-history",
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
    if (err.response && err.response.status === 401) {
      exerciseHistoryError.value = "Authentication required. Please log in.";
      ElMessage.error(exerciseHistoryError.value);
    } else {
      exerciseHistoryError.value =
        "Network error, failed to load exercise history.";
      ElMessage.error(exerciseHistoryError.value);
    }
  } finally {
    exerciseHistoryLoading.value = false;
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

    if (!token) {
      bookingHistoryError.value = "Authentication required. Please log in.";
      ElMessage.warning(bookingHistoryError.value);
      bookingHistoryLoading.value = false;
      return;
    }

    const response = await axios.get(
      "http://localhost:3060/api/homecare2/all-booking-history",
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
    if (err.response && err.response.status === 401) {
      bookingHistoryError.value = "Authentication required. Please log in.";
      ElMessage.error(bookingHistoryError.value);
    } else {
      bookingHistoryError.value =
        "Network error, failed to load booking history.";
      ElMessage.error(bookingHistoryError.value);
    }
  } finally {
    bookingHistoryLoading.value = false;
  }
};

// --- Delete Booking Logic ---
const handleDeleteBooking = async (row) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete the booking?`,
      "Confirm Delete",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    const token = localStorage.getItem("token");
    if (!token) {
      ElMessage.warning("Authentication required. Please log in.");
      return;
    }

    // Call the backend API to delete the booking
    const response = await axios.delete(
      `http://localhost:3060/api/homecare2/booking/${row.booking_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success) {
      ElMessage.success("Booking deleted successfully.");
      fetchBookingHistory();
    } else {
      ElMessage.error(response.data.message || "Failed to delete booking.");
    }
  } catch (err) {
    if (err !== "cancel") {
      console.error("Error deleting booking:", err);
      if (err.response && err.response.status === 401) {
        ElMessage.error("Authentication required. Please log in.");
      } else if (err.response && err.response.status === 403) {
        ElMessage.error(
          "Access denied. You do not have permission to delete this booking."
        );
      } else {
        ElMessage.error("Network error or failed to delete booking.");
      }
    }
  }
};

onMounted(() => {
  if (isLoggedIn.value) {
    fetchExerciseHistory();
    fetchBookingHistory();
  }
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

/* User Info Bottom Styles */
.uInfo {
  display: flex;
  align-items: center;
  padding: 20px;
  color: #fff;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.uInfo span {
  margin-left: 10px;
  font-size: 16px;
}

.exercise-history-card,
.booking-history-card {
  margin-bottom: 24px;
}

.table-container {
  margin-top: 15px;
}
</style>
