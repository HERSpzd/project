<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Left navigation bar (Social Worker User) -->
    <el-aside width="220px" class="side">
      <!-- System Name -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu
          default-active="/user-management"
          class="el-menu-vertical-demo"
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

      <!-- User Information (Bottom) -->
      <div class="uInfo" v-if="userInfo">
        <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        <span>{{ userInfo.username }}</span>
      </div>
    </el-aside>

    <!-- Main Content Area (User Management Page) -->
    <div class="main">
      <!-- Page Title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Overview of Elderly Users</h1>
          <span class="sub-title"
            >Help you gain a comprehensive view of elderly users</span
          >
        </div>
      </div>

      <!-- User List -->
      <el-card class="user-management-card">
        <template #header>
          <div class="card-header">
            <span>User List</span>
          </div>
        </template>

        <div v-if="loading">
          <el-skeleton :rows="5" animated />
        </div>
        <el-card v-else-if="error" class="error-message">
          Failed to load user list, please try again later.
        </el-card>
        <div v-else>
          <el-table
            :data="elderlyUsers"
            style="width: 100%"
            :row-key="(row) => row.id"
            default-expand-all
          >
            <el-table-column prop="id" label="ID" width="50" />
            <el-table-column prop="username" label="Username" width="100" />
            <el-table-column prop="email" label="Email" width="180" />
            <el-table-column prop="phone" label="Phone" width="120" />
            <el-table-column prop="user_type" label="User type" width="120" />
            <el-table-column prop="first_name" label="First name" width="80" />
            <el-table-column prop="last_name" label="Last name" width="80" />
            <el-table-column prop="date_of_birth" label="DOB" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.date_of_birth) }}
              </template>
            </el-table-column>
            <el-table-column prop="gender" label="Gender" width="60" />
            <el-table-column prop="address" label="Address" width="180" />
            <el-table-column prop="city" label="City" width="100" />
            <el-table-column prop="state" label="State" width="80" />
            <el-table-column prop="zip_code" label="Zip_code" width="80" />
            <el-table-column
              prop="emergency_contact_name"
              label="Emergency Contact Name"
              width="120"
            />
            <el-table-column
              prop="emergency_contact_phone"
              label="Emergency Contact Phone"
              width="120"
            />
            <el-table-column prop="allergies" label="Allergies" width="200" />
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
  <div v-else>
    <h1>Please log in first</h1>
    <el-button type="primary" @click="goToLogin">Go login</el-button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex"; // Import useStore
import {
  Platform,
  DocumentCopy,
  Setting,
  Monitor,
  ChatDotRound,
  Food,
  Basketball,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const store = useStore();

const isLoggedIn = computed(() => store.getters.isLoggedIn);

const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};

const userApiUrl = ref("http://localhost:3060/api/homecare/users");
const users = ref([]);
const loading = ref(true);
const error = ref(false);

const fetchUsers = async () => {
  loading.value = true;
  error.value = false;
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(userApiUrl.value, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        "API response error:",
        response.status,
        response.statusText
      );
      throw new Error(`API request failed, status code: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      users.value = data.data;
    } else {
      console.error("API returned error: ", data.message);
      ElMessage.error(data.message || "Failed to retrieve user list");
      error.value = true;
    }
  } catch (err) {
    console.error("API request error: ", err);
    ElMessage.error("Network error, please try again later");
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const elderlyUsers = computed(() => {
  return users.value.filter((user) => user.user_type === "elderly");
});

onMounted(() => {
  fetchUsers();
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
  /* Match sidebar */
  flex: 1;
}

.el-menu-item,
.el-sub-menu__title {
  color: rgba(255, 255, 255, 0.65);
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  background-color: #000c17;
  /* Darker hover */
  color: #fff;
}

.el-menu-item.is-active {
  background-color: #1890ff;
  /* Active color */
  color: #fff;
}

.el-sub-menu.is-active .el-sub-menu__title {
  /* Keep parent active color */
  color: #fff;
}

/* Submenu background */
.el-menu--inline {
  background-color: #000c17 !important;
}

.el-menu--inline .el-menu-item {
  background-color: #000c17 !important;
  color: rgba(255, 255, 255, 0.65);
}

.el-menu--inline .el-menu-item:hover {
  background-color: #001529 !important;
  /* Slightly lighter hover */
  color: #fff;
}

.el-menu--inline .el-menu-item.is-active {
  background-color: #1890ff !important;
  /* Active color */
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
  /* Increased spacing */
  width: 24px;
  text-align: center;
  font-size: 18px;
}

.el-sub-menu .el-menu-item {
  min-width: 220px;
  /* Ensure submenu items fill width */
  padding-left: 48px !important;
  /* Indent submenu items */
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
  /* Bold header */
  color: #303133;
  font-size: 16px;
}

.card-header .el-link {
  font-size: 14px;
  font-weight: normal;
}

.user-management-card {
  margin-bottom: 0;
}

.el-table {
  padding: 0;
}

.el-card {
  margin-bottom: 20px;
  border-radius: 4px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-card__header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.content {
  color: #666;
  padding: 16px;
  line-height: 1.6;
}

.card-footer {
  font-size: 12px;
  color: #999;
  padding: 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 8px;
}

.el-tag {
  background-color: #ecf5ff;
  color: #409eff;
  border: none;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  padding: 15px;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  margin-bottom: 15px;
}

.main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
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
</style>
