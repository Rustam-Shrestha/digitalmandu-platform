const { default: axios } = require("axios");
const Order = require("../../../models/orderModel");
const User = require("../../../models/userModel");

exports.initateKhaltiPayment = async (req, res) => {
    const { orderId, amount } = req.body;
    if (!orderId || !amount) {
        return res.status(400).json({ message: "Order id and amount are required." });
    }

    let order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: "Order not found." });
    }
    // allow paisa or rupees — normalize to number
    const amountNum = Number(amount);
    if (Number(order.totalAmount) !== amountNum && Number(order.totalAmount)*100 !== amountNum) {
        return res.status(400).json({ message: "Invalid amount." });
    }

    const khaltiKey = process.env.KHALTI_SECRET_KEY || "370da36237d94394a497c6d83e634229";
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const backendUrl = (process.env.BACKEND_URL || "http://localhost:3000/").replace(/\/$/, "/");
    const data = {
        return_url: `${frontendUrl}/khalti-success`,
        purchase_order_id: String(orderId),
        amount: amountNum < 1000 ? amountNum * 100 : amountNum, // NPR -> paisa if not already
        website_url: backendUrl,
        purchase_order_name: "order_name_" + orderId
    };

    const response = await axios.post("https://dev.khalti.com/api/v2/epayment/initiate/", data, {
        headers: {
            "Authorization": `key ${khaltiKey}`,
            "Content-Type": "application/json"
        }
    });

    console.log("response", response.data);


    //ensuring the order is an object before adding value in pidx
    if (!order.paymentDetails) {
        order.paymentDetails = {};
    }

    order.paymentDetails.pidx = response.data.pidx;
    await order.save();
    // this will redirect to the pyayment page with or merchant accout to accept payment and 
    //filled with all the credentials also giving transactionID too
    // res.redirect(response.data.payment_url);
    res.status(200).json(
        {
            message: "paymeht has been successful",
            paymentUrl: response.data.payment_url
        }
    )


};

// verifying transaction id pids
exports.verifyPidx = async (req, res) => {
    try {
    const pidx = req.body.pidx || req.query.pidx;
    const userId = req.user?.id

    if (!pidx) {
        return res.status(400).json({ message: "Pidx is required." });
    }
    const khaltiKey = process.env.KHALTI_SECRET_KEY || "370da36237d94394a497c6d83e634229";
    const response = await axios.post("https://dev.khalti.com/api/v2/epayment/lookup/", { pidx: pidx }, {
        headers: {
            "Authorization": `key ${khaltiKey}`,
            "Content-Type": "application/json"
        }
    });
    console.log("khalti lookup", response.data)
    if (response.data.status == "Completed") {
        let orders = await Order.find({ "paymentDetails.pidx": pidx })
        if (orders && orders[0]) {
          if (!orders[0].paymentDetails) orders[0].paymentDetails = {};
          orders[0].paymentDetails.method = "khalti"
          orders[0].paymentDetails.status = "paid"
          orders[0].orderStatus = "confirmed"
          await orders[0].save()
        }
        if (userId) {
          let user = await User.findById(userId)
          if (user) { user.cart = []; await user.save(); }
        }
        return res.status(200).json({ message: "payment verified successfully", data: response.data })
    } else {
        return res.status(200).json({ message: "payment pending", data: response.data })
    }
    } catch (e) {
        console.error("verifyPidx error", e.response?.data || e.message);
        return res.status(500).json({ message: "Verification failed", error: e.response?.data || e.message })
    }
}

