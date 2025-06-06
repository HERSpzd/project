const dbcon = require("../db");
// Connect to the database
var connection = dbcon.getconnection();
connection.connect();
// Import the Express framework
var express = require("express");
// Create a new router
var router = express.Router();
const jwt = require("jsonwebtoken");

const OpenAI = require("openai");

const { AlipaySdk } = require("alipay-sdk");

const { v4: uuidv4 } = require("uuid");

const client = new OpenAI({
  apiKey: "sk-fe0N6iFwSU3hWJL6LTU4XyfGUAbSLfpsI9kqMclyTQGTLmp2",
  baseURL: "https://api.moonshot.cn/v1",
});

const alipaySdk = new AlipaySdk({
  appId: "2021000148622133",

  privateKey:
    "MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDT/p9TcYKfV9KLCzwFxP/m4hTq1rYynssOgx/oZxDzKT1HhUj4XLktp2eadfj3rmEb4CRYztLofCUfMDGGAskosxxjLbE1POpaxC4YdMzlMOog/pz8+0/CZblrRgLFPQgU9mWUaLlrp0G0n2l9fBNv3bP0Qh7T4xHu/dYf9NMwLR2y1qjIPrSKplGWRsq/whGbxV/bck6jXYIe1mC01JREEkLidPjZ0ad0qWLDwGXl5juXR8z46Gh+0wmup6507QBwpAv78oo6rHrh7E//5aNQVvdU71Ez9oL3L8n9qSUiipnkKm3ofxdA0c8jLcIJKzMYqFa3i/Io0lG/+krAo+6jAgMBAAECggEBAMMSDGfLDmgzdtBtQQkKEnPQ23CQrEz+I1kyPV0r4cPu0a2LLu8i217wKPxPzA2VT1RINwnlHtvAyKPfQ+LNk265CckVVXfomrl0xfnJGHVZQkekIq8DTYxS8ICOhqQaGeK4LBaZGu29lU9wVLCcSIJqXlnHsfhFfM4Ok0cKkH5FiAGHE+D+iAEL5xbfNAsne9GzhZO8m8GK50EiXYlq/WYArNMSBdJLn2ls0EuMiGvjNGzA86buuUfBG89JkvUQ4ZA2aLt1+LoLVRf7PPDLN1oqVAl14GNwI34o2qLF0x/QwpyriaCF4WPbx8tO4FrQ+oPt4U0iG+uStQv4wCcQx/kCgYEA97LN9DOlsrrrw0676fhPYCZIsnVJgRTV3MkZnT9ukZUxNLipINSeWFZAcMbr+oJH8c/Qrpcz/nFtv1ujFlL7SUCuO6jsuSIcO4pWa4E5jWJNVkjiOqPhMdclRDdHUkHmOsaIutquljurSOwgC0+D+WiDr/NKPv+6kLYDJP3dZrcCgYEA2xl8uM7qOnSXYnibIOu8rlIu9QRPMG7FAmqybIL57VWo6RijZagDvn0Lcspflhjga8yp+Acc7FUACdGJco595OkpJ3Jg0WOIDceG7dAJgbYDJnVVevHwVGnxPnJBWWj8fT/ywynvnu+1NAEaqafoR6egN2nnB18lplwjcLIm63UCgYEAwiCln0U3EOvESO6VAdr1QrLeeNbJQ9wzfHUzmPUU0A5wYRR0oOFiNHNsz7ZnTY77mb24nIyuWDVHwRitqZphjNifdOyAktvz6ooSDvFZTMCFQiGfBDxaCvjGIT99qy8wpFHi6Sboe5/KLz24I4UvNrI9uxFe2B8OdcngjwZTleMCgYEArmzV/BLOKgdT1ZMKfOTvayAGPg1WNcqZkNj8fqKu8aD2PcvdmTpu8KGAEbzG6CmZ0Hg5ADo5bnQk+awU7lw+IZT1rG/EYC4KzF2CL6UlTFxomZ9jk+M0Xx+QbRRsrg+Eovnb/D9Qgol3CpWuck43/4OVa0gmIpo+0PgdRsStc1kCgYAcS18ft2vCKM/rZcR5LlR9Bv5CA/7JAnw5ltXaeuqAGZI/i5M8D49N5/7F+gV/DyeSdOKCIYj2Cr1VeeEQ17D3kB9XVYtXzBTDc7ZXukjsUqFf35ZXk394O/G5tmPq+uiraGRi1+M+icDPaGWdsW+Sux1iwyVjQ18JpHuAHOIE2Q==",

  alipayPublicKey:
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmPlQLyJ67jy5u6sU12hw4VFUUJ+xFaTXwaY0/o+RfFCHqo3cCiNAqyg4kVtb3YghicnjVN8rCAVCWJUrkPpNrEZGJz/956bctgkrc30OD6GT5LWzi8UhQrTqBCMrZJ84891oFKyxF97SdvyapBw1d5cXA2J1LuJqCP4ykIxaZDvhc64CLWGkLlGQW/fGbJW/zLfUHAi+9w1nTj/D2ZDaoxHOXwD7pXUVKYePM8C1vhjmQ094m7EBKeDfBp+i4oKhrvnDl8H/hRwmIYCMu7r9aIIE1b66km7XdaosR5m5Yl8ApFf9aF/xCBDcB9m/5i+OSiMBpVuYeSrkWLowCV0jRQIDAQAB",

  gateway: "https://openapi-sandbox.dl.alipaydev.com/gateway.do",

  appAuthToken: "<-- 请填写应用授权令牌 -->",
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

/**
 * AI Consultation API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.post("/ai-consultation", verifyToken, async (req, res) => {
  try {
    const userQuestion = req.body.question;
    const userId = req.auth.userId;

    if (!userQuestion) {
      return res
        .status(400)
        .json({ success: false, message: "Question is required" });
    }

    const connection = dbcon.getconnection();

    const historyQuery = `
      SELECT question, answer
      FROM ai_consultation_history
      WHERE user_id = ?
      ORDER BY created_at ASC
      LIMIT 10; -- Limit history to the last N turns (each turn is a question-answer pair)
    `;

    connection.query(historyQuery, [userId], async (err, historyResults) => {
      if (err) {
        console.error("Failed to query AI consultation history:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to get AI consultation history",
        });
      }

      let messages = [
        {
          role: "system",
          content:
            "You are Kimi, an artificial intelligence assistant provided by Moonshot AI, and you are more proficient in Chinese and English conversations. You will provide users with safe, helpful, and accurate answers. At the same time, you will reject any answers related to terrorism, racial discrimination, yellow violence, and other issues. Moonshot AI is a proprietary term and cannot be translated into other languages.",
        },
      ];

      historyResults.forEach((item) => {
        messages.push({ role: "user", content: item.question });
        messages.push({ role: "assistant", content: item.answer });
      });

      messages.push({ role: "user", content: userQuestion });

      try {
        const completion = await client.chat.completions.create({
          model: "moonshot-v1-8k",
          messages: messages,
        });

        const aiMessage = completion.choices[0].message;
        const aiResponseContent = aiMessage.content;
        const insertHistoryQuery = `
          INSERT INTO ai_consultation_history (user_id, question, answer)
          VALUES (?, ?, ?);
        `;
        const insertHistoryValues = [userId, userQuestion, aiResponseContent];

        connection.query(
          insertHistoryQuery,
          insertHistoryValues,
          (err, result) => {
            if (err) {
              console.error("Failed to save AI consultation history:", err);
            }
            console.log("AI consultation history saved.");
          }
        );
        res.json({ success: true, response: aiResponseContent });
      } catch (error) {
        console.error("Error interacting with Moonshot AI:", error);
        let errorMessage = "An error occurred during AI consultation.";
        if (error.response) {
          errorMessage = `AI API Error: ${error.response.status} - ${
            error.response.data.message || "Unknown error"
          }`;
        } else if (error.request) {
          errorMessage = "AI API Request Failed: No response received.";
        } else {
          errorMessage = `An unexpected error occurred: ${error.message}`;
        }
        res.status(500).json({ success: false, message: errorMessage });
      }
    });
  } catch (error) {
    console.error("API endpoint error /ai-consultation:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during AI consultation" });
  }
});

/**
 * Get menu list
 *
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.get("/dishes", verifyToken, async (req, res) => {
  const connection = dbcon.getconnection();
  const getDishesQuery = `
    SELECT dish_id, name, description, price, category, image_url
    FROM dishes;
  `;

  try {
    const [dishes] = await connection.promise().query(getDishesQuery);
    res.json({ success: true, dishes: dishes });
  } catch (err) {
    console.error("Failed to get dishes:", err);
    res.status(500).json({ success: false, message: "Failed to get dishes" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 * Call Alipay payment
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.post("/orders", verifyToken, async (req, res) => {
  const { items, deliveryAddress } = req.body;
  const userId = req.auth.userId;

  if (!items || items.length === 0 || !deliveryAddress) {
    return res.status(400).json({
      success: false,
      message: "Invalid order data: items and deliveryAddress are required",
    });
  }

  const connection = dbcon.getconnection();

  try {
    let totalAmount = 0;
    const orderItemsDetails = [];
    const dishIds = items.map((item) => item.dishId);
    if (dishIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items in the order" });
    }

    const getDishPricesQuery = `
      SELECT dish_id, price, name
      FROM dishes
      WHERE dish_id IN (?);
    `;

    const [dishResults] = await connection
      .promise()
      .query(getDishPricesQuery, [dishIds]);

    if (dishResults.length !== dishIds.length) {
      const foundDishIds = dishResults.map((dish) => dish.dish_id);
      const notFoundDishIds = dishIds.filter(
        (id) => !foundDishIds.includes(id)
      );
      return res.status(400).json({
        success: false,
        message: `Some dishes not found: ${notFoundDishIds.join(", ")}`,
      });
    }

    const dishPriceMap = dishResults.reduce((map, dish) => {
      map[dish.dish_id] = { price: parseFloat(dish.price), name: dish.name };
      return map;
    }, {});

    for (const item of items) {
      const dishInfo = dishPriceMap[item.dishId];
      if (!dishInfo) {
        return res.status(400).json({
          success: false,
          message: `Dish with ID ${item.dishId} not found or price not available`,
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for dish ID ${item.dishId}`,
        });
      }
      totalAmount += dishInfo.price * item.quantity;
      orderItemsDetails.push({
        dishId: item.dishId,
        quantity: item.quantity,
        price: dishInfo.price,
        name: dishInfo.name,
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order total amount must be greater than zero",
      });
    }
    const orderId = uuidv4();
    const orderStatus = "pending_payment"; // Initial status

    const insertOrderQuery = `
      INSERT INTO orders (order_id, user_id, total_amount, delivery_address, status, created_at)
      VALUES (?, ?, ?, ?, ?, NOW());
    `;
    const insertOrderValues = [
      orderId,
      userId,
      totalAmount,
      deliveryAddress,
      orderStatus,
    ];

    const [orderResult] = await connection
      .promise()
      .query(insertOrderQuery, insertOrderValues);

    const insertOrderItemsQuery = `
      INSERT INTO order_items (order_id, dish_id, quantity, price)
      VALUES ?;
    `;
    const orderItemsValues = orderItemsDetails.map((item) => [
      orderId,
      item.dishId,
      item.quantity,
      item.price,
    ]);

    if (orderItemsValues.length > 0) {
      await connection
        .promise()
        .query(insertOrderItemsQuery, [orderItemsValues]);
    }

    const orderSubject = "Smart Home Elderly Care System - Canteen Order";

    const bizContent = {
      out_trade_no: orderId,
      product_code: "FAST_INSTANT_TRADE_PAY",
      total_amount: totalAmount.toFixed(2),
      subject: orderSubject,
    };

    const notifyUrl =
      process.env.ALIPAY_NOTIFY_URL ||
      "https://22ac-121-31-247-81.ngrok-free.app//api/homecare2/alipay-notify";
    const returnUrl =
      process.env.ALIPAY_RETURN_URL || "http://localhost:8081/diet-management";

    const paymentUrl = await alipaySdk.pageExec("alipay.trade.page.pay", {
      notifyUrl: notifyUrl,
      returnUrl: returnUrl,
      bizContent: JSON.stringify(bizContent),
    });

    console.log("Alipay pageExec result:", paymentUrl);
    console.log("Type of pageExec result:", typeof paymentUrl);

    res.json({
      success: true,
      orderId: orderId,
      totalAmount: totalAmount,
      paymentInfo: paymentUrl,
    });
  } catch (error) {
    console.error("Error creating order or initiating Alipay payment:", error);
    if (error.response) {
      console.error("Alipay error response data:", error.response.data);
      console.error("Alipay error response status:", error.response.status);
    }
    res.status(500).json({
      success: false,
      message: "Failed to create order or initiate payment",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 * Alipay returns payment information
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.post("/alipay-notify", async (req, res) => {
  const params = req.body;
  console.log("Received Alipay notification:", params);

  try {
    const isSignatureValid = alipaySdk.checkNotifySign(params);

    if (isSignatureValid) {
      const tradeStatus = params.trade_status;
      const outTradeNo = params.out_trade_no;
      const alipayTradeNo = params.trade_no;

      const connection = dbcon.getconnection();

      if (tradeStatus === "TRADE_SUCCESS") {
        console.log(`Payment successful for order: ${outTradeNo}`);
        const updateOrderQuery = `
                    UPDATE orders
                    SET status = 'paid', alipay_trade_no = ?, paid_at = NOW()
                    WHERE order_id = ? AND status = 'pending_payment'; 
                `;
        connection.query(
          updateOrderQuery,
          [alipayTradeNo, outTradeNo],
          (err, result) => {
            if (err) {
              console.error(
                "Failed to update order status on successful payment:",
                err
              );
            } else if (result.affectedRows === 0) {
              console.warn(
                `Order ${outTradeNo} not found or not in pending status for update.`
              );
            } else {
              console.log(`Order ${outTradeNo} status updated to paid.`);
            }
          }
        );
      } else if (tradeStatus === "TRADE_CLOSED") {
        console.log(`Payment closed for order: ${outTradeNo}`);
        const updateOrderQuery = `
                    UPDATE orders
                    SET status = 'closed'
                    WHERE order_id = ? AND status = 'pending_payment'; -- Only update if status is pending
                `;
        connection.query(updateOrderQuery, [outTradeNo], (err, result) => {
          if (err) {
            console.error(
              "Failed to update order status on closed payment:",
              err
            );
          } else if (result.affectedRows === 0) {
            console.warn(
              `Order ${outTradeNo} not found or not in pending status for update.`
            );
          } else {
            console.log(`Order ${outTradeNo} status updated to closed.`);
          }
        });
      }
      res.send("success");
    } else {
      console.error("Invalid Alipay notification signature");
      res.send("fail");
    }
  } catch (error) {
    console.error("Error processing Alipay notification:", error);
    res.send("fail");
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 * Get order history for the current user
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.get("/history", verifyToken, async (req, res) => {
  const userId = req.auth.userId;
  let connection;

  try {
    connection = await dbcon.getconnection();
    const getOrdersQuery = `
            SELECT
                order_id,
                user_id,
                total_amount,
                status,
                delivery_address,
                alipay_trade_no,
                paid_at,
                created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC;
        `;
    const [orders] = await connection.promise().query(getOrdersQuery, [userId]);
    for (const order of orders) {
      const getOrderItemsQuery = `
                SELECT
                    oi.order_item_id,
                    oi.dish_id,
                    oi.quantity,
                    oi.price,
                    d.name AS dish_name
                FROM order_items oi
                JOIN dishes d ON oi.dish_id = d.dish_id
                WHERE oi.order_id = ?;
            `;
      const [items] = await connection
        .promise()
        .query(getOrderItemsQuery, [order.order_id]);
      order.items = items;
    }

    res.json({ success: true, orders: orders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get order history" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 * Delete order for by ID
 *
 * @param {Object} req
 * @param {Object} res
 */
router.delete("/orders/:orderId", verifyToken, (req, res) => {
  const orderId = req.params.orderId;
  const connection = dbcon.getconnection();
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to database:", err);
      if (connection) {
        try {
          connection.end();
        } catch (closeErr) {
          console.error(
            "Error closing database connection after connection failure:",
            closeErr
          );
        }
      }
      return res
        .status(500)
        .json({ success: false, message: "Database connection failed" });
    }

    const deleteOrderItemsQuery = "DELETE FROM order_items WHERE order_id = ?";
    connection.query(
      deleteOrderItemsQuery,
      [orderId],
      (deleteItemsErr, result) => {
        if (deleteItemsErr) {
          console.error("Error deleting order items:", deleteItemsErr);
          if (connection) {
            try {
              connection.end();
            } catch (closeErr) {
              console.error(
                "Error closing database connection after delete items error:",
                closeErr
              );
            }
          }
          return res
            .status(500)
            .json({ success: false, message: "Failed to delete order items" });
        }

        // Then delete the order
        const deleteOrderQuery = "DELETE FROM orders WHERE order_id = ?";
        connection.query(
          deleteOrderQuery,
          [orderId],
          (deleteOrderErr, result) => {
            if (deleteOrderErr) {
              console.error("Error deleting order:", deleteOrderErr);
              if (connection) {
                try {
                  connection.end();
                } catch (closeErr) {
                  console.error(
                    "Error closing database connection after delete order error:",
                    closeErr
                  );
                }
              }
              return res
                .status(500)
                .json({ success: false, message: "Failed to delete order" });
            }
            res.json({ success: true, message: "Order deleted successfully" });
            if (connection) {
              try {
                connection.end();
              } catch (closeErr) {
                console.error(
                  "Error closing database connection after successful deletion:",
                  closeErr
                );
              }
            }
          }
        );
      }
    );
  });
});

