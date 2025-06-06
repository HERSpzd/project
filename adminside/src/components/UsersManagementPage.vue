<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Sidebar -->
    <el-aside width="220px" class="side">
      <!-- System name -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu
          default-active="/user-management"
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

      <!-- 用户信息 (底部) -->
      <div class="uInfo">
        <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        <span>{{ userInfo.username }}</span>
      </div>
    </el-aside>

    <!-- Main Content Area (User Management Page) -->
    <div class="main">
      <!-- title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>User Management</h1>
          <span class="sub-title">Manage platform user accounts</span>
        </div>
      </div>

      <!-- User List -->
      <el-card class="umCard">
        <template #header>
          <div class="card-header">
            <span>User List</span>
            <el-link
              type="primary"
              size="small"
              href="/"
              style="text-decoration: none"
            >
              Return to registration
            </el-link>
          </div>
        </template>

        <div v-if="loading">
          <el-skeleton :rows="5" animated />
        </div>
        <el-card v-else-if="error" class="err">
          Failed to load user list, please try again later.
        </el-card>
        <div v-else>
          <el-table
            :data="users"
            style="width: 100%"
            :row-key="(row) => row.id"
            default-expand-all
          >
            <el-table-column prop="id" label="ID" width="50" />
            <el-table-column prop="username" label="Username" width="100" />
            <el-table-column prop="email" label="Email" width="180" />
            <el-table-column prop="phone" label="Phone" width="120" />
            <el-table-column prop="user_type" label="User Type" width="80" />
            <el-table-column prop="first_name" label="First Name" width="80" />
            <el-table-column prop="last_name" label="Last Name" width="80" />
            <el-table-column label="Birthday" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.date_of_birth) }}
              </template>
            </el-table-column>
            <el-table-column prop="gender" label="Gender" width="60" />
            <el-table-column
              prop="emergency_contact_name"
              label="Emergency Contact"
              width="120"
            />
            <el-table-column
              prop="emergency_contact_phone"
              label="Emergency Contact Phone"
              width="120"
            />
            <el-table-column label="Actions" width="150">
              <template #default="scope">
                <el-button size="small" @click="openEditUserDialog(scope.row)"
                  >Edit</el-button
                >
                <el-button
                  size="small"
                  type="danger"
                  @click="deleteUser(scope.row.id)"
                  >Delete</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <!-- Add/Edit User Dialogue Box -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
        <el-form :model="userForm" label-width="180px">
          <el-form-item label="Username">
            <el-input v-model="userForm.username" />
          </el-form-item>
          <el-form-item label="Email">
            <el-input v-model="userForm.email" />
          </el-form-item>
          <el-form-item label="Phone">
            <el-input v-model="userForm.phone" />
          </el-form-item>
          <el-form-item label="User Type">
            <el-select
              v-model="userForm.user_type"
              placeholder="Select User Type"
            >
              <el-option label="Admin" value="admin" />
              <el-option label="Elderly" value="elderly" />
              <el-option label="Social Worker" value="social_worker" />
            </el-select>
          </el-form-item>
          <el-form-item label="First Name">
            <el-input v-model="userForm.first_name" />
          </el-form-item>
          <el-form-item label="Last Name">
            <el-input v-model="userForm.last_name" />
          </el-form-item>
          <el-form-item label="Date of Birth">
            <el-date-picker
              v-model="userForm.date_of_birth"
              type="date"
              placeholder="Select Date"
            />
          </el-form-item>
          <el-form-item label="Gender">
            <el-radio-group v-model="userForm.gender">
              <el-radio label="male">Male</el-radio>
              <el-radio label="female">Female</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Address">
            <el-input v-model="userForm.address" />
          </el-form-item>
          <el-form-item label="City">
            <el-input v-model="userForm.city" />
          </el-form-item>
          <el-form-item label="State">
            <el-input v-model="userForm.state" />
          </el-form-item>
          <el-form-item label="Zip Code">
            <el-input v-model="userForm.zip_code" />
          </el-form-item>
          <el-form-item label="Emergency Contact">
            <el-input v-model="userForm.emergency_contact_name" />
          </el-form-item>
          <el-form-item label="Emergency Contact Phone">
            <el-input v-model="userForm.emergency_contact_phone" />
          </el-form-item>
          <el-form-item label="Allergies">
            <el-input v-model="userForm.allergies" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="saveUser">Confirm</el-button>
          </span>
        </template>
      </el-dialog>
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
const userApiDeleteUrl = ref("http://localhost:3060/api/homecare/users");

const users = ref([]);
const loading = ref(true);
const error = ref(false);

const dialogVisible = ref(false);
const dialogTitle = ref("");
const userForm = ref({
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
const editingUserId = ref(null);

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
      throw new Error(`API request failed, status code:${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      users.value = data.data;
    } else {
      console.error("API returned error:", data.message);
      ElMessage.error(data.message || "Failed to retrieve user list");
      error.value = true;
    }
  } catch (err) {
    console.error("API request error:", err);
    ElMessage.error("Network error, please try again later");
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const openEditUserDialog = (row) => {
  dialogTitle.value = "Edit user";
  editingUserId.value = row.id;
  userForm.value = { ...row };
  dialogVisible.value = true;
};

const saveUser = async () => {
  try {
    const token = localStorage.getItem("token");
    let url = userApiUrl.value;
    let method = "POST";

    if (editingUserId.value) {
      url = `${userApiUrl.value}/${editingUserId.value}`;
      method = "PUT";
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userForm.value),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      ElMessage.success({ message: "Save user successfully", duration: 3000 });
      dialogVisible.value = false;
      fetchUsers();
    } else {
      ElMessage.error({
        message: `Failed to save user:${data.message}`,
        duration: 5000,
      });
    }
  } catch (error) {
    console.error("An error occurred while saving the user:", error);
    ElMessage.error({
      message: `An error occurred while saving the user: ${error.message}`,
      duration: 5000,
    });
  }
};

const deleteUser = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${userApiDeleteUrl.value}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Delete failed:", response.status, response.statusText);

      try {
        const errorData = await response.json();
        ElMessage.error(
          `Delete failed:${errorData.message || "unknown error"} (status:${
            response.status
          })`
        );
      } catch (jsonError) {
        ElMessage.error(`Delete failed (status:${response.status})`);
      }
      return;
    }

    const data = await response.json();

    if (data.success) {
      ElMessage.success("Delete successfully");
      fetchUsers();
    } else {
      ElMessage.error(data.message || "Delete failed");
    }
  } catch (err) {
    console.error("An error occurred while deleting:", err);
    ElMessage.error(
      "A network error occurred while deleting, please try again later"
    );
  }
};

onMounted(() => {
  fetchUsers();
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  return dateString.substring(0, 10);
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

.umCard {
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
