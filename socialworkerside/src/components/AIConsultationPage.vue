<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Left Sidebar -->
    <el-aside width="220px" class="side">
      <!-- System Name -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu
          default-active="/ai-consultation"
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

    <!-- Main Content (AI Consultation Page - Table View) -->
    <div class="main">
      <!-- Page Title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>AI Consultation History</h1>
          <span class="sub-title">View all AI consultation records</span>
        </div>
      </div>

      <el-card class="ai-consultation-card">
        <template #header>
          <div class="card-header">AI Consultation Records</div>
        </template>

        <div v-if="historyLoading">
          <el-skeleton :rows="5" animated />
        </div>
        <el-alert
          v-else-if="historyError"
          :title="historyError"
          type="error"
          show-icon
        ></el-alert>
        <div v-else class="table-container">
          <el-table :data="consultationHistory" style="width: 100%">
            <el-table-column
              prop="user_id"
              label="User ID"
              width="80"
            ></el-table-column>
            <el-table-column
              prop="username"
              label="Username"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="question"
              label="User Question"
            ></el-table-column>
            <el-table-column prop="answer" label="AI Answer"></el-table-column>
            <el-table-column
              prop="timestamp"
              label="Timestamp"
              width="180"
            ></el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
  <div v-else>
    <h1>Please log in</h1>
    <el-button type="primary" @click="goToLogin">Go to Login</el-button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { ElMessage } from "element-plus";
import {
  Platform,
  DocumentCopy,
  Setting,
  Monitor,
  ChatDotRound,
  Food,
  Basketball,
} from "@element-plus/icons-vue";

const router = useRouter();
const store = useStore();

const isLoggedIn = computed(() => store.getters.isLoggedIn);
const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};

const consultationHistory = ref([]);
const historyLoading = ref(false);
const historyError = ref(null);

const allConsultationHistoryApiUrl = ref(
  "http://localhost:3060/api/homecare2/all-ai-consultation-history"
);

const fetchAllConsultationHistory = async () => {
  historyLoading.value = true;
  historyError.value = null;
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      historyError.value = "Authentication required. Please log in.";
      ElMessage.warning(historyError.value);
      historyLoading.value = false;
      return;
    }

    const response = await axios.get(allConsultationHistoryApiUrl.value, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      consultationHistory.value = response.data.history;
    } else {
      historyError.value =
        response.data.message || "Failed to fetch consultation history.";
      ElMessage.error(historyError.value);
    }
  } catch (error) {
    console.error("Error fetching consultation history:", error);
    if (error.response && error.response.status === 401) {
      historyError.value = "Authentication required. Please log in.";
      ElMessage.error(historyError.value);
    } else {
      historyError.value =
        "Network error, failed to load consultation history.";
      ElMessage.error(historyError.value);
    }
  } finally {
    historyLoading.value = false;
  }
};

onMounted(() => {
  if (isLoggedIn.value) {
    fetchAllConsultationHistory();
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

.ai-consultation-card {
  margin-bottom: 20px;
}

.table-container {
  margin-top: 15px;
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
