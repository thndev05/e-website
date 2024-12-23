const moment = require('moment-timezone');
const Order = require('../models/order.model');

let accessToken = null;
let accessTokenExpiry = null;

module.exports.check = async function () {
    if (module.exports.isWorking === false) {
        return;
    }

    try {
        const username = process.env.BANK_USERNAME;
        const password = process.env.PASSWORD;
        const deviceId = process.env.DEVICE_ID;
        const accountId = process.env.ACCOUNT_ID;

        if (!username || !password || !deviceId || !accountId) {
            console.error("Thiếu tham số bắt buộc để kiểm tra lịch sử giao dịch");
            module.exports.isWorking = false;
            return;
        }

        // if (!accessToken || Date.now() >= accessTokenExpiry) {
        //     console.log('Token hết hạn hoặc chưa có, đang đăng nhập lại...');
        //     const loginResponse = await handleLogin(username, password, deviceId);
        //     accessToken = loginResponse.access_token;
        //     accessTokenExpiry = Date.now() + (loginResponse.expires_in - 10) * 1000;
        // }

        const loginResponse = await handleLogin(username, password, deviceId);
        accessToken = loginResponse.access_token;
        accessTokenExpiry = Date.now() + (loginResponse.expires_in - 10) * 1000;


        const histories = await getHistories(accessToken, accountId, deviceId, username, password);
        // console.log("Lịch sử giao dịch:", histories);

        const orders = await Order.find({status: "pending"});
        for (const order of orders) {
            const transactionID = order.transactionID;
            const totalAmount = order.totalAmount;

            for (const transactionInfo of histories.transactionInfos) {
                if (transactionInfo.description && transactionID && transactionInfo.description.includes(transactionID) && totalAmount === Number(transactionInfo.amount)) {
                    order.status = "confirmed"
                    order.isPaid = true;

                    await order.save();
                    console.log("Confirmed order: " + order._id);
                }
            }
        }

        module.exports.isWorking = true;

    } catch (error) {
        console.error("Lỗi khi kiểm tra lịch sử giao dịch:", error.message);
        console.error(error);
        module.exports.isWorking = false;
    }

    console.log("Status: " + module.exports.isWorking)
}


async function handleLogin(username, password, deviceId) {
    const data = {
        username,
        password,
        deviceId,
        transactionId: "",
    };

    const config = {
        method: 'POST',
        headers: {
            APP_VERSION: "2024.07.12",
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "vi",
            Authorization: "Bearer",
            Connection: "keep-alive",
            "Content-Type": "application/json",
            DEVICE_ID: deviceId,
            DEVICE_NAME: "Chrome",
            Origin: "https://ebank.tpb.vn",
            PLATFORM_NAME: "WEB",
            PLATFORM_VERSION: "127",
            Referer: "https://ebank.tpb.vn/retail/vX/",
            SOURCE_APP: "HYDRO",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
            "sec-ch-ua":
                '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetch('https://ebank.tpb.vn/gateway/api/auth/login/v3', config);
        if (!response.ok) {
            throw new Error(`Login failed with status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}


async function getHistories(token, accountId, deviceId, username, password) {
    const days = process.env.DAYS || 30;

    const fromDate = moment()
        .tz('Asia/Ho_Chi_Minh')
        .subtract(days, 'days')
        .format('YYYYMMDD');
    const toDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDD');

    const data = {
        pageNumber: 1,
        pageSize: 400,
        accountNo: accountId,
        currency: "VND",
        maxAcentrysrno: "",
        fromDate: fromDate,
        toDate: toDate,
        keyword: "",
    };

    const config = {
        method: 'POST',
        headers: {
            APP_VERSION: "2024.07.12",
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "vi,en-US;q=0.9,en;q=0.8",
            Authorization: `Bearer ${token}`,
            Connection: "keep-alive",
            "Content-Type": "application/json",
            DEVICE_ID: deviceId,
            DEVICE_NAME: "Chrome",
            Origin: "https://ebank.tpb.vn",
            PLATFORM_NAME: "WEB",
            PLATFORM_VERSION: "127",
            SOURCE_APP: "HYDRO",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
            "sec-ch-ua":
                '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetch("https://ebank.tpb.vn/gateway/api/smart-search-presentation-service/v2/account-transactions/find", config);
        if (!response.ok) {
            throw new Error(`Failed to fetch histories, status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (error.message.includes('401')) {
            console.log("Mã thông báo đã hết hạn, đang đăng nhập lại...");
            try {
                const loginResponse = await handleLogin(username, password, deviceId);
                const newToken = loginResponse.access_token;
                return await getHistories(newToken, accountId, deviceId, username, password);
            } catch (loginError) {
                console.error("Đăng nhập lại không thành công:", loginError.message);
                throw loginError;
            }
        } else {
            throw error;
        }
    }
}