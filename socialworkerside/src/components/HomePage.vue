<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Left navigation bar (social worker user side) -->
    <el-aside width="220px" class="side">
      <!-- System name -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu default-active="/home" class="el-menu-1" :router="true">
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
      <div class="uInfo">
        <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        <span>{{ userInfo.username }}</span>
      </div>
    </el-aside>

    <!-- Main Content Area (Home Page) -->
    <div class="main">
      <!-- title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Welcome, social worker</h1>
          <span class="sub-title"
            >System operation status and core management entrance</span
          >
        </div>
      </div>

      <!-- Home Component Content -->
      <div class="home-container">
        <div class="summary-cards">
          <el-card class="summary-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="card-text">
                <div class="card-value">135</div>
                <div class="card-label">Number of elderly users</div>
              </div>
            </div>
          </el-card>

          <el-card class="summary-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Monitor /></el-icon>
              </div>
              <div class="card-text">
                <div class="card-value">312</div>
                <div class="card-label">Number of social workers</div>
              </div>
            </div>
          </el-card>

          <el-card class="summary-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="card-text">
                <div class="card-value">5</div>
                <div class="card-label">Pending alarm</div>
              </div>
            </div>
          </el-card>

          <el-card class="summary-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="card-text">
                <div class="card-value">2</div>
                <div class="card-label">To Do Tasks</div>
              </div>
            </div>
          </el-card>
        </div>

        <el-card class="quick-actions-card">
          <template #header>
            <div class="card-header">
              <span>Quick operation</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary">Health Data</el-button>
            <el-button type="success">Health Knowledge</el-button>
            <el-button type="info">Elderly Users Overview</el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
  <div v-else>
    <h1>Please log in first</h1>
    <el-button type="primary" @click="goToLogin">Go login</el-button>
  </div>
</template>

<script setup>
import { computed } from "vue";
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
import { User, Bell, Document } from "@element-plus/icons-vue";

const router = useRouter();
const store = useStore();

const isLoggedIn = computed(() => store.getters.isLoggedIn);

const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};
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
  /* Light text color */
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

.home-container {
  padding: 20px;
}

.summary-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  width: 25%;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 15px;
}

.card-icon {
  font-size: 30px;
  margin-right: 15px;
  color: #409eff;
}

.card-text {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.card-label {
  font-size: 14px;
  color: #999;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  gap: 10px;
  padding: 15px;
}

.system-notifications-card {
  margin-bottom: 20px;
}

.notifications {
  padding: 15px;
}

.notification-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #666;
}

.notification-item .el-icon {
  margin-right: 10px;
  color: #66b1ff;
}

.notification-time {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}
</style>
