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

      <!-- Main Content (Combined Cooking & Ordering Page) -->
      <div class="main">
        <!-- Page Title -->
        <div class="pHeader">
          <div class="hTitle">
            <h1>Cooking & Ordering Services</h1>
            <span class="sub-title"
              >Manage your meals with AI recommendations and canteen
              orders</span
            >
          </div>
        </div>

        <!-- Payment Result Alert -->
        <el-alert
          v-if="paymentResult"
          :title="paymentResult.title"
          :type="paymentResult.type"
          :description="paymentResult.description"
          show-icon
          closable
          @close="clearPaymentResult"
          style="margin-bottom: 20px"
        ></el-alert>

        <!-- Self Cooking (Kimi Recommendation) Card -->
        <el-card class="self-cooking-card">
          <template #header>
            <div class="card-header">Self Cooking - Get AI Recommendations</div>
          </template>

          <div class="cooking-input-area">
            <el-input
              v-model="userDemand"
              :rows="3"
              type="textarea"
              placeholder="Enter your cooking needs, e.g., 'Today I want to eat something light' or 'I have chicken and potatoes at home'..."
              @keyup.enter="getCookingRecommendation"
              :disabled="cookingLoading"
            />
            <el-button
              type="primary"
              @click="getCookingRecommendation"
              :loading="cookingLoading"
              :disabled="!userDemand.trim() || cookingLoading"
            >
              Get Recommendation
            </el-button>
          </div>

          <div v-if="cookingLoading" class="loading-area">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="recommendation" class="recommendation-area">
            <h2>Recommended Menu and Steps:</h2>
            <div v-html="formattedRecommendation"></div>
          </div>
          <el-alert
            v-else-if="cookingError"
            :title="cookingError"
            type="error"
            show-icon
          ></el-alert>
        </el-card>

        <!-- Canteen Ordering Card -->
        <el-card class="canteen-ordering-card">
          <template #header>
            <div class="card-header">Canteen Ordering</div>
          </template>

          <!-- Menu display -->
          <div class="menu-section">
            <h3>Menu</h3>
            <div v-if="menuLoading">
              <el-skeleton :rows="4" animated />
            </div>
            <el-alert
              v-else-if="menuError"
              :title="menuError"
              type="error"
              show-icon
            ></el-alert>
            <div v-else class="dish-list">
              <el-card
                v-for="dish in menu"
                :key="dish.id"
                class="dish-card"
                shadow="hover"
                @click="openPurchaseDialog(dish)"
              >
                <img
                  :src="dish.image_url"
                  class="dish-image"
                  alt="Dish Image"
                />
                <div class="dish-info">
                  <h4>{{ dish.name }}</h4>
                  <p>{{ dish.description }}</p>
                  <div class="dish-price">
                    ¥{{
                      dish.price != null && !isNaN(parseFloat(dish.price))
                        ? parseFloat(dish.price).toFixed(2)
                        : "N/A"
                    }}
                  </div>
                </div>
              </el-card>
            </div>
          </div>

          <!-- shopping cart -->
          <el-card class="cart-section" shadow="never">
            <!-- Use shadow="never" for nested card -->
            <template #header>
              <div class="card-header">Shopping Cart</div>
            </template>
            <div class="table-container">
              <!-- Added a container -->
              <el-table :data="cartItems" style="width: 100%">
                <el-table-column
                  prop="name"
                  label="Dish Name"
                ></el-table-column>
                <el-table-column label="Quantity" width="150">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.quantity"
                      :min="1"
                      size="small"
                    ></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column label="Price" width="100">
                  <template #default="scope">
                    ¥{{
                      scope.row.price != null &&
                      !isNaN(parseFloat(scope.row.price))
                        ? parseFloat(scope.row.price).toFixed(2)
                        : "N/A"
                    }}
                  </template>
                </el-table-column>
                <el-table-column label="Actions" width="100">
                  <template #default="scope">
                    <el-button
                      type="danger"
                      size="small"
                      @click="removeCartItem(scope.row)"
                      >Remove</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <!-- End of container -->
            <div class="cart-summary">Total: ¥{{ cartTotal.toFixed(2) }}</div>
          </el-card>

          <!-- Delivery information and ordering -->
          <el-card class="order-section" shadow="never">
            <!-- Use shadow="never" for nested card -->
            <template #header>
              <div class="card-header">Delivery Information</div>
            </template>
            <el-form :model="orderForm" label-width="120px">
              <el-form-item label="Delivery Address">
                <el-input v-model="orderForm.deliveryAddress"></el-input>
              </el-form-item>
              <!-- Add other delivery info fields as needed -->
            </el-form>

            <div class="order-actions">
              <el-button
                type="success"
                @click="createOrder"
                :disabled="
                  cartItems.length === 0 ||
                  !orderForm.deliveryAddress ||
                  orderLoading
                "
                :loading="orderLoading"
              >
                Place Order (¥{{ cartTotal.toFixed(2) }})
              </el-button>
            </div>
          </el-card>

          <el-card v-if="paymentInfo" class="payment-card" shadow="never">
            <template #header>
              <div class="card-header">
                Order Placed - Opening Payment Window
              </div>
            </template>
            <p>Order ID: {{ paymentInfo.orderId }}</p>
            <p>
              Total Amount: ¥{{
                paymentInfo.totalAmount
                  ? paymentInfo.totalAmount.toFixed(2)
                  : "N/A"
              }}
            </p>
            <p>Please check the new window for Alipay payment.</p>

            <el-alert
              v-if="orderError"
              :title="orderError"
              type="error"
              show-icon
              style="margin-top: 15px"
            ></el-alert>
          </el-card>
          <el-alert
            v-else-if="orderError"
            :title="orderError"
            type="error"
            show-icon
            style="margin-top: 15px"
          ></el-alert>
        </el-card>

        <!-- Historical Orders Card -->
        <el-card class="historical-orders-card">
          <template #header>
            <div class="card-header">Historical Orders</div>
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
            <!-- Added a container -->
            <el-table :data="historicalOrders" style="width: 100%">
              <el-table-column
                prop="order_id"
                label="Order ID"
                width="180"
              ></el-table-column>
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
              <el-table-column label="Actions" width="100">
                <template #default="scope">
                  <el-button
                    type="danger"
                    size="small"
                    @click="confirmDeleteOrder(scope.row)"
                    :disabled="scope.row.status !== 'pending_payment'"
                    width="180"
                  >
                    Delete
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!-- End of container -->
        </el-card>
      </div>
    </div>
    <div v-else>
      <h1>Please log in</h1>
      <el-button type="primary" @click="goToLogin">Go to Login</el-button>
    </div>

    <!-- Purchase Dialog -->
    <el-dialog
      v-model="purchaseDialogVisible"
      title="Add to Cart"
      width="30%"
      center
    >
      <div v-if="selectedDish">
        <h3>{{ selectedDish.name }}</h3>
        <p>{{ selectedDish.description }}</p>
        <div class="dish-price">
          Price: ¥{{
            selectedDish.price != null && !isNaN(parseFloat(selectedDish.price))
              ? parseFloat(selectedDish.price).toFixed(2)
              : "N/A"
          }}
        </div>
        <div class="quantity-control">
          <span>Quantity:</span>
          <el-input-number
            v-model="selectedDish.quantity"
            :min="1"
            size="small"
          ></el-input-number>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="purchaseDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmAddToCart"
            >Add to Cart</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue"; // Import nextTick
