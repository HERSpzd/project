<template>
  <div>
    <div v-if="isLoggedIn" class="page">
      <!-- Left Sidebar -->
      <el-aside width="220px" class="side">
        <!-- System Name -->
        <div class="sTitle">Smart Home Elderly Care System</div>

        <div class="menuWrap">
          <el-menu
            default-active="/diet-management"
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

      <!-- Main Content (All Historical Orders Page) -->
      <div class="main">
        <!-- Page Title -->
        <div class="pHeader">
          <div class="hTitle">
            <h1>All Historical Orders</h1>
            <span class="sub-title">View all past canteen orders</span>
          </div>
        </div>

        <!-- Historical Orders Card (Modified to show all orders) -->
        <el-card class="historical-orders-card">
          <template #header>
            <div class="card-header">All Historical Orders</div>
          </template>

          <div v-if="historicalOrdersLoading">
            <el-skeleton :rows="5" animated />
          </div>
          <el-alert
            v-else-if="historicalOrdersError"
            :title="historicalOrdersError"
            type="error"
            show-icon
          ></el-alert>
          <div v-else class="table-container">
            <el-table :data="historicalOrders" style="width: 100%">
              <el-table-column
                prop="order_id"
                label="Order ID"
                width="180"
              ></el-table-column>
              <el-table-column
                prop="username"
                label="User"
                width="120"
              ></el-table-column>
              <!-- Added User column -->
              <el-table-column label="Items">
                <template #default="scope">
                  <div v-for="item in scope.row.items" :key="item.dish_id">
                    {{ item.dish_name }} x {{ item.quantity }} (¥{{
                      item.price ? parseFloat(item.price).toFixed(2) : "N/A"
                    }})
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="total_amount"
                label="Total Amount"
                width="120"
              >
                <template #default="scope">
                  ¥{{
                    scope.row.total_amount
                      ? parseFloat(scope.row.total_amount).toFixed(2)
                      : "N/A"
                  }}
                </template>
              </el-table-column>
              <el-table-column
                prop="status"
                label="Status"
                width="100"
              ></el-table-column>
              <el-table-column
                prop="delivery_address"
                label="Delivery Address"
                width="180"
              ></el-table-column>
              <el-table-column
                prop="created_at"
                label="Order Time"
                width="180"
              ></el-table-column>
              <el-table-column label="Actions" width="150">
                <template #default="scope">
                  <el-button
                    v-if="scope.row.status === 'paid'"
                    type="primary"
                    size="small"
                    @click="markOrderAsDelivering(scope.row)"
                  >
                    Mark as Delivering
                  </el-button>
                  <el-button
                    v-if="scope.row.status === 'delivering'"
                    type="success"
                    size="small"
                    @click="markOrderAsCompleted(scope.row)"
                  >
                    Mark as Completed
                  </el-button>
                  <el-button
                    v-if="scope.row.status === 'pending_payment'"
                    type="danger"
                    size="small"
                    @click="confirmDeleteOrder(scope.row)"
                    >Delete</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
    </div>
    <div v-else>
      <h1>Please log in</h1>
      <el-button type="primary" @click="goToLogin">Go to Login</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
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
import {
  ElMessage,
  ElAlert,
  ElTable,
  ElTableColumn,
  ElMessageBox,
  ElButton,
  ElSkeleton,
} from "element-plus";
import axios from "axios";

const router = useRouter();
const store = useStore();

const isLoggedIn = computed(() => store.getters.isLoggedIn);
const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};

// --- Historical Orders State and Logic (Modified to fetch all orders) ---
const historicalOrders = ref([]);
const historicalOrdersLoading = ref(false);
const historicalOrdersError = ref(null);

onMounted(() => {
  if (isLoggedIn.value) {
    fetchAllHistoricalOrders();
  }
});

