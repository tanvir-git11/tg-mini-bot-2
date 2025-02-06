const MIN_WITHDRAW_POINTS = 20;
const ADMIN_USER_ID = 5919121831;
const BOT_TOKEN = "7486908395:AAE394yKNBNxemB3JpnIScly2VE8jsdTVYs";
let watchedAdsCount = localStorage.getItem("watchedAdsCount")
  ? parseInt(localStorage.getItem("watchedAdsCount"))
  : 0;
let earnedPoints = localStorage.getItem("earnedPoints")
  ? parseFloat(localStorage.getItem("earnedPoints"))
  : 0.0;
let progressResetTimeout;

// Display user data on page load
document.getElementById("watched-ads").textContent = watchedAdsCount;
document.getElementById("earned-points").textContent = earnedPoints.toFixed(2);
updateProgressCircle();

function watchAd() {
  if (typeof show_8887062 === "function") {
    show_8887062().then(() => {
      watchedAdsCount++;
      earnedPoints += 0.01;
      document.getElementById("watched-ads").textContent = watchedAdsCount;
      document.getElementById("earned-points").textContent =
        earnedPoints.toFixed(2);
      localStorage.setItem("watchedAdsCount", watchedAdsCount);
      localStorage.setItem("earnedPoints", earnedPoints.toFixed(2));
      updateProgressCircle();
    });
  }
}

function updateProgressCircle() {
  const percentage = Math.min((watchedAdsCount / 20) * 100, 100);
  const progressText = document.getElementById("ads-progress");
  const progressCircle = document.querySelector(".progress-circle");
  const progressMessage = document.getElementById("progress-message");

  progressText.textContent = `${percentage}%`;
  let color = `hsl(${120 - percentage * 1.2}, 100%, 50%)`;
  progressCircle.style.background = `conic-gradient(${color} ${percentage}%, #333 ${percentage}% 100%)`;
  progressCircle.style.boxShadow = `0 0 15px ${color}`;

  if (percentage >= 100) {
    disableAdsForTwentyMinutes();
  } else {
    progressMessage.textContent = "";
  }
}

function disableAdsForTwentyMinutes() {
  document.getElementById("watch-ad-btn").disabled = true;
  const messageElement = document.getElementById("progress-message");
  let endTime = Date.now() +  30 * 1000; // ২০ মিনিটের টাইমার (পরীক্ষার জন্য ৩০ সেক করতে পারো)
  localStorage.setItem("adsDisabledUntil", endTime);

  function updateCountdown() {
    let remainingTime = endTime - Date.now();
    if (remainingTime > 0) {
      let minutes = Math.floor(remainingTime / (1000 * 60));
      let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      messageElement.textContent = `⏳ ${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds} পর আবার কাজ করতে পারবেন`;
      messageElement.style.textAlign = "center";
      setTimeout(updateCountdown, 1000);
    } else {
      messageElement.textContent = "✅ আপনি এখন আবার কাজ করতে পারবেন!";
      watchedAdsCount = 0;
      localStorage.setItem("watchedAdsCount", watchedAdsCount);
      updateProgressCircle();
      document.getElementById("watch-ad-btn").disabled = false;
      localStorage.removeItem("adsDisabledUntil");
    }
  }

  messageElement.textContent = "২০ মিনিট পর আবার কাজ করতে পারবেন ⏳";
  updateCountdown();
}

function withdrawPoints() {
  const amount = parseFloat(document.getElementById("withdraw-amount").value);
  const paymentMethod = document.getElementById("payment-method").value;
  const phoneNumber = document.getElementById("withdraw-phone").value;
  const name = document.getElementById("your-name").value;

  if (amount < MIN_WITHDRAW_POINTS) {
    alert(`তোমার ব্যালেন্সে সর্বনিম্ন ${MIN_WITHDRAW_POINTS} টাকা থাকা লাগবে`);
    return;
  }
  if (amount > earnedPoints) {
    alert(
      `আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই। You have ${earnedPoints.toFixed(
        2
      )} Taka.`
    );
    return;
  }

  earnedPoints -= amount;
  document.getElementById("earned-points").textContent =
    earnedPoints.toFixed(2);
  localStorage.setItem("earnedPoints", earnedPoints.toFixed(2));

  const message = `New Withdrawal Request from @${name}\n\nAmount: ${amount} points\nPayment Method: ${paymentMethod}\nPhone Number: ${phoneNumber}`;
  sendWithdrawRequestToAdmin(message);

  document.getElementById("withdraw-status").textContent =
    "Withdrawal request sent successfully!";
}

function sendWithdrawRequestToAdmin(message) {
  fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${ADMIN_USER_ID}&text=${encodeURIComponent(
      message
    )}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.ok) {
        console.log("Message sent to admin");
      }
    })
    .catch((error) => console.error("Error sending message:", error));
}

window.onload = function () {
  let savedEndTime = localStorage.getItem("adsDisabledUntil");
  if (savedEndTime && Date.now() < savedEndTime) {
    disableAdsForTwentyMinutes();
  }
  updateProgressCircle();
};

const { Telegraf } = require("telegraf");

const bot = new Telegraf(BOT_TOKEN);

bot.command("reset", (ctx) => {
  ctx.reply("আপনার প্রগ্রেস রিসেট হচ্ছে... ✅");
  ctx.reply("আপনি আবার নতুন করে অ্যাড দেখতে পারবেন!");

  watchedAdsCount = 0;
  earnedPoints = 0;
  localStorage.setItem("watchedAdsCount", watchedAdsCount);
  localStorage.setItem("earnedPoints", earnedPoints.toFixed(2));
  localStorage.removeItem("adsDisabledUntil");

  updateProgressCircle();

  ctx.telegram.sendMessage(ctx.chat.id, "🚀 রিসেট সফলভাবে সম্পন্ন হয়েছে!", {
    reply_markup: {
      inline_keyboard: [[{ text: "🔄 Reset Again", callback_data: "reset" }]],
    },
  });
});

bot.launch();