import { useRoute, useRouter } from "vue-router";
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
  ElDialog,
  ElInputNumber,
  ElAlert,
  ElTable,
  ElTableColumn,
  ElMessageBox,
} from "element-plus";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const store = useStore();

const isLoggedIn = computed(() => store.getters.isLoggedIn);
const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};

// --- Payment Result State ---
const paymentResult = ref(null);

// --- Self Cooking State and Logic ---
const userDemand = ref("");
const recommendation = ref(null);
const cookingLoading = ref(false);
const cookingError = ref(null);

const formattedRecommendation = computed(() => {
  if (recommendation.value) {
    return recommendation.value.replace(/\n/g, "<br>");
  }
  return "";
});

const getCookingRecommendation = async () => {
  if (!userDemand.value.trim() || cookingLoading.value) {
    return;
  }

  const question = userDemand.value;
  cookingLoading.value = true;
  cookingError.value = null;
  recommendation.value = null;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:3060/api/homecare2/ai-consultation",
      {
        question: question,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      recommendation.value = response.data.response;
    } else {
      cookingError.value =
        response.data.message || "Failed to get recommendation";
      ElMessage.error(cookingError.value);
    }
  } catch (err) {
    console.error("Error fetching cooking recommendation:", err);
    cookingError.value = "Network error, please try again later.";
    ElMessage.error(cookingError.value);
  } finally {
    cookingLoading.value = false;
  }
};