/**
 * Exercise check in
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.post("/checkin", verifyToken, async (req, res) => {
  const userId = req.auth.userId;
  const { exerciseType, duration, notes } = req.body;

  if (!exerciseType || !duration) {
    return res.status(400).json({
      success: false,
      message: "Exercise type and duration are required",
    });
  }

  let connection;
  try {
    connection = await dbcon.getconnection();

    const insertCheckinQuery = `
            INSERT INTO exercise_checkins (user_id, exercise_type, duration, notes, checkin_time)
            VALUES (?, ?, ?, ?, NOW());
        `;
    await connection
      .promise()
      .query(insertCheckinQuery, [userId, exerciseType, duration, notes]);

    res.status(201).json({
      success: true,
      message: "Exercise check-in recorded successfully",
    });
  } catch (error) {
    console.error("Error recording exercise check-in:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to record exercise check-in" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 * Get sports history for the current user
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.get("/sports/history", verifyToken, async (req, res) => {
  const userId = req.auth.userId;
  let connection;

  try {
    connection = await dbcon.getconnection();

    const getExerciseHistoryQuery = `
            SELECT
                checkin_id,
                user_id,
                exercise_type,
                duration,
                notes,
                checkin_time,
                created_at
            FROM exercise_checkins
            WHERE user_id = ?
            ORDER BY checkin_time DESC;
        `;
    const [exerciseHistory] = await connection
      .promise()
      .query(getExerciseHistoryQuery, [userId]);

    res.json({ success: true, exerciseHistory: exerciseHistory });
  } catch (error) {
    console.error("Error fetching exercise history:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get exercise history" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 *
 * Get all coaches
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.get("/coaches", verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getconnection();

    const getCoachesQuery = `
            SELECT
                coach_id,
                name,
                specialty,
                image_url,
                availability
            FROM coaches;
        `;
    const [coaches] = await connection.promise().query(getCoachesQuery);

    res.json({ success: true, coaches: coaches });
  } catch (error) {
    console.error("Error fetching coaches:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch coaches" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 *
 * Book a coach API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.post("/book-coach", verifyToken, async (req, res) => {
  const userId = req.auth.userId; // Get user ID from authenticated token
  const { coachId, date, time, notes } = req.body;

  if (!coachId || !date || !time) {
    return res
      .status(400)
      .json({ success: false, message: "Coach, date, and time are required" });
  }

  let formattedDate = null;
  try {
    const dateObj = new Date(date);
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
    const day = dateObj.getDate().toString().padStart(2, "0");
    formattedDate = `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return res
      .status(400)
      .json({ success: false, message: "Invalid date format" });
  }

  let connection;
  try {
    connection = await dbcon.getconnection();

    const [coaches] = await connection
      .promise()
      .query("SELECT coach_id FROM coaches WHERE coach_id = ?", [coachId]);
    if (coaches.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Coach not found" });
    }

    const insertBookingQuery = `
            INSERT INTO coach_bookings (user_id, coach_id, booking_date, booking_time, notes, status)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

    await connection
      .promise()
      .query(insertBookingQuery, [
        userId,
        coachId,
        formattedDate,
        time,
        notes,
        "pending",
      ]);

    res
      .status(201)
      .json({ success: true, message: "Coach booked successfully" });
  } catch (error) {
    console.error("Error booking coach:", error);
    res.status(500).json({ success: false, message: "Failed to book coach" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 *
 * Get Coach Booking History API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.get("/booking-history", verifyToken, async (req, res) => {
  const userId = req.auth.userId;
  let connection;

  try {
    connection = await dbcon.getconnection();

    const getBookingHistoryQuery = `
            SELECT
                cb.booking_id,
                cb.user_id,
                cb.coach_id,
                cb.booking_date,
                cb.booking_time,
                cb.notes,
                cb.status,
                cb.created_at,
                c.name AS coach_name,
                c.specialty AS coach_specialty
            FROM coach_bookings cb
            JOIN coaches c ON cb.coach_id = c.coach_id
            WHERE cb.user_id = ?
            ORDER BY cb.booking_date DESC, cb.booking_time DESC;
        `;
    const [bookingHistory] = await connection
      .promise()
      .query(getBookingHistoryQuery, [userId]);

    res.json({ success: true, bookingHistory: bookingHistory });
  } catch (error) {
    console.error("Error fetching coach booking history:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get coach booking history" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 *
 * Get all orders API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.get("/all-orders", verifyToken, async (req, res) => {
  let connection;

  try {
    connection = await dbcon.getconnection();
    const getAllOrdersQuery = `
            SELECT
                o.order_id,
                o.user_id,
                o.total_amount,
                o.status,
                o.delivery_address,
                o.alipay_trade_no,
                o.paid_at,
                o.created_at,
                u.username  -- Select username from the users table
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC;
        `;
    const [orders] = await connection.promise().query(getAllOrdersQuery);
    for (const order of orders) {
      const getOrderItemsQuery = `
                SELECT
                    oi.order_item_id,
                    oi.dish_id,
                    oi.quantity,
                    oi.price,
                    d.name AS dish_name
                FROM order_items oi
                JOIN dishes d ON oi.dish_id = d.dish_id
                WHERE oi.order_id = ?;
            `;
      const [items] = await connection
        .promise()
        .query(getOrderItemsQuery, [order.order_id]);
      order.items = items; // Attach items to the order object
    }

    res.json({ success: true, orders: orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get all orders" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 *
 * Get all exercise history API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.get("/all-exercise-history", verifyToken, async (req, res) => {
  let connection;

  try {
    connection = await dbcon.getconnection();
    const getAllExerciseHistoryQuery = `
            SELECT
                eh.checkin_id,
                eh.user_id,
                eh.exercise_type,
                eh.duration,
                eh.notes,
                eh.checkin_time,
                eh.created_at,
                u.username
            FROM exercise_checkins eh
            JOIN users u ON eh.user_id = u.id
            ORDER BY eh.checkin_time DESC;
        `;
    const [history] = await connection
      .promise()
      .query(getAllExerciseHistoryQuery);

    res.json({ success: true, exerciseHistory: history });
  } catch (error) {
    console.error("Error fetching all exercise history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all exercise history",
    });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 *
 * Get all booking history API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.get("/all-booking-history", verifyToken, async (req, res) => {
  let connection;

  try {
    connection = await dbcon.getconnection();
    const getAllBookingHistoryQuery = `
            SELECT
                cb.booking_id,
                cb.user_id,  -- Explicitly select user_id
                cb.coach_id,
                cb.booking_date,
                cb.booking_time,
                cb.notes,
                cb.status,
                cb.created_at,
                c.name AS coach_name,
                c.specialty AS coach_specialty,
                u.username
            FROM coach_bookings cb
            JOIN coaches c ON cb.coach_id = c.coach_id
            JOIN users u ON cb.user_id = u.id
            ORDER BY cb.booking_date DESC, cb.booking_time DESC;
        `;
    const [history] = await connection
      .promise()
      .query(getAllBookingHistoryQuery);

    res.json({ success: true, bookingHistory: history });
  } catch (error) {
    console.error("Error fetching all booking history:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get all booking history" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 *
 * Delete booking API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.delete("/booking/:booking_id", verifyToken, async (req, res) => {
  const bookingId = req.params.booking_id;
  const userId = req.auth.userId;

  let connection;

  try {
    connection = await dbcon.getconnection();
    const deleteBookingQuery = `
            DELETE FROM coach_bookings
            WHERE booking_id = ?;
        `;
    const [result] = await connection
      .promise()
      .query(deleteBookingQuery, [bookingId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Booking not found." });
    } else {
      res.json({ success: true, message: "Booking deleted successfully." });
    }
  } catch (error) {
    console.error("Error deleting booking:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete booking" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 *
 * Get all AI consultation history API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.get("/all-ai-consultation-history", verifyToken, async (req, res) => {
  let connection;

  try {
    connection = await dbcon.getconnection();
    const getAllAIConsultationHistoryQuery = `
            SELECT
                ach.ai_consultation_id,
                ach.user_id,  -- Explicitly select user_id
                ach.question,
                ach.answer,
                ach.created_at,
                u.username
            FROM ai_consultation_history ach
            JOIN users u ON ach.user_id = u.id
            ORDER BY ach.created_at DESC;
        `;
    const [history] = await connection
      .promise()
      .query(getAllAIConsultationHistoryQuery);
    const formattedHistory = history.map((record) => ({
      id: record.ai_consultation_id,
      user_id: record.user_id,
      username: record.username,
      question: record.question,
      answer: record.answer,
      timestamp: record.created_at,
    }));

    res.json({ success: true, history: formattedHistory });
  } catch (error) {
    console.error("Error fetching all AI consultation history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all AI consultation history",
    });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 *
 * PUT endpoint to update order status to 'delivering' and 'completed' API
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.put("/change-status/:orderId", verifyToken, async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;
  const allowedStatuses = ["delivering", "completed"];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid or missing status. Allowed statuses are: ${allowedStatuses.join(
        ", "
      )}.`,
    });
  }

  let connection;

  try {
    connection = await dbcon.getconnection();

    let updateStatusQuery = "";
    let queryParams = [status, orderId];
    if (status === "delivering") {
      // Only update to 'delivering' if current status is 'paid'
      updateStatusQuery = `
                UPDATE orders
                SET status = ?
                WHERE order_id = ? AND status = 'paid';
            `;
    } else if (status === "completed") {
      updateStatusQuery = `
                UPDATE orders
                SET status = ?
                WHERE order_id = ? AND status = 'delivering';
            `;
    }

    if (!updateStatusQuery) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status transition." });
    }

    const [result] = await connection
      .promise()
      .query(updateStatusQuery, queryParams);

    if (result.affectedRows === 0) {
      const [order] = await connection
        .promise()
        .query("SELECT status FROM orders WHERE order_id = ?", [orderId]);

      if (order.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      } else {
        return res.status(400).json({
          success: false,
          message: `Order status is "${order[0].status}", cannot change to "${status}".`,
        });
      }
    }

    res.json({
      success: true,
      message: `Order status updated to "${status}" successfully`,
    });
  } catch (error) {
    console.error(`Error updating order status to ${status}:`, error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  } finally {
    if (connection) {
      connection.end();
      console.log("Database connection closed.");
    }
  }
});

/**
 * AI Health Analysis API (Sprint 3)
 * Analyzes user's historical blood pressure and blood sugar data using Kimi AI.
 *
 * @param {Object} req
 * @param {Object} res
 * @return {undefined}
 */
