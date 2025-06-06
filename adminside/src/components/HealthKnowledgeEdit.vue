<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Left Sidebar -->
    <el-aside width="220px" class="side">
      <div class="sTitle">Smart Home Elderly Care System</div>
      <div class="menuWrap">
        <el-menu
          default-active="/health-knowledge/list"
          class="el-menu-1"
          :router="true"
        >
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

      <div class="uInfo">
        <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        <span>{{ userInfo.username }}</span>
      </div>
    </el-aside>

    <!-- Main Content -->
    <div class="main">
      <div class="pHeader">
        <div class="hTitle">
          <h1>Edit Health Knowledge</h1>
          <span class="sub-title">Modify existing health information</span>
        </div>
      </div>

      <el-card class="health-knowledge-card">
        <!-- Loading State -->
        <div v-if="loading">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-message">
          Failed to load health knowledge. Please try again later.
        </div>

        <!-- Edit Form -->
        <el-form
          v-else
          ref="editForm"
          :model="form"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item label="Title" prop="title">
            <el-input v-model="form.title" placeholder="Enter title" />
          </el-form-item>

          <el-form-item label="Content" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="10"
              placeholder="Enter content"
            />
          </el-form-item>

          <el-form-item label="Category" prop="category">
            <el-input v-model="form.category" placeholder="Enter category" />
          </el-form-item>

          <el-form-item label="Author" prop="author">
            <el-input v-model="form.author" placeholder="Enter author" />
          </el-form-item>

          <el-form-item label="Image URL">
            <el-input v-model="form.image_url" placeholder="Enter image URL" />
          </el-form-item>

          <el-form-item label="Video URL">
            <el-input v-model="form.video_url" placeholder="Enter video URL" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm">Save</el-button>
            <el-button @click="cancelEdit">Cancel</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
  <div v-else>
    <h1>Please Login</h1>
    <el-button type="primary" @click="goToLogin">Go to Login</el-button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import {
  Platform,
  DocumentCopy,
  Setting,
  Monitor,
  Food,
  Basketball,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const store = useStore();

// Computed Properties
const isLoggedIn = computed(() => store.getters.isLoggedIn);
const userInfo = computed(() => store.getters.userInfo);

// Refs
const editForm = ref(null);
const form = ref({
  title: "",
  content: "",
  category: "",
  author: "",
  image_url: null,
  video_url: null,
});
const rules = ref({
  title: [
    { required: true, message: "Please enter the title", trigger: "blur" },
  ],
  content: [
    { required: true, message: "Please enter the content", trigger: "blur" },
  ],
  category: [
    {
      required: true,
      message: "Please select the category",
      trigger: "change",
    },
  ],
  author: [
    { required: true, message: "Please enter the author", trigger: "blur" },
  ],
  image_url: [],
  video_url: [],
});
const loading = ref(true);
const error = ref(false);

// Extract ID from URL path
const healthKnowledgeId = computed(() => {
  const pathSegments = route.path.split("/");
  return pathSegments[pathSegments.length - 1];
});

// Methods
const goToLogin = () => {
  router.push("/");
};

const fetchKnowledgeDetail = async () => {
  loading.value = true;
  error.value = false;
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:3060/api/homecare/health-knowledge/${healthKnowledgeId.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        form.value = { ...data.data };
      } else {
        ElMessage.error(data.message || "Failed to load health knowledge");
        error.value = true;
      }
    } else {
      console.error(
        "API Response Error:",
        response.status,
        response.statusText
      );
      ElMessage.error("Failed to load health knowledge");
      error.value = true;
    }
  } catch (err) {
    console.error("API Request Error:", err);
    ElMessage.error("Network error, please try again later");
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  editForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3060/api/homecare/health-knowledge-update/${healthKnowledgeId.value}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form.value),
          }
        );

        if (response.ok) {
          ElMessage.success("Update successful!");
          router.push("/health-knowledge/list");
        } else {
          const errorData = await response.json();
          ElMessage.error(
            errorData.message || "Update failed, please try again"
          );
        }
      } catch (err) {
        console.error("Update Error:", err);
        ElMessage.error("Network error, please try again later");
      }
    } else {
      console.log("Validation error!");
      return false;
    }
  });
};

const cancelEdit = () => {
  router.push("/health-knowledge/list");
};

// Lifecycle Hook
onMounted(() => {
  fetchKnowledgeDetail();
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

.health-knowledge-card {
  margin-bottom: 0;
}

.el-list {
  padding: 0;
}

.el-list-item {
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