// --- Canteen Ordering State and Logic ---
const menu = ref([]);
const menuLoading = ref(false);
const menuError = ref(null);

const cartItems = ref([]);

const orderForm = ref({
  deliveryAddress: "",
});
const orderLoading = ref(false);
const orderError = ref(null);
const paymentInfo = ref(null);

// --- Historical Orders State and Logic ---
const historicalOrders = ref([]);
const historicalOrdersLoading = ref(false);
const historicalOrdersError = ref(null);

// --- Purchase Dialog State and Logic ---
const purchaseDialogVisible = ref(false);
const selectedDish = ref(null);

const cartTotal = computed(() => {
  return cartItems.value.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
});

onMounted(() => {
  fetchMenu();
  fetchHistoricalOrders();
  checkPaymentReturn();
});

const fetchMenu = async () => {
  menuLoading.value = true;
  menuError.value = null;
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      menuError.value = "Please log in to view the menu.";
      ElMessage.warning(menuError.value);
      menuLoading.value = false;
      return;
    }

    const response = await axios.get(
      "http://localhost:3060/api/homecare2/dishes",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      nextTick(() => {
        menu.value = response.data.dishes.map((dish) => ({
          ...dish,
          id: dish.dish_id,
          name: dish.name,
          price: parseFloat(dish.price),
          description: dish.description,
          category: dish.category,
          image_url: dish.image_url,
        }));
      });
    } else {
      menuError.value = response.data.message || "Failed to get menu";
      ElMessage.error(menuError.value);
    }
  } catch (err) {
    console.error("Error fetching menu:", err);
    if (err.response && err.response.status === 401) {
      menuError.value = "Authentication required. Please log in.";
      ElMessage.error(menuError.value);
    } else {
      menuError.value = "Network error, please try again later.";
      ElMessage.error(menuError.value);
    }
  } finally {
    menuLoading.value = false;
  }
};

const fetchHistoricalOrders = async () => {
  historicalOrdersLoading.value = true;
  historicalOrdersError.value = null;
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      historicalOrdersError.value = "Please log in to view historical orders.";
      ElMessage.warning(historicalOrdersError.value);
      historicalOrdersLoading.value = false;
      return;
    }

    const response = await axios.get(
      "http://localhost:3060/api/homecare2/history",
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
        response.data.message || "Failed to get historical orders";
      ElMessage.error(historicalOrdersError.value);
    }
  } catch (err) {
    console.error("Error fetching historical orders:", err);
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

const openPurchaseDialog = (dish) => {
  selectedDish.value = { ...dish, quantity: 1 };
  purchaseDialogVisible.value = true;
};

const confirmAddToCart = () => {
  if (!selectedDish.value || selectedDish.value.quantity <= 0) {
    ElMessage.warning("Please select a valid quantity.");
    return;
  }

  const existingItem = cartItems.value.find(
    (item) => item.id === selectedDish.value.id
  );

  if (existingItem) {
    existingItem.quantity += selectedDish.value.quantity;
  } else {
    cartItems.value.push({
      id: selectedDish.value.id,
      name: selectedDish.value.name,
      price: selectedDish.value.price,
      quantity: selectedDish.value.quantity,
    });
  }

  ElMessage.success(`${selectedDish.value.name} added to cart.`);
  purchaseDialogVisible.value = false;
  selectedDish.value = null;
};

const removeCartItem = (itemToRemove) => {
  cartItems.value = cartItems.value.filter(
    (item) => item.id !== itemToRemove.id
  );
  ElMessage.success(`${itemToRemove.name} removed from cart.`);
};

const createOrder = async () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning("Cart is empty, please select some dishes.");
    return;
  }
  if (!orderForm.value.deliveryAddress) {
    ElMessage.warning("Please enter a delivery address.");
    return;
  }

  orderLoading.value = true;
  orderError.value = null;
  paymentInfo.value = null;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:3060/api/homecare2/orders",
      {
        items: cartItems.value.map((item) => ({
          dishId: item.id,
          quantity: item.quantity,
        })),
        deliveryAddress: orderForm.value.deliveryAddress,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      ElMessage.success(
        "Order created successfully, opening payment window..."
      );
      paymentInfo.value = {
        orderId: response.data.orderId,
        totalAmount: response.data.totalAmount,
      };
      cartItems.value = [];
      orderForm.value.deliveryAddress = "";

      openPaymentWindow(response.data.paymentInfo);
      fetchHistoricalOrders(); // Refresh historical orders after creating a new one
    } else {
      orderError.value = response.data.message || "Order creation failed.";
      ElMessage.error(orderError.value);
    }
  } catch (err) {
    console.error("Error creating order:", err);
    let errorMessage = "Network error, please try again later.";
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    orderError.value = errorMessage;
    ElMessage.error(errorMessage);
  } finally {
    orderLoading.value = false;
  }
};

