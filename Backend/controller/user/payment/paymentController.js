const { default: axios } = require("axios");
const Order = require("../../../models/orderModel");

exports.initateKhaltiPayment = async (req, res) => {
    const { orderId, amount } = req.body;
    if (!orderId || !amount) {
        return res.status(400).json({ message: "Order id and amount are required." });
    }

    let order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: "Order not found." });
    }
    //check whether coming order is total amount of order
    if (order.totalAmount !== amount) {
        return res.status(400).json({ message: "Invalid amount." });
    }

    const data = {
        return_url: "http://localhost:5173/success",
        purchase_order_id: orderId,
        amount: amount, // Convert NPR to paisa
        website_url: "http://localhost:3000/",
        purchase_order_name: "order_name_" + orderId
    };

    const response = await axios.post("https://dev.khalti.com/api/v2/epayment/initiate/", data, {
        headers: {
            "Authorization": "key 370da36237d94394a497c6d83e634229",
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
//verifying payment is done or not 
exports.verifyPidx = async (req, res) => {
    const app = require("../../../app")
    const io = app.getSocketIo;
    //pidx comes from qyery not params as it is followed as ?pidx=xxx
    // const pidx = req.query.pidx;
    const pidx = req.body.pidx;
    const userId = req.user.id

    if (!pidx) {
        return res.status(400).json({ message: "Pidx is required." });
    }
    //using axios request to lookup at the payment status that will show 
    //trabsatction id payment amount and status of payment
    const response = await axios.post("https://dev.khalti.com/api/v2/epayment/lookup/", { pidx: pidx }, {
        //headers should be also given to authorize the token if we are initializing the right request or not 
        //otherwise we will be unauthorixed
        headers: {
            "Authorization": "key 370da36237d94394a497c6d83e634229",
            "Content-Type": "application/json"
        }
    }
    );
    console.log(response.data.pidx)
    res.send(response.data)
    if (response.data.status == "Completed") {
        //modify database   
        let order = await Order.find({ "paymentDetails.pidx": pidx })
        console.log(order)
        order[0].paymentDetails.metnod = "khalti"
        order[0].paymentDetails.status = "paid"
        await order[0].save()
        //emptying user cart
        let user = User.findById(userId)
        //if user is not present then throw err
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        user.cart = []
        await user.save()
        res.status(200).json({
            message: "payment verified successfully "
        })
        //non socket approach





        //notify the user that payment is done
        // res.redirect("http://localhost:3000")

        //get socket id of requesting usere
        // io.on("connection", () => {
        //     io.to(socket.id).emit("payment", { message: "payment successful", order })
        // })


        //using socket for notifying 
        // io.emit("payment", { message: "payment successful", order })
    } else {
        //notify the user that payment is not done
        // io.on("connection", () => {
        io.to(socket.id).emit("payment", { message: "payment failure", order })
        // })
        //using socket for notifying



        //using socket for notifying 
        // io.emit("payment", { message: "payment failure", order })
        // io.emit("payment_failure", { message: "payment failure" })
        // res.redirect("http://localhost:3000/failurePage")
    }
}

