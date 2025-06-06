const dbcon = require("../db");
// Connect to the database (This should be done only once at server startup)
var connection = dbcon.getconnection();
connection.connect();
// Import the Express framework
var express = require("express");
// Create a new router
var router = express.Router();
const bcrypt = require("bcryptjs"); // Used for password hashing
const jwt = require("jsonwebtoken"); // Introducing JSONWebToken
const axios = require("axios");

const AK = "ilJCmly4tbk60i8H3sx6CcOi";
const SK = "HZ77xeDDmn87DcZ18MGpCRaWF6FiHPLs";

/**
 * Register User API
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {undefined}
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password, email, phone, user_type } = req.body;

    // Data validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password cannot be empty" });
    }

    // Check if the username already exists
    const connection = dbcon.getconnection();
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, existingUsers) => {
        if (err) {
          console.error("Failed to query user:", err);
          return res.status(500).json({ message: "Failed to register user" });
        }

        if (existingUsers.length > 0) {
          return res.status(400).json({ message: "Username already exists" });
        }

        // 3. Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Password hashing failed:", err);
            return res.status(500).json({ message: "Failed to register user" });
          }

          // 4. Insert the new user
          connection.query(
            "INSERT INTO users (username, password, email, phone, user_type) VALUES (?, ?, ?, ?, ?)",
            [username, hashedPassword, email, phone, user_type || "elderly"],
            (err, result) => {
              if (err) {
                console.error("Failed to insert user:", err);
                return res
                  .status(500)
                  .json({ message: "Failed to register user" });
              }

              // 5. Return the new user information
              const newUser = {
                id: result.insertId,
                username,
                email,
                phone,
                user_type: user_type || "elderly",
              };
              res.status(201).json({
                message: "User registered successfully",
                user: newUser,
              });
            }
          );
        });
      }
    );
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
});

/**
 * User login API
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {undefined}
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Data validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password cannot be empty" });
    }
    const connection = dbcon.getconnection(); // Get database connection

    // 2. Find user
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, users) => {
        if (err) {
          console.error("Failed to query user:", err);
          return res.status(500).json({ message: "Failed to login" });
        }

        if (users.length === 0) {
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        const user = users[0];

        // 3. Verify password
        bcrypt.compare(password, user.password, (err, passwordMatch) => {
          if (err) {
            console.error("Password comparison failed:", err);
            return res.status(500).json({ message: "Failed to login" });
          }

          if (!passwordMatch) {
            return res
              .status(401)
              .json({ message: "Invalid username or password" });
          }

          // 4. Generate JWT (JSON Web Token)
          const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.user_type }, // Add role information to payload
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "24h" }
          );

          // 5. Return token and user information
          res.json({
            message: "Login successful",
            token: token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone,
              role: user.user_type,
            },
          });
        });
      }
    );
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ message: "Failed to login" });
  }
});

/**
 * Middleware to verify JWT token
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {undefined}
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Bearer <token>

    jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret",
      (err, user) => {
        if (err) {
          return res.status(403).json({ message: "Invalid token" });
        }

        req.auth = user;
        next();
      }
    );
  } else {
    return res.status(401).json({ message: "Authentication required" });
  }
}

// Apply the middleware to the routes that require authentication
router.use("/health-knowledge", verifyToken);
router.use("/upload-image", verifyToken);
router.use("/upload-image-2", verifyToken);
router.use("/history-data", verifyToken);
router.use("/health-knowledge-delete/:health_knowledge_id", verifyToken);
router.use("/health-knowledge-update/:health_knowledge_id", verifyToken);

/**
 * Publish Health Knowledge API
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {undefined}
 */
router.post("/health-knowledge", (req, res) => {
  try {
    const { title, content, category, author, image_url, video_url } = req.body;

    // Get current user ID
    if (!req.auth || !req.auth.userId) {
      console.error("User not authenticated or missing user ID");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.auth.userId;

    // 1. Data validation
    if (!title || !content || !category || !author) {
      return res.status(400).json({
        success: false,
        message: "Title, content, category, and author cannot be empty",
      });
    }

    // 2. Insert health knowledge
    const connection = dbcon.getconnection(); // Get database connection
    const query =
      "INSERT INTO health_knowledge (title, content, category, author, image_url, video_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    connection.query(
      query,
      [title, content, category, author, image_url, video_url, userId],
      (err, result) => {
        if (err) {
          console.error("Failed to insert health knowledge:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to publish health knowledge",
          });
        }

        // 3. Return new health knowledge information
        const newHealthKnowledge = {
          health_knowledge_id: result.insertId,
          title,
          content,
          category,
          author,
          image_url,
          video_url,
          user_id: userId,
        };
        res.status(201).json({
          success: true,
          message: "Health knowledge published successfully",
          data: newHealthKnowledge,
        });
      }
    );
  } catch (error) {
    console.error("Failed to publish health knowledge:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to publish health knowledge" });
  }
});

/**
 * Get Access Token
 *
 * @async
 * @function getAccessToken
 * @returns {Promise<String>}
 */
async function getAccessToken() {
  let options = {
    method: "POST",
    url:
      "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=" +
      AK +
      "&client_secret=" +
      SK,
  };
  try {
    const res = await axios(options);
    return res.data.access_token;
  } catch (error) {
    console.error("Failed to obtain Access Token:", error);
    throw error;
  }
}

/**
 * Call Baidu Image Understanding API
 *
 * @param {String} imageData
 * @return {Promise<String>}
 */
async function callBaiduImageUnderstandingAPI(imageData) {
  const accessToken = await getAccessToken();
  const options = {
    method: "POST",
    url:
      "https://aip.baidubce.com/rest/2.0/image-classify/v1/image-understanding/request?access_token=" +
      accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      image: imageData,
      question:
        "高血压、低血压、脉搏分别是多少?格式化输出（高血压：低血压：脉搏：）",
    }),
  };

  try {
    const response = await axios(options);
    console.log("Baidu API Response:", response.data); // Log the response data
    return response.data.result.task_id; // Return task_id
  } catch (error) {
    console.error("Failed to call Baidu Image Understanding API:", error);
    throw error;
  }
}

/**
 * Used to call Baidu Image Understanding API
 *
 * @param {String} imageData
 * @return {Promise<String>}
 */
async function callBaiduImageUnderstandingAPI2(imageData) {
  const accessToken = await getAccessToken();
  const options = {
    method: "POST",
    url:
      "https://aip.baidubce.com/rest/2.0/image-classify/v1/image-understanding/request?access_token=" +
      accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      image: imageData,
      question: "What is the blood sugar level in the picture?", // You can modify the question as needed
    }),
  };

  try {
    const response = await axios(options);
    console.log("Baidu API Response:", response.data); // Log the response data
    return response.data.result.task_id; // Return task_id
  } catch (error) {
    console.error("Failed to call Baidu Image Understanding API:", error);
    throw error;
  }
}

/**
 * Used to obtain the results of Baidu Image Understanding
 *
 * @param {String} taskId
 * @return {Object}
 */
async function getBaiduImageUnderstandingResult(taskId) {
  const accessToken = await getAccessToken();
  const options = {
    method: "POST",
    url:
      "https://aip.baidubce.com/rest/2.0/image-classify/v1/image-understanding/get-result?access_token=" +
      accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      task_id: taskId,
    }),
  };

  try {
    const response = await axios(options);
    console.log("Get Image Understanding Result API Response:", response.data); // Log the response data
    return response.data;
  } catch (error) {
    console.error("Failed to get Image Understanding Result API:", error);
    throw error;
  }
}

/**
 * Uploads an image, calls Baidu Image Understanding API to extract blood pressure and pulse data, and stores the data in the database.
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} - JSON response
 */