const openPaymentWindow = (htmlFormString) => {
  if (!htmlFormString) {
    ElMessage.error("Could not get payment information, please try again.");
    return;
  }

  const newWindow = window.open("", "_blank");

  if (!newWindow) {
    ElMessage.error(
      "Could not open payment window, please check browser settings (e.g., pop-up blocker)."
    );
    return;
  }

  newWindow.document.write(htmlFormString);
  newWindow.document.close();
};

const checkPaymentReturn = async () => {
  const queryParams = route.query;
  const orderId = queryParams.out_trade_no;

  if (orderId) {
    console.log("Detected payment return from Alipay. Order ID:", orderId);

    router.replace({ query: {} });

    paymentResult.value = {
      title: "Payment Processing",
      type: "info",
      description: `The system has detected that the order ${orderId} payment has been success. Please double check your order history for the final status.`,
    };

    setTimeout(() => {
      fetchHistoricalOrders();
    }, 3000);
  }
};

const clearPaymentResult = () => {
  paymentResult.value = null;
};

// --- Delete Order Logic ---
const confirmDeleteOrder = (order) => {
  // Only allow deletion if the order status is 'Pending Payment'
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
      fetchHistoricalOrders();
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
  background-color: #002a4d !important; /* Slightly lighter hover */
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
  margin-left: 220px; /* Adjust margin to account for fixed sidebar */
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
  font-weight: 600; /* Keep card header text bold */
  color: #303133;
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

.uInfo span {
  margin-left: 10px;
  font-size: 16px;
}

.cooking-input-area {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.cooking-input-area .el-textarea {
  flex-grow: 1;
}

.cooking-input-area .el-button {
  flex-shrink: 0;
  height: 80px; /* Adjust button height to match textarea roughly */
}

.loading-area {
  margin-top: 20px;
}

.recommendation-area {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
}

.recommendation-area h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
  color: #303133;
}

.recommendation-area div {
  line-height: 1.6;
}

.el-alert {
  margin-top: 20px;
}

.menu-section,
.cart-section,
.order-section,
.payment-card,
.historical-orders-card {
  margin-bottom: 20px;
}

.dish-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
}

.dish-card {
  cursor: pointer;
}

.dish-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-bottom: 1px solid #ebeef5;
}

.dish-info {
  padding: 10px;
}

.dish-info h4 {
  margin-top: 0;
  margin-bottom: 5px;
  font-size: 15px;
}

.dish-info p {
  font-size: 11px;
  color: #606266;
  margin-bottom: 10px;
  height: 28px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dish-price {
  font-size: 13px;
  color: #f56c6c;
  font-weight: bold;
}

.cart-summary {
  margin-top: 15px;
  text-align: right;
  font-size: 15px;
  font-weight: bold;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.order-actions {
  margin-top: 20px;
  text-align: right;
}

.payment-card {
  border: 1px solid #409eff;
  background-color: #ecf5ff;
}

h1 {
  text-align: center;
  margin-top: 50px;
}

.quantity-control {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-control span {
  font-size: 14px;
}
</style>
