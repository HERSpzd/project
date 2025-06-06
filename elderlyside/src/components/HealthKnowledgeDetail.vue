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

    <!-- Main Content Area (Elderly User side) -->
    <div class="main">
      <!-- title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>Health Knowledge Details</h1>
          <span class="sub-title">View complete health information</span>
        </div>
      </div>

      <!-- Health Knowledge Details -->
      <el-card class="health-knowledge-card">
        <template #header>
          <div class="card-header">
            Health Knowledge Details
            <!-- Mute Button -->
            <el-button type="info" size="small" @click="toggleMute">
              <!-- Icon Component -->
              <el-icon v-if="isMuted"><Mute /></el-icon>
              <el-icon v-else><Microphone /></el-icon>
              {{ isMuted ? "Unmute" : "Mute" }}
            </el-button>
          </div>
        </template>
        <div v-if="loading">
          <el-skeleton :rows="10" animated />
        </div>
        <el-card v-else-if="error" class="error-message">
          Failed to load health knowledge details, please try again later.
        </el-card>
        <div v-else>
          <!-- Speech Playback Control Area -->
          <div class="speech-controls">
            <div class="control-item">
              <span>Volume:</span>
              <el-slider
                v-model="speechVolume"
                :min="0"
                :max="1"
                :step="0.01"
                style="width: 150px; margin-left: 10px"
                @input="handleVolumeChange"
              ></el-slider>
              <span>{{ speechVolume.toFixed(2) }}</span>
            </div>
            <div class="control-item">
              <span>Voice Tone:</span>
              <el-select
                v-model="selectedVoice"
                placeholder="Select Voice Tone"
                size="small"
                style="width: 150px; margin-left: 10px"
                value-key="name"
              >
                <el-option
                  v-for="voice in voices"
                  :key="voice.name"
                  :label="`${voice.name} (${voice.lang})`"
                  :value="voice"
                ></el-option>
              </el-select>
            </div>
            <!-- Replay Button -->
            <div class="control-item">
              <el-button type="primary" size="small" @click="replayKnowledge">
                Replay
              </el-button>
            </div>
          </div>
          <h2>{{ knowledge.title }}</h2>
          <hr class="gray-hr" />
          <div class="knowledge-info">
            <span>Label: </span
            ><el-tag size="small">{{ knowledge.category }}</el-tag>
            <span class="author">Author: {{ knowledge.author }}</span>
            <span class="publish-time"
              >Release time: {{ knowledge.formattedTime }}</span
            >
          </div>

          <div v-html="formattedContent"></div>

          <!-- Image Section (Moved after content) -->
          <div v-if="knowledge.image_url" class="image-section">
            <img
              :src="knowledge.image_url"
              alt="Health Knowledge Image"
              class="knowledge-image"
            />
          </div>

          <!-- Video Section (Remains after content, changed to Bilibili iframe) -->
          <div v-if="bilibiliEmbedUrl" class="video-section">
            <iframe
              :src="bilibiliEmbedUrl"
              scrolling="no"
              border="0"
              frameborder="no"
              framespacing="0"
              allowfullscreen="true"
              class="knowledge-video"
            ></iframe>
          </div>
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
import { computed, ref, onMounted, watch, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import {
  Platform,
  DocumentCopy,
  Setting,
  Monitor,
  ChatDotRound,
  Food,
  Basketball,
  Mute, // Import mute icon component
  VolumeUp,
  Microphone, // Import volume icon component
} from "@element-plus/icons-vue";
import {
  ElMessage,
  ElSlider,
  ElSelect,
  ElOption,
  ElButton,
  ElCard,
  ElSkeleton,
  ElTag,
  ElAvatar,
  ElIcon,
  ElAside,
  ElMenu,
  ElMenuItem,
} from "element-plus";

const router = useRouter();
const route = useRoute();
const store = useStore();

const isLoggedIn = computed(() => store.getters.isLoggedIn);

const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};

const knowledgeApiUrl = ref(
  "http://localhost:3060/api/homecare/health-knowledge"
);

const knowledge = ref(null);
const loading = ref(true);
const error = ref(false);
const formattedContent = ref("");

// --- Speech Playback related state and variables ---
const synth = window.speechSynthesis;
const voices = ref([]);
const selectedVoice = ref(null);
const isSpeaking = ref(false);

const speechVolume = ref(1); // Default volume

let currentUtterance = null; // Variable to store the current SpeechSynthesisUtterance object

// Mute related variables
const isMuted = ref(false); // Whether muted
const lastVolume = ref(1); // Volume before muting

// --- Speech Playback related functions ---
const loadVoices = () => {
  voices.value = synth.getVoices();
  // If voices are already fetched, try to select a default Chinese voice
  if (voices.value.length > 0) {
    selectedVoice.value =
      voices.value.find((voice) => voice.lang === "zh-CN") || voices.value[0];
  }
};

const speakText = (text) => {
  if (!synth || isSpeaking.value) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice.value; // Set the voice
  utterance.pitch = 1; // Pitch (0 to 2)
  utterance.rate = 1; // Set speech rate to a fixed value of 1
  utterance.volume = speechVolume.value; // Use the volume variable

  // Store the current utterance object
  currentUtterance = utterance;

  utterance.onstart = () => {
    isSpeaking.value = true;
  };

  utterance.onend = () => {
    isSpeaking.value = false;
    currentUtterance = null; // Clear currentUtterance after speaking ends
  };

  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event);
    if (event.error !== "canceled") {
      ElMessage.error(
        "Speech playback failed, please check browser settings or try again."
      );
    }
    isSpeaking.value = false;
    currentUtterance = null;
  };

  synth.speak(utterance);
};

