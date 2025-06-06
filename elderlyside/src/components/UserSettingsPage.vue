<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Sidebar -->
    <el-aside width="220px" class="side">
      <!-- System Name -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu
          default-active="/user-settings"
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

    <!-- Main Content Area -->
    <div class="main">
      <!-- Page Title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Personal Information</h1>
          <span class="sub-title">Update your personal details</span>
        </div>
      </div>

      <!-- Information Form -->
      <el-card class="info-card">
        <el-form
          ref="profileForm"
          :model="profileData"
          :rules="rules"
          label-width="180px"
        >
          <el-form-item label="Username" prop="username">
            <el-input v-model="profileData.username" />
          </el-form-item>

          <el-form-item label="Email" prop="email">
            <el-input v-model="profileData.email" />
          </el-form-item>

          <el-form-item label="Phone Number" prop="phone">
            <el-input v-model="profileData.phone" />
          </el-form-item>

          <el-form-item label="First Name" prop="first_name">
            <el-input v-model="profileData.first_name" />
          </el-form-item>

          <el-form-item label="Last Name" prop="last_name">
            <el-input v-model="profileData.last_name" />
          </el-form-item>

          <el-form-item label="Date of Birth" prop="date_of_birth">
            <el-date-picker
              v-model="profileData.date_of_birth"
              type="date"
              placeholder="Select Date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="Gender" prop="gender">
            <el-select
              v-model="profileData.gender"
              placeholder="Select Gender"
              style="width: 100%"
            >
              <el-option label="Male" value="male" />
              <el-option label="Female" value="female" />
              <el-option label="Other" value="other" />
            </el-select>
          </el-form-item>

          <el-form-item label="Address" prop="address">
            <el-input type="textarea" v-model="profileData.address" />
          </el-form-item>

          <el-form-item label="City" prop="city">
            <el-input v-model="profileData.city" />
          </el-form-item>

          <el-form-item label="State" prop="state">
            <el-input v-model="profileData.state" />
          </el-form-item>

          <el-form-item label="Zip Code" prop="zip_code">
            <el-input v-model="profileData.zip_code" />
          </el-form-item>

          <el-form-item
            label="Emergency Contact Name"
            prop="emergency_contact_name"
          >
            <el-input v-model="profileData.emergency_contact_name" />
          </el-form-item>

          <el-form-item
            label="Emergency Contact Phone"
            prop="emergency_contact_phone"
          >
            <el-input v-model="profileData.emergency_contact_phone" />
          </el-form-item>

          <el-form-item label="Allergies" prop="allergies">
            <el-input type="textarea" v-model="profileData.allergies" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm()"> Save </el-button>
            <el-button @click="fetchProfileData()">Reset</el-button>
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
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
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
const router = useRouter();

const isLoggedIn = computed(() => store.getters.isLoggedIn);
const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};

const profileApiUrl = ref("http://localhost:3060/api/homecare/users"); // Base URL
const updateUserApiUrl = ref("http://localhost:3060/api/homecare/users"); // API URL for updating user

const profileForm = ref(null);

const profileData = reactive({
  username: "",
  email: "",
  phone: "",
  user_type: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  allergies: "",
});

const rules = reactive({
  username: [
    { required: true, message: "Please input username", trigger: "blur" },
  ],
  email: [
    { required: true, message: "Please input email", trigger: "blur" },
    {
      type: "email",
      message: "Please input a valid email address",
      trigger: ["blur", "change"],
    },
  ],
  phone: [
    { required: true, message: "Please input phone number", trigger: "blur" },
  ],
  first_name: [
    { required: true, message: "Please input first name", trigger: "blur" },
  ],
  last_name: [
    { required: true, message: "Please input last name", trigger: "blur" },
  ],
  date_of_birth: [
    {
      required: true,
      message: "Please select date of birth",
      trigger: "change",
    },
  ],
  gender: [
    { required: true, message: "Please select gender", trigger: "change" },
  ],
  address: [
    { required: true, message: "Please input address", trigger: "blur" },
  ],
  city: [{ required: true, message: "Please input city", trigger: "blur" }],
  state: [{ required: true, message: "Please input state", trigger: "blur" }],
  zip_code: [
    { required: true, message: "Please input zip code", trigger: "blur" },
  ],
  emergency_contact_name: [
    {
      required: true,
      message: "Please input emergency contact name",
      trigger: "blur",
    },
  ],
  emergency_contact_phone: [
    {
      required: true,
      message: "Please input emergency contact phone",
      trigger: "blur",
    },
  ],
  allergies: [
    { required: true, message: "Please input allergies", trigger: "blur" },
  ],
});