router.post("/health-analysis", verifyToken, async (req, res) => {
  console.log("Checking AI client:", client); // Debugging: Check if 'client' is defined
  try {
    const userId = req.auth.userId;

    const connection = dbcon.getconnection();

    // Fetch user's historical blood pressure data
    const bloodPressureQuery = `
      SELECT systolic, diastolic, pulse, created_at
      FROM blood_pressure
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10; -- Limit history to the last 10 entries
    `;

    // Fetch user's historical blood sugar data
    const bloodSugarQuery = `
      SELECT value, time, created_at
      FROM blood_sugar
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10; -- Limit history to the last 10 entries
    `;

    // Use Promise.all to fetch data from both tables concurrently
    const [bloodPressureResults, bloodSugarResults] = await Promise.all([
      new Promise((resolve, reject) => {
        connection.query(bloodPressureQuery, [userId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        connection.query(bloodSugarQuery, [userId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      }),
    ]);

    if (bloodPressureResults.length === 0 && bloodSugarResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No health data found for this user.",
      });
    }

    // Format the health data for the AI model
    let formattedHealthData = "";

    if (bloodPressureResults.length > 0) {
      formattedHealthData += "Historical Blood Pressure Data:\n";
      formattedHealthData += bloodPressureResults
        .map((data) => {
          return `Date: ${data.created_at.toISOString().split("T")[0]}, Time: ${
            data.created_at.toTimeString().split(" ")[0]
          }, Systolic: ${data.systolic}, Diastolic: ${data.diastolic}, Pulse: ${
            data.pulse
          }`;
        })
        .join("\n");
      formattedHealthData += "\n\n"; // Add spacing between data types
    }

    if (bloodSugarResults.length > 0) {
      formattedHealthData += "Historical Blood Sugar Data:\n";
      formattedHealthData += bloodSugarResults
        .map((data) => {
          return `Date: ${
            data.created_at.toISOString().split("T")[0]
          }, Measurement Time Point: ${data.time}, Blood Sugar Value: ${
            data.value
          }`;
        })
        .join("\n");
    }

    // Construct messages for Kimi
    let messages = [
      {
        role: "system",
        content:
          "You are a health analysis assistant provided by Moonshot AI. You will analyze the historical blood pressure and blood sugar data provided by the user and offer personalized health advice based on this data. Your advice should be helpful, accurate, and easy to understand. Please note that the advice you provide is not a substitute for professional medical diagnosis or treatment. Please provide the analysis and suggestions in English. Moonshot AI is a proper noun and should not be translated into other languages.",
      },
      {
        role: "user",
        content: `Please analyze my following health data and provide suggestions in English:\n${formattedHealthData}`,
      },
    ];

    try {
      // Call Kimi AI for health analysis
      const completion = await client.chat.completions.create({
        // Using 'client' as defined in your environment
        model: "moonshot-v1-8k", // Using a Kimi model name
        messages: messages,
        // Add other necessary parameters according to Kimi's API documentation
      });

      const aiMessage = completion.choices[0].message;
      const aiResponseContent = aiMessage.content;

      res.json({ success: true, analysis: aiResponseContent });
    } catch (error) {
      console.error(
        "Error interacting with Moonshot AI for health analysis:",
        error
      );
      let errorMessage =
        "An error occurred during health analysis with Moonshot AI.";
      if (error.response) {
        errorMessage = `Moonshot AI API Error: ${error.response.status} - ${
          error.response.data.message || "Unknown error"
        }`;
      } else if (error.request) {
        errorMessage = "Moonshot AI API Request Failed: No response received.";
      } else {
        errorMessage = `An unexpected error occurred: ${error.message}`;
      }
      res.status(500).json({ success: false, message: errorMessage });
    }
  } catch (error) {
    console.error("API endpoint error /health-analysis:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during health analysis" });
  }
});

module.exports = router;
