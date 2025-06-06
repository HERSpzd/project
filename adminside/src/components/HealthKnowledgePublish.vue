<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Sidebar -->
    <el-aside width="220px" class="side">
      <!-- System -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu
          default-active="/health-knowledge/publish"
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

      <!-- User Information (Bottom) -->
      <div class="uInfo">
        <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        <span>{{ userInfo.username }}</span>
      </div>
    </el-aside>

    <!-- Main Content Area (Elderly User Terminal) -->
    <div class="main">
      <!-- title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Publish health knowledge</h1>
          <span class="sub-title">Publish the latest health news</span>
        </div>
      </div>

      <!-- Publish Health Knowledge Form -->
      <el-card class="hkCard">
        <el-form
          ref="publishForm"
          :model="form"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item label="Title" prop="itle">
            <el-input v-model="form.title" placeholder="Please enter a title" />
          </el-form-item>

          <el-form-item label="Content" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="10"
              placeholder="Please enter the content"
            />
          </el-form-item>

          <el-form-item label="Category" prop="category">
            <el-input
              v-model="form.category"
              placeholder="Please enter category"
            />
          </el-form-item>

          <el-form-item label="Author" prop="author">
            <el-input
              v-model="form.author"
              placeholder="Please enter the author"
            />
          </el-form-item>

          <el-form-item label="Image URL" prop="image_url">
            <el-input
              v-model="form.image_url"
              placeholder="Please enter the image URL"
            />
          </el-form-item>

          <el-form-item label="Video URL" prop="video_url">
            <el-input
              v-model="form.video_url"
              placeholder="Please enter the video URL"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm()">Release</el-button>
            <el-button @click="resetForm()">Reset</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
  <div v-else>
    <h1>Please log in first</h1>
    <el-button type="primary" @click="goToLogin">Go login</el-button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
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
const store = useStore();

const isLoggedIn = computed(() => store.getters.isLoggedIn);
const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};

const publishForm = ref(null);
const form = ref({
  title: "",
  content: "",
  category: "",
  author: "",
  image_url: "",
  video_url: "",
  user_id: userInfo.value ? userInfo.value.id : null,
});

const rules = ref({
  title: [{ required: true, message: "Please enter a title", trigger: "blur" }],
  content: [
    { required: true, message: "Please enter the content", trigger: "blur" },
  ],
  category: [
    { required: true, message: "Please choose a category", trigger: "change" },
  ],
  author: [
    { required: true, message: "Please enter the author", trigger: "blur" },
  ],
});

const submitForm = async () => {
  publishForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3060/api/homecare/health-knowledge-publish", // 替换为你的API地址
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form.value),
          }
        );

        if (response.ok) {
          ElMessage.success("Published successfully!");
          resetForm();
          router.push("/health-knowledge/list");
        } else {
          const errorData = await response.json();
          ElMessage.error(
            errorData.message || "Publishing failed, please try again"
          );
        }
      } catch (error) {
        console.error("Publication failed:", error);
        ElMessage.error("Network error, please try again later");
      }
    } else {
      console.log("Submission error!");
      return false;
    }
  });
};

const resetForm = () => {
  publishForm.value.resetFields();
  form.value = {
    title: "",
    content: "",
    category: "",
    author: "",
    image_url: "",
    video_url: "",
    user_id: userInfo.value ? userInfo.value.id : null,
  };
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

.hkCard {
  margin-bottom: 0;
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
