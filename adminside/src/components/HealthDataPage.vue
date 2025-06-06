<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Left Sidebar -->
    <el-aside width="220px" class="side">
      <!-- System Name -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu default-active="/health-data" class="el-menu-1" :router="true">
          <el-menu-item index="/home">
            <el-icon><Platform /></el-icon>
            <span>System Overview</span>
          </el-menu-item>
          <el-menu-item index="/health-data">
            <el-icon><Monitor /></el-icon>
            <span>Health Data Overview</span>
          </el-menu-item>

          <el-sub-menu index="/health-knowledge">
            <template #title>
              <el-icon><DocumentCopy /></el-icon>
              <span>Health Knowledge</span>
            </template>
            <el-menu-item index="/health-knowledge/publish"
              >Publish</el-menu-item
            >
            <el-menu-item index="/health-knowledge/list">List</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/user-management">
            <el-icon><Setting /></el-icon>
            <span>User Management</span>
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
      <div class="uInfo">
        <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        <span>{{ userInfo.username }}</span>
      </div>
    </el-aside>

    <!-- Main Content (Health Data Management Page) -->
    <div class="main">
      <!-- Page Title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Health Data Management</h1>
          <span class="sub-title">Manage health data of elderly people</span>
        </div>
      </div>

      <!-- Blood Pressure History Data List -->
      <el-card class="health-data-card">
        <template #header>
          <div class="card-header">
            <span>Blood Pressure History Data</span>
          </div>
        </template>
        <div v-if="bloodPressureLoading">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="bloodPressureError" class="error-message">
          Failed to load blood pressure data. Please try again later.
        </div>
        <div v-else>
          <el-table :data="bloodPressureData" style="width: 100%">
            <el-table-column prop="created_at" label="Time" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="user_id" label="User ID" width="80" />
            <el-table-column prop="username" label="Username" width="100" />
            <el-table-column prop="first_name" label="First Name" width="100" />
            <el-table-column prop="last_name" label="Last Name" width="100" />
            <el-table-column
              prop="date_of_birth"
              label="Date of Birth"
              width="120"
            >
              <template #default="scope">
                {{ formatDate(scope.row.date_of_birth) }}
              </template>
            </el-table-column>
            <el-table-column prop="gender" label="Gender" width="60" />
            <el-table-column prop="systolic" label="Systolic" width="80" />
            <el-table-column prop="diastolic" label="Diastolic" width="80" />
            <el-table-column prop="pulse" label="Pulse" width="80" />
          </el-table>
        </div>
      </el-card>

      <!-- Blood Sugar History Data List -->
      <el-card class="health-data-card">
        <template #header>
          <div class="card-header">
            <span>Blood Glucose History Data</span>
          </div>
        </template>
        <div v-if="bloodSugarLoading">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="bloodSugarError" class="error-message">
          Failed to load blood glucose data. Please try again later.
        </div>
        <div v-else>
          <el-table :data="bloodSugarData" style="width: 100%">
            <el-table-column prop="created_at" label="Time" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="user_id" label="User ID" width="80" />
            <el-table-column prop="username" label="Username" width="100" />
            <el-table-column prop="first_name" label="First Name" width="100" />
            <el-table-column prop="last_name" label="Last Name" width="100" />
            <el-table-column
              prop="date_of_birth"
              label="Date of Birth"
              width="120"
            >
              <template #default="scope">
                {{ formatDate(scope.row.date_of_birth) }}
              </template>
            </el-table-column>
            <el-table-column prop="gender" label="Gender" width="60" />
            <el-table-column prop="bloodSugar" label="Blood Sugar" width="80" />
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
  <div v-else>
    <h1>Please log in</h1>
    <!-- You can add a link to jump to the login page -->
    <el-button type="primary" @click="goToLogin">Go to Login</el-button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  Platform,
  DocumentCopy,
  Setting,
  Monitor,
  Food,
  Basketball,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const store = useStore();

// Get isLoggedIn value
const isLoggedIn = computed(() => store.getters.isLoggedIn);

// Get user information
const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};

// API Address
const historyDataApiUrl = ref(
  "http://localhost:3060/api/homecare/history-data-2"
); // Replace with your historical data API address

// Blood pressure data
const bloodPressureData = ref([]);
const bloodPressureLoading = ref(true);
const bloodPressureError = ref(false);

// Blood sugar data
const bloodSugarData = ref([]);
const bloodSugarLoading = ref(true);
const bloodSugarError = ref(false);

// Get historical data
const fetchHistoryData = async () => {
  bloodPressureLoading.value = true;
  bloodPressureError.value = false;
  bloodSugarLoading.value = true;
  bloodSugarError.value = false;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(historyDataApiUrl.value, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.success) {
      bloodPressureData.value = data.bloodPressureData;
      bloodSugarData.value = data.bloodSugarData;
    } else {
      ElMessage.error(data.message || "Failed to get historical data");
      bloodPressureError.value = true;
      bloodSugarError.value = true;
    }
  } catch (error) {
    console.error("An error occurred while getting historical data:", error);
    ElMessage.error(
      "A network error occurred while getting historical data, please try again later"
    );
    bloodPressureError.value = true;
    bloodSugarError.value = true;
  } finally {
    bloodPressureLoading.value = false;
    bloodSugarLoading.value = false;
  }
};

// Format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
    date.getSeconds()
  ).padStart(2, "0")}`;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

onMounted(() => {
  fetchHistoryData();
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

.el-menu--inline .el-menu-item {
  background-color: #000c17 !important;
  color: rgba(255, 255, 255, 0.65);
}

.el-menu--inline .el-menu-item:hover {
  background-color: #001529 !important;
  color: #fff;
}

.el-menu--inline .el-menu-item.is-active {
  background-color: #1890ff !important;
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

.card-header span {
  font-weight: normal;
}

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

.health-data-card {
  margin-bottom: 20px;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  padding: 15px;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  margin-bottom: 15px;
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
</style>
