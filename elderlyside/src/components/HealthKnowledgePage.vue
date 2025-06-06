<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Sidebar -->
    <el-aside width="220px" class="side">
      <!-- System -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu
          default-active="/health-knowledge"
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

      <!-- User Information (Bottom) -->
      <div class="uInfo" v-if="userInfo">
        <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        <span>{{ userInfo.username }}</span>
      </div>
    </el-aside>

    <!-- ain Content Area (Elderly User side) -->
    <div class="main">
      <!-- title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Health knowledge</h1>
          <span class="sub-title">Get the latest health information</span>
        </div>
      </div>

      <!-- Health Knowledge Details -->
      <el-card class="kCard">
        <div v-if="loading">
          <el-skeleton :rows="5" animated />
        </div>
        <el-card v-else-if="error" class="err">
          Failed to load health knowledge, please try again later.
        </el-card>
        <div v-else>
          <el-list>
            <el-list-item
              v-for="knowledge in knowledgeList"
              :key="knowledge.id"
              @click="goToDetail(knowledge.id)"
              style="cursor: pointer"
            >
              <el-card shadow="hover" class="kItemCard">
                <template #header>
                  <div class="card-header">
                    <span>{{ knowledge.title }}</span>
                    <el-tag size="small">{{ knowledge.category }}</el-tag>
                  </div>
                </template>
                <div class="kContent">{{ knowledge.contentSnippet }}...</div>
                <div class="kFooter">
                  <span>Release time: {{ knowledge.formattedTime }}</span>
                </div>
              </el-card>
            </el-list-item>
          </el-list>
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
import { useStore } from "vuex";
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

const knowledgeApiUrl = ref(
  "http://localhost:3060/api/homecare/health-knowledge"
);

const knowledgeList = ref([]);
const loading = ref(true);
const error = ref(false);

const fetchKnowledge = async () => {
  loading.value = true;
  error.value = false;
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(knowledgeApiUrl.value, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        "API response error: ",
        response.status,
        response.statusText
      );
      throw new Error(`API request failed, status code: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      knowledgeList.value = data.data.map((item) => ({
        ...item,
        id: item.health_knowledge_id,
        contentSnippet: item.content.substring(0, 50),
        formattedTime:
          new Date(item.publish_time).toLocaleDateString() +
          " " +
          new Date(item.publish_time).toLocaleTimeString(),
      }));
    } else {
      console.error("API returned error: ", data.message);
      ElMessage.error(data.message || "Failed to acquire health knowledge");
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

const goToDetail = (health_knowledge_id) => {
  router.push({ path: `/health-knowledge-detail/${health_knowledge_id}` });
};

onMounted(() => {
  fetchKnowledge();
});
</script>

<style scoped>
.page {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.side {
  background-color: #001529;
  border-right: none;
  transition: width 0.28s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
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
  overflow-y: auto;
}

/* Override ElMenu default styles for dark theme */
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
  height: calc(100vh - 48px);
}

.pHeader {
  margin-bottom: 24px;
}

.hTitle h1 {
  margin: 0;
  font-size: 22px;
  /* Slightly smaller for admin */
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

/* KPI Card Styles */
.kpiRow {
  margin-bottom: 0;
  /* Remove bottom margin if cards have enough */
}

.kpiCard .el-card__body {
  padding: 15px 20px;
  /* Adjust padding */
}

.kItem {
  display: flex;
  align-items: center;
}

.kIcon {
  font-size: 36px;
  /* Larger icons */
  padding: 10px;
  margin-right: 15px;
  border-radius: 4px;
  color: #fff;
}

.icon-user {
  background-color: #409eff;
}

.icon-device {
  background-color: #67c23a;
}

.icon-alert {
  background-color: #f56c6c;
}

.icon-task {
  background-color: #e6a23c;
}

.kText {
  display: flex;
  flex-direction: column;
}

.kVal {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.kLabel {
  font-size: 14px;
  color: #606266;
}

.kpiCard.kpi-critical .kVal {
  color: #f56c6c;
  /* Highlight critical value */
}

/* Quick Access & System Notifications */
.qaBtns .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.qaBtns .el-icon {
  margin-right: 4px;
}

.system-notifications-card .el-card__body {
  padding-top: 10px;
  padding-bottom: 10px;
  max-height: 250px;
  /* Limit height and make scrollable if needed */
  overflow-y: auto;
}

.notification-timeline {
  padding-left: 5px;
  /* Adjust timeline padding */
}

.el-timeline-item__timestamp {
  font-size: 12px;
  /* Smaller timestamp */
}

/* Style for timeline item icon if used */
.el-timeline-item__icon {
  font-size: 16px;
  /* Adjust icon size in timeline */
}

/* User Info Bottom Styles */
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

.el-list-item {
  padding: 0;
}

.kItemCard {
  margin-bottom: 15px;
}

.kContent {
  color: #606266;
  padding: 0 15px;
}

.kFooter {
  font-size: 12px;
  color: #606266;
  margin-top: 10px;
  padding: 0 15px;
}

.kCard {
  margin-bottom: 24px;
  border-radius: 4px;
}

.err {
  color: #f56c6c;
  text-align: center;
  padding: 15px;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  margin-bottom: 15px;
}
</style>