router.post("/upload-image", async (req, res) => {
  console.log("req.auth:", req.auth);
  try {
    const imageData = req.body.image; // Get Base64 encoded image data
    if (!imageData) {
      return res
        .status(400)
        .json({ success: false, message: "Missing image data" });
    }

    const taskId = await callBaiduImageUnderstandingAPI(imageData); // Call Baidu Image Understanding API, get task_id

    // Poll for image understanding result
    let baiduResponse = null;
    let maxRetries = 10; // Maximum number of retries
    let retryInterval = 1000; // Retry interval (milliseconds)

    for (let i = 0; i < maxRetries; i++) {
      baiduResponse = await getBaiduImageUnderstandingResult(taskId); // Get image understanding result based on task_id

      if (
        baiduResponse &&
        baiduResponse.result &&
        baiduResponse.result.ret_code === 0
      ) {
        // Result is ready, break the loop
        break;
      } else if (
        baiduResponse &&
        baiduResponse.result &&
        baiduResponse.result.ret_code === 1
      ) {
        // Result is still being processed, wait for a while and retry
        console.log(
          `Result is still being processed, retrying after ${retryInterval} milliseconds (attempt ${
            i + 1
          })`
        );
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      } else {
        // An error occurred, stop polling
        console.error(
          "Failed to get image understanding result:",
          baiduResponse
        );
        return res.json({
          success: false,
          message: "Failed to get image understanding result",
        });
      }
    }

    // Check if the result was successfully obtained
    if (
      !(
        baiduResponse &&
        baiduResponse.result &&
        baiduResponse.result.ret_code === 0
      )
    ) {
      console.error(
        "Reached maximum number of retries, still unable to get image understanding result"
      );
      return res.json({
        success: false,
        message: "Unable to get image understanding result",
      });
    }

    // Parse Baidu API return result and convert it to the format needed by the frontend
    const description = baiduResponse.result.description;

    // Use regular expressions to extract blood pressure and pulse values
    const systolicRegex = /高血压：(\d+)/;
    const diastolicRegex = /低血压：(\d+)/;
    const pulseRegex = /脉搏：(\d+)/;

    const systolicMatch = description.match(systolicRegex);
    const diastolicMatch = description.match(diastolicRegex);
    const pulseMatch = description.match(pulseRegex);

    if (
      systolicMatch &&
      systolicMatch.length === 2 &&
      diastolicMatch &&
      diastolicMatch.length === 2 &&
      pulseMatch &&
      pulseMatch.length === 2
    ) {
      const systolic = parseInt(systolicMatch[1]);
      const diastolic = parseInt(diastolicMatch[1]);
      const pulse = parseInt(pulseMatch[1]);

      // Get user ID from req.auth object
      if (!req.auth || !req.auth.userId) {
        console.error("User not authenticated or missing user ID");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const userId = req.auth.userId;

      // Insert blood pressure and pulse data into the database
      const connection = dbcon.getconnection(); // Get database connection
      const query =
        "INSERT INTO blood_pressure (user_id, systolic, diastolic, pulse) VALUES (?, ?, ?, ?)";
      connection.query(
        query,
        [userId, systolic, diastolic, pulse],
        (err, result) => {
          if (err) {
            console.error("Failed to store blood pressure data:", err);
            return res.status(500).json({
              success: false,
              message: "Failed to store blood pressure data",
            });
          }

          console.log("Blood pressure data stored successfully:", result);

          return res.json({
            success: true,
            message: "Success",
            data: {
              type: "blood_pressure",
              value: {
                systolic: systolic,
                diastolic: diastolic,
                pulse: pulse,
              },
            },
          });
        }
      );
    } else {
      console.log("Regular expression matching failed:", {
        systolicMatch,
        diastolicMatch,
        pulseMatch,
      }); // Log the matching results
      return res.json({ success: false, message: "No valid data recognized" });
    }
  } catch (error) {
    console.error("API interface error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Used to obtain the results of Baidu image understanding (blood glucose specific)
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} - JSON response
 */
router.post("/upload-image-2", async (req, res) => {
  console.log("req.auth:", req.auth);
  try {
    const { image } = req.body; // Get Base64 encoded image data
    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Missing image data" });
    }

    const taskId = await callBaiduImageUnderstandingAPI2(image); // Call Baidu Image Understanding API, get task_id

    // Poll for image understanding result
    let baiduResponse = null;
    let maxRetries = 10; // Maximum number of retries
    let retryInterval = 1000; // Retry interval (milliseconds)

    for (let i = 0; i < maxRetries; i++) {
      baiduResponse = await getBaiduImageUnderstandingResult(taskId); // Get image understanding result based on task_id

      if (
        baiduResponse &&
        baiduResponse.result &&
        baiduResponse.result.ret_code === 0
      ) {
        // Result is ready, break the loop
        break;
      } else if (
        baiduResponse &&
        baiduResponse.result &&
        baiduResponse.result.ret_code === 1
      ) {
        // Result is still being processed, wait for a while and retry
        console.log(
          `Result is still being processed, retrying after ${retryInterval} milliseconds (attempt ${
            i + 1
          })`
        );
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      } else {
        // An error occurred, stop polling
        console.error(
          "Failed to get image understanding result:",
          baiduResponse
        );
        return res.json({
          success: false,
          message: "Failed to get image understanding result",
        });
      }
    }

    // Check if the result was successfully obtained
    if (
      !(
        baiduResponse &&
        baiduResponse.result &&
        baiduResponse.result.ret_code === 0
      )
    ) {
      console.error(
        "Reached maximum number of retries, still unable to get image understanding result"
      );
      return res.json({
        success: false,
        message: "Unable to get image understanding result",
      });
    }

    // Parse Baidu API return result and convert it to the format needed by the frontend
    const description = baiduResponse.result.description;

    // Use regular expressions to extract blood sugar value
    const bloodSugarRegex =
      /blood sugar level in the picture is\s*(\d+(\.\d+)?)\s*mmol\/L/;
    const bloodSugarMatch = description.match(bloodSugarRegex);

    if (bloodSugarMatch && bloodSugarMatch.length >= 2) {
      const bloodSugar = parseFloat(bloodSugarMatch[1]); // Extract blood sugar value and convert it to a float

      // Get current user ID (assuming you have implemented authentication)
      // Get user ID from req.auth object
      if (!req.auth || !req.auth.userId) {
        console.error("User not authenticated or missing user ID");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const userId = req.auth.userId;

      // Insert blood sugar data into the database
      const connection = dbcon.getconnection(); // Get database connection
      const query = "INSERT INTO blood_sugar (user_id, value) VALUES (?, ?)";
      const queryParams = [userId, bloodSugar];
      connection.query(query, queryParams, (err, result) => {
        if (err) {
          console.error("Failed to store blood sugar data:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to store blood sugar data",
          });
        }

        console.log("Blood sugar data stored successfully:", result);

        return res.json({
          success: true,
          message: "Success",
          data: {
            type: "blood_sugar",
            value: {
              bloodSugar: bloodSugar,
            },
          },
        });
      });
    } else {
      console.log("Blood sugar regular expression matching failed:", {
        bloodSugarMatch,
      });
      return res.json({
        success: false,
        message: "No valid blood sugar data recognized",
      });
    }
  } catch (error) {
    console.error("API interface error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * API for obtaining historical data
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} - JSON response
 */
router.get("/history-data", async (req, res) => {
  try {
    // Get current user ID
    if (!req.auth || !req.auth.userId) {
      console.error("User not authenticated or missing user ID");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.auth.userId;

    // Query blood pressure data
    const connection = dbcon.getconnection(); // Get database connection
    const bloodPressureQuery =
      "SELECT systolic, diastolic, pulse, created_at FROM blood_pressure WHERE user_id = ? ORDER BY created_at DESC LIMIT 10";
    const bloodPressureQueryParams = [userId];
    connection.query(
      bloodPressureQuery,
      bloodPressureQueryParams,
      (err, bloodPressureResults) => {
        if (err) {
          console.error("Failed to query blood pressure data:", err);
          return res
            .status(500)
            .json({ success: false, message: "Failed to get history data" });
        }

        // Query blood sugar data
        const bloodSugarQuery =
          "SELECT value AS bloodSugar, created_at FROM blood_sugar WHERE user_id = ? ORDER BY created_at DESC LIMIT 10";
        const bloodSugarQueryParams = [userId];
        connection.query(
          bloodSugarQuery,
          bloodSugarQueryParams,
          (err, bloodSugarResults) => {
            if (err) {
              console.error("Failed to query blood sugar data:", err);
              return res.status(500).json({
                success: false,
                message: "Failed to get history data",
              });
            }

            // Combine data
            const historyData = [];

            // Add blood pressure data
            bloodPressureResults.forEach((result) => {
              historyData.push({
                time: result.created_at,
                type: "blood_pressure",
                value: {
                  systolic: result.systolic,
                  diastolic: result.diastolic,
                  pulse: result.pulse,
                },
              });
            });

            // Add blood sugar data
            bloodSugarResults.forEach((result) => {
              historyData.push({
                time: result.created_at,
                type: "blood_sugar",
                value: {
                  bloodSugar: result.bloodSugar,
                },
              });
            });

            // Sort by time
            historyData.sort((a, b) => new Date(b.time) - new Date(a.time));

            // Return data
            res.json({
              success: true,
              data: historyData,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("API interface error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * API for obtaining historical data  (for socialworkerside)
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} - JSON response
 */
router.get("/history-data-2", async (req, res) => {
  try {
    const connection = dbcon.getconnection(); // Get database connection

    // Query blood pressure data
    const bloodPressureQuery = `
      SELECT
        bp.systolic,
        bp.diastolic,
        bp.pulse,
        bp.created_at,
        u.id AS user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.date_of_birth,
        u.gender
      FROM blood_pressure bp
      INNER JOIN users u ON bp.user_id = u.id
      ORDER BY bp.created_at DESC
    `;

    // Query blood sugar data
    const bloodSugarQuery = `
      SELECT
        bs.value AS bloodSugar,
        bs.created_at,
        u.id AS user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.date_of_birth,
        u.gender
      FROM blood_sugar bs
      INNER JOIN users u ON bs.user_id = u.id
      ORDER BY bs.created_at DESC
    `;

    // Execute queries in parallel
    Promise.all([
      new Promise((resolve, reject) => {
        connection.query(bloodPressureQuery, (err, results) => {
          if (err) {
            console.error("Failed to query blood pressure data:", err);
            reject({
              success: false,
              message: "Failed to get blood pressure data",
              error: err,
            });
          } else {
            resolve({ success: true, data: results });
          }
        });
      }),
      new Promise((resolve, reject) => {
        connection.query(bloodSugarQuery, (err, results) => {
          if (err) {
            console.error("Failed to query blood sugar data:", err);
            reject({
              success: false,
              message: "Failed to get blood sugar data",
              error: err,
            });
          } else {
            resolve({ success: true, data: results });
          }
        });
      }),
    ])
      .then((results) => {
        const bloodPressureResult = results[0];
        const bloodSugarResult = results[1];

        if (!bloodPressureResult.success || !bloodSugarResult.success) {
          // Combine potential errors if needed, or just report general failure
          const errors = [];
          if (!bloodPressureResult.success)
            errors.push(bloodPressureResult.error);
          if (!bloodSugarResult.success) errors.push(bloodSugarResult.error);

          return res.status(500).json({
            success: false,
            message: "Failed to get history data", // Changed message
            errors: errors, // Changed key name slightly for clarity
          });
        }

        // Return data
        res.json({
          success: true,
          bloodPressureData: bloodPressureResult.data,
          bloodSugarData: bloodSugarResult.data,
        });
      })
      .catch((error) => {
        // This catch handles errors from the Promise creation or connection.query rejections
        console.error("API endpoint error (Promise.all):", error); // Clarified log source
        // Check if error is one of our structured rejection objects
        const errorMessage = error?.message || "Server error";
        const errorDetails = error?.error || error; // Get original DB error if available
        return res
          .status(500)
          .json({ success: false, message: errorMessage, error: errorDetails });
      });
  } catch (error) {
    // This catch handles errors outside the Promise chain (e.g., getting connection)
    console.error("API endpoint error (Outer try/catch):", error); // Clarified log source
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Get Health Knowledge List API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {Object}
 */
router.get("/health-knowledge", (req, res) => {
  const connection = dbcon.getconnection(); // Get database connection
  const query =
    "SELECT health_knowledge_id, title, content, category, author, publish_time, image_url, video_url FROM health_knowledge";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Failed to query health knowledge:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to get health knowledge" });
    }

    res.json({ success: true, data: results });
  });
});

/**
 * API for obtaining health knowledge by id
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} - JSON response
 */
router.get("/health-knowledge/:health_knowledge_id", (req, res) => {
  const connection = dbcon.getconnection(); // Get database connection
  const health_knowledge_id = req.params.health_knowledge_id; // Get health_knowledge_id parameter

  const query =
    "SELECT health_knowledge_id, title, content, category, author, publish_time, image_url, video_url FROM health_knowledge WHERE health_knowledge_id = ?";

  connection.query(query, [health_knowledge_id], (err, results) => {
    if (err) {
      console.error("Failed to query health knowledge:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to get health knowledge" });
    }

    // Check if a record was found
    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Health knowledge not found" });
    }

    res.json({ success: true, data: results[0] }); // Return a single health knowledge object
  });
});

/**
 * Delete Health Knowledge API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {Object}
 */
router.delete("/health-knowledge-delete/:health_knowledge_id", (req, res) => {
  const health_knowledge_id = req.params.health_knowledge_id;
  const connection = dbcon.getconnection(); // Get database connection

  const query = "DELETE FROM health_knowledge WHERE health_knowledge_id = ?";
  connection.query(query, [health_knowledge_id], (err, result) => {
    if (err) {
      console.error("Failed to delete health knowledge:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete health knowledge" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Health knowledge not found" });
    }

    res.json({
      success: true,
      message: "Health knowledge deleted successfully",
    });
  });
});

/**
 * Update Health Knowledge API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {Object}
 */
router.put("/health-knowledge-update/:health_knowledge_id", (req, res) => {
  const health_knowledge_id = req.params.health_knowledge_id;
  const { title, content, category, author, image_url, video_url } = req.body;
  const connection = dbcon.getconnection(); // Get database connection

  const query =
    "UPDATE health_knowledge SET title = ?, content = ?, category = ?, author = ?, image_url = ?, video_url = ? WHERE health_knowledge_id = ?";
  connection.query(
    query,
    [
      title,
      content,
      category,
      author,
      image_url,
      video_url,
      health_knowledge_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Failed to update health knowledge:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update health knowledge",
        });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Health knowledge not found" });
      }

      res.json({
        success: true,
        message: "Health knowledge updated successfully",
      });
    }
  );
});

/**
 * Publish Health Knowledge API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {Object}
 */
router.post("/health-knowledge-publish", verifyToken, (req, res) => {
  try {
    const { title, content, category, author, image_url, video_url } = req.body;

    // Get current user ID
    if (!req.auth || !req.auth.userId) {
      console.error("User not authenticated or missing user ID");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.auth.userId;

    // 1. Data validation
    if (!title || !content || !category || !author) {
      return res.status(400).json({
        success: false,
        message: "Title, content, category, and author cannot be empty",
      });
    }

    // 2. Insert health knowledge
    const connection = dbcon.getconnection(); // Get database connection
    const query =
      "INSERT INTO health_knowledge (title, content, category, author, image_url, video_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    connection.query(
      query,
      [title, content, category, author, image_url, video_url, userId],
      (err, result) => {
        if (err) {
          console.error("Failed to insert health knowledge:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to publish health knowledge",
          });
        }

        // 3. Return new health knowledge information
        const newHealthKnowledge = {
          health_knowledge_id: result.insertId,
          title,
          content,
          category,
          author,
          image_url,
          video_url,
          user_id: userId,
        };
        res.status(201).json({
          success: true,
          message: "Health knowledge published successfully",
          data: newHealthKnowledge,
        });
      }
    );
  } catch (error) {
    console.error("Failed to publish health knowledge:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to publish health knowledge" });
  }
});

/**
 * Read (GET): Get all users
 *
 * @param {Object} req
 * @param {Object} res
 * @return {Object}
 */
router.get("/users", verifyToken, async (req, res) => {
  try {
    const connection = dbcon.getconnection(); // Get database connection
    const query = `
      SELECT id, username, email, phone, user_type, created_at, first_name, last_name, date_of_birth, gender, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone, allergies
      FROM users
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Failed to query users:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to get user list" });
      }

      res.json({ success: true, data: results });
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res
      .status(500)
      .json({ message: "Failed to get users", error: error.message });
  }
});

/**
 * Read (GET): Get a user by ID
 *
 * @param {Object} req
 * @param {Object} res
 * @return {Object}
 */
router.get("/users/:id", verifyToken, async (req, res) => {
  try {
    const connection = dbcon.getconnection(); // Get database connection
    const userId = req.params.id;

    const query = `
      SELECT id, username, email, phone, user_type, created_at, first_name, last_name, date_of_birth, gender, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone, allergies
      FROM users
      WHERE id = ?
    `;

    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Failed to query user:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to get user information" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: results[0] }); // Return a single user information object
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res
      .status(500)
      .json({ message: "Failed to get user", error: error.message });
  }
});

/**
 * Update (PUT): Update an existing user by ID
 *
 * @param {Object} req
 * @param {Object} res
 * @return {Object}
 */
router.put("/users/:id", verifyToken, async (req, res) => {
  try {
    const connection = dbcon.getconnection(); // Get database connection
    const userId = req.params.id;
    const {
      username,
      email,
      phone,
      user_type,
      first_name,
      last_name,
      date_of_birth,
      gender,
      address,
      city,
      state,
      zip_code,
      emergency_contact_name,
      emergency_contact_phone,
      allergies,
    } = req.body;

    // Format the date_of_birth
    const formattedDateOfBirth = formatDate(date_of_birth);

    const query = `
      UPDATE users
      SET username = ?, email = ?, phone = ?, user_type = ?, first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, address = ?, city = ?, state = ?, zip_code = ?, emergency_contact_name = ?, emergency_contact_phone = ?, allergies = ?
      WHERE id = ?
    `;

    connection.query(
      query,
      [
        username,
        email,
        phone,
        user_type,
        first_name,
        last_name,
        formattedDateOfBirth, // Use the formatted date
        gender,
        address,
        city,
        state,
        zip_code,
        emergency_contact_name,
        emergency_contact_phone,
        allergies,
        userId,
      ],
      (err, results) => {
        if (err) {
          console.error("Failed to update user:", err);
          return res
            .status(500)
            .json({ success: false, message: "Failed to update user" });
        }

        if (results.affectedRows === 0) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "User updated successfully" });
      }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
});

/**
 * Delete an existing user by ID
 *
 * @param {Object} req
 * @param {Object} res
 * @return {Object}
 */
router.delete("/users/:id", verifyToken, async (req, res) => {
  try {
    const connection = dbcon.getconnection(); // Get database connection
    const userId = req.params.id;

    const query = `
      DELETE FROM users
      WHERE id = ?
    `;

    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Failed to delete user:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to delete user" });
      }

      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, message: "User deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
});

/**
 * This is a function for formatting dates.
 * If the input parameter is empty, return null.
 * Otherwise, convert the input date to the format of year month day. (YYYY-MM-DD)
 *
 * @param {Date} date
 * @return {String/Null}
 */
function formatDate(date) {
  if (!date) return null; // Handle null or undefined dates
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  let year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

module.exports = router;
