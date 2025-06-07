<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Sidebar -->
    <el-aside width="220px" class="side">
      <!-- System -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu default-active="/home" class="el-menu-1" :router="true">
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

    <!-- Main Content Area (Home Page) -->
    <div class="main">
      <!-- title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Welcome, elderly user!</h1>
          <span class="sub-title">System core management entrance</span>
        </div>
      </div>

      <!-- Home Component Content -->
      <div class="homeWrap">
        <div class="sumCards">
          <el-card class="sumCard">
            <div class="cContent">
              <div class="cIcon">
                <el-icon><User /></el-icon>
              </div>
              <div class="cText">
                <div class="cVal">135</div>
                <div class="cLabel">Number of elderly users</div>
              </div>
            </div>
          </el-card>

          <el-card class="sumCard">
            <div class="cContent">
              <div class="cIcon">
                <el-icon><User /></el-icon>
              </div>
              <div class="cText">
                <div class="cVal">312</div>
                <div class="cLabel">Number of social workers</div>
              </div>
            </div>
          </el-card>

          <el-card class="sumCard">
            <div class="cContent">
              <div class="cIcon">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="cText">
                <div class="cVal">5</div>
                <div class="cLabel">Pending alarm</div>
              </div>
            </div>
          </el-card>

          <el-card class="sumCard">
            <div class="cContent">
              <div class="cIcon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="cText">
                <div class="cVal">2</div>
                <div class="cLabel">To Do Tasks</div>
              </div>
            </div>
          </el-card>
        </div>

        <el-card class="qaCard">
          <template #header>
            <div class="card-header">
              <span>Quick operation</span>
            </div>
          </template>
          <div class="qActions">
            <!-- 直接使用 <a> 标签嵌套 <el-button> -->
            <a href="/health-monitoring">
              <el-button type="primary">View health data</el-button>
            </a>
            <a href="/health-knowledge">
              <el-button type="success">View health knowledge</el-button>
            </a>
            <!-- 假设 "Overview of Health Data" 也跳转到健康监测 -->
            <a href="/health-monitoring">
              <el-button type="info">Overview of Health Data</el-button>
            </a>
            <a href="/user-settings">
              <el-button type="warning">User Settings</el-button>
            </a>
            <a href="/ai-consultation">
              <el-button type="danger">AI Consultation</el-button>
            </a>
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

.card-header .el-link {
  font-size: 14px;
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

.homeWrap {
  padding: 20px;
}

.sumCards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.sumCard {
  width: 25%;
}

.cContent {
  display: flex;
  align-items: center;
  padding: 15px;
}

.cIcon {
  font-size: 30px;
  margin-right: 15px;
  color: #409eff;
}

.cText {
  flex: 1;
}

.cVal {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.cLabel {
  font-size: 14px;
  color: #999;
}

.qaCard {
  margin-bottom: 20px;
}

.qActions {
  display: flex;
  gap: 10px;
  padding: 15px;
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