const fetchAllHistoricalOrders = async () => {
  historicalOrdersLoading.value = true;
  historicalOrdersError.value = null;
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      historicalOrdersError.value = "Please log in to view orders.";
      ElMessage.warning(historicalOrdersError.value);
      historicalOrdersLoading.value = false;
      return;
    }

    const response = await axios.get(
      "http://localhost:3060/api/homecare2/all-orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      nextTick(() => {
        historicalOrders.value = response.data.orders;
      });
    } else {
      historicalOrdersError.value =
        response.data.message || "Failed to fetch all orders";
      ElMessage.error(historicalOrdersError.value);
    }
  } catch (err) {
    console.error("Error fetching all historical orders:", err);
    if (err.response && err.response.status === 401) {
      historicalOrdersError.value = "Authentication required. Please log in.";
      ElMessage.error(historicalOrdersError.value);
    } else {
      historicalOrdersError.value = "Network error, please try again later.";
      ElMessage.error(historicalOrdersError.value);
    }
  } finally {
    historicalOrdersLoading.value = false;
  }
};

// --- Delete Order Logic (Remains the same for deleting a specific order) ---
const confirmDeleteOrder = (order) => {
  if (order.status !== "pending_payment") {
    ElMessage.warning(
      'Only orders with status "Pending Payment" can be deleted.'
    );
    return;
  }

  ElMessageBox.confirm(
    `Are you sure you want to delete order ${order.order_id}?`,
    "Warning",
    {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  )
    .then(() => {
      deleteOrder(order.order_id);
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Delete canceled",
      });
    });
};

const deleteOrder = async (orderId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `http://localhost:3060/api/homecare2/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      ElMessage.success(`Order ${orderId} deleted successfully.`);
      fetchAllHistoricalOrders();
    } else {
      ElMessage.error(response.data.message || "Failed to delete order.");
    }
  } catch (err) {
    console.error("Error deleting order:", err);
    let errorMessage = "Network error, please try again later.";
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    ElMessage.error(errorMessage);
  }
};

// --- Mark Order as Delivering Logic ---
const markOrderAsDelivering = async (order) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to mark order ${order.order_id} as delivering?`,
      "Confirm Delivering",
      {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    const token = localStorage.getItem("token");
    if (!token) {
      ElMessage.warning("Authentication required. Please log in.");
      return;
    }

    const response = await axios.put(
      `http://localhost:3060/api/homecare2/change-status/${order.order_id}`,
      {
        status: "delivering",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success) {
      ElMessage.success(`Order ${order.order_id} marked as delivering.`);
      fetchAllHistoricalOrders();
    } else {
      ElMessage.error(
        response.data.message || "Failed to update order status."
      );
    }
  } catch (err) {
    if (err !== "cancel") {
      console.error("Error marking order as delivering:", err);
      let errorMessage = "Network error, please try again later.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.response && err.response.status === 401) {
        errorMessage = "Authentication required. Please log in.";
      } else if (err.response && err.response.status === 403) {
        errorMessage =
          "Access denied. You do not have permission to perform this action.";
      }
      ElMessage.error(errorMessage);
    }
  }
};

// --- Mark Order as Completed Logic ---
const markOrderAsCompleted = async (order) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to mark order ${order.order_id} as completed?`,
      "Confirm Completion",
      {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "success",
      }
    );

    // User confirmed
    const token = localStorage.getItem("token");
    if (!token) {
      ElMessage.warning("Authentication required. Please log in.");
      return;
    }

    const response = await axios.put(
      `http://localhost:3060/api/homecare2/change-status/${order.order_id}`,
      {
        status: "completed", // Target status
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success) {
      ElMessage.success(`Order ${order.order_id} marked as completed.`);
      fetchAllHistoricalOrders();
    } else {
      ElMessage.error(
        response.data.message || "Failed to update order status."
      );
    }
  } catch (err) {
    if (err !== "cancel") {
      console.error("Error marking order as completed:", err);
      let errorMessage = "Network error, please try again later.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.response && err.response.status === 401) {
        errorMessage = "Authentication required. Please log in.";
      } else if (err.response && err.response.status === 403) {
        errorMessage =
          "Access denied. You do not have permission to perform this action.";
      }
      ElMessage.error(errorMessage);
    }
  }
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

.el-menu--inline .el-menu-item:hover {
  background-color: #002a4d !important;
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

.table-container {
  margin-top: 15px;
}
</style>