const stopSpeaking = () => {
  if (synth && isSpeaking.value) {
    if (currentUtterance) {
      currentUtterance.onerror = null; // Remove onerror listener before canceling
    }
    synth.cancel();
    isSpeaking.value = false;
    currentUtterance = null;
  }
};

const toggleMute = () => {
  if (isMuted.value) {
    speechVolume.value = lastVolume.value;
    isMuted.value = false;
  } else {
    lastVolume.value = speechVolume.value;
    speechVolume.value = 0;
    isMuted.value = true;
    stopSpeaking(); // Stop current playback when muted
  }
};

const handleVolumeChange = (value) => {
  if (value > 0) {
    isMuted.value = false;
    lastVolume.value = value;
  } else {
    isMuted.value = true;
  }

  // If currently speaking, stop and restart with the new volume
  if (isSpeaking.value && currentUtterance) {
    const textToSpeak = currentUtterance.text;
    stopSpeaking();
    setTimeout(() => {
      speakText(textToSpeak);
    }, 200); // Delay restarting
  }
};

// Added: Function to replay the knowledge details
const replayKnowledge = () => {
  if (knowledge.value && !isMuted.value) {
    stopSpeaking(); // Stop any current speaking
    const textToSpeak = `${knowledge.value.title}. ${knowledge.value.content}`;
    speakText(textToSpeak);
  } else if (isMuted.value) {
    ElMessage.warning("Please unmute to replay.");
  } else {
    ElMessage.warning("Knowledge details not loaded yet.");
  }
};

// Listen for voiceschanged event, fetch voices again after they are loaded
if (synth) {
  synth.onvoiceschanged = loadVoices;
}

// Watch for voices changes, try to select a default voice after voices are loaded
watch(
  voices,
  (newVoices) => {
    if (newVoices.length > 0 && !selectedVoice.value) {
      selectedVoice.value =
        newVoices.find((voice) => voice.lang === "zh-CN") || newVoices[0];
    }
  },
  { immediate: true }
);

// Computed property to generate Bilibili embed URL
const bilibiliEmbedUrl = computed(() => {
  if (knowledge.value && knowledge.value.video_url) {
    const url = knowledge.value.video_url;
    // Check if it's already an embed URL
    if (url.includes("//player.bilibili.com/player.html")) {
      return url;
    }
    // Attempt to extract BVid from typical Bilibili video URLs
    const bvidMatch = url.match(/BV[0-9a-zA-Z]+/);
    if (bvidMatch && bvidMatch[0]) {
      const bvid = bvidMatch[0];
      return `//player.bilibili.com/player.html?bvid=${bvid}&page=1`;
    }
    // You might need to add more complex parsing for other URL structures if necessary
    console.warn("Could not generate Bilibili embed URL from:", url);
    return null; // Return null if unable to generate embed URL
  }
  return null;
});

const fetchKnowledgeDetail = async (health_knowledge_id) => {
  loading.value = true;
  error.value = false;
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${knowledgeApiUrl.value}/${health_knowledge_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
      knowledge.value = {
        ...data.data,
        formattedTime:
          new Date(data.data.publish_time).toLocaleDateString() +
          " " +
          new Date(data.data.publish_time).toLocaleTimeString(),
      };

      formattedContent.value = knowledge.value.content.replace(/\n/g, "<br>");

      // Automatically speak the knowledge details after loading
      if (!isMuted.value) {
        const textToSpeak = `${knowledge.value.title}. ${knowledge.value.content}`;
        speakText(textToSpeak);
      }
    } else {
      console.error("API returned error:", data.message);
      ElMessage.error(
        data.message || "Failed to obtain health knowledge details"
      );
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

onMounted(() => {
  const healthKnowledgeId = route.params.health_knowledge_id;
  if (healthKnowledgeId) {
    fetchKnowledgeDetail(healthKnowledgeId);
  } else {
    ElMessage.error("Lack of Health Knowledge ID");
    error.value = true;
    loading.value = false;
  }

  if (synth) {
    loadVoices();
  } else {
    ElMessage.warning("Your browser does not support speech playback.");
  }
});

// Stop speech playback before component is unmounted
onBeforeUnmount(() => {
  stopSpeaking();
});

// This is a trick to let ESLint know that Mute, VolumeUp are used
// They will be removed by Tree Shaking in production
// eslint-disable-next-line no-unused-vars
const _icons = { Mute, VolumeUp };
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

.card-footer {
  font-size: 12px;
  color: #606266;
  margin-top: 10px;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  padding: 15px;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  margin-bottom: 15px;
}

.knowledge-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.knowledge-info .el-tag {
  margin-right: 10px;
}

.knowledge-info .author {
  margin-left: 10px;
  margin-right: 10px;
  color: #606266;
  font-size: 12px;
}

.knowledge-info .publish-time {
  color: #606266;
  font-size: 12px;
}

.gray-hr {
  border: 0;
  height: 1px;
  background: #ccc;
  margin: 10px 0;
}

.speech-controls {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  align-items: center;
}

.control-item span {
  font-size: 14px;
  color: #606266;
}

.card-header .el-button {
  margin-left: 10px;
}

.image-section,
.video-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.knowledge-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.knowledge-video {
  width: 100%;
  max-width: 600px;
  height: 400px;
  display: block;
  margin: 0 auto;
}
</style>