const submitForm = async () => {
  profileForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const token = localStorage.getItem("token") || store.getters.token;
        const response = await fetch(
          `${updateUserApiUrl.value}/${store.getters.userInfo.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          }
        );

        const data = await response.json();

        if (data.success) {
          ElMessage.success("Personal information updated successfully");
          store.commit("setUserInfo", {
            ...store.getters.userInfo,
            ...profileData,
          });
        } else {
          ElMessage.error(
            data.message || "Failed to update personal information"
          );
        }
      } catch (error) {
        console.error("Failed to update personal information:", error);
        ElMessage.error("Network error, please try again later");
      }
    } else {
      console.log("Form validation failed");
      return false;
    }
  });
};

const fetchProfileData = async () => {
  try {
    const token = localStorage.getItem("token") || store.getters.token;
    const userId = store.getters.userInfo.id;

    const response = await fetch(`${profileApiUrl.value}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      // Correctly handle date conversion before assigning
      if (data.data.date_of_birth) {
        profileData.date_of_birth = data.data.date_of_birth; // Keep as string for el-date-picker
      }
      Object.assign(profileData, data.data);
      // Log the data after assigning to see if it's populated
      console.log("profileData after API call:", profileData);
    } else {
      ElMessage.error(data.message || "Failed to get user information");
    }
  } catch (error) {
    console.error("Failed to get user information:", error);
    ElMessage.error("Network error, please try again later");
  }
};

onMounted(async () => {
  fetchProfileData(); // Fetch data on component mount
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
  overflow: hidden; /* Hide horizontal scrollbar */
  display: flex;
  flex-direction: column;
  height: 100vh; /* Occupy the entire viewport height */
  position: relative; /* Ensure user-info-bottom can be positioned relative to it */
}

/* System Name Style */
.sTitle {
  color: #fff;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

/* Menu Container, Set Fixed Height and Hide Overflow */
.menuWrap {
  height: calc(
    100vh - 180px
  ); /* 100vh minus the height of the bottom user information and system name */
  overflow-y: auto;
}

/* Override ElMenu default styles for dark theme */
.el-menu {
  border-right: none;
  background-color: #001529;
  /* Match sidebar */
  flex: 1; /* Occupy remaining space */
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
  height: calc(100vh - 48px); /* Subtract the height of the padding */
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

/* Renamed class */
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
  position: absolute; /* Absolute positioning */
  bottom: 0; /* Located at the bottom */
  left: 0; /* Aligned to the left */
  width: 100%; /* Occupy the entire width */
}

.uInfo span {
  margin-left: 10px;
  font-size: 16px;
}
/* Health Data Styles */
.dCard {
  margin-bottom: 24px;
  border-radius: 4px;
}

.camWrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.camWrap video {
  margin-bottom: 10px;
}

.uping {
  padding: 20px;
  text-align: center;
}

.dShow {
  padding: 20px;
}

.noData {
  padding: 20px;
  text-align: center;
  color: #999;
}

/* History Data Styles */
.hCard {
  margin-bottom: 24px;
  border-radius: 4px;
}
.profile-page {
  padding: 24px;
}

.info-card {
  margin-top: 24px;
}

/* Page Title Style */
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
</style>
