const MIN_WITHDRAW_POINTS = 20;
const ADMIN_USER_ID = 5919121831;
const BOT_TOKEN = "7486908395:AAE394yKNBNxemB3JpnIScly2VE8jsdTVYs";

// লোকাল স্টোরেজ থেকে সঠিক সংখ্যা রিসেট করা
let watchedAdsCount = parseInt(localStorage.getItem("watchedAdsCount")) || 0;
let earnedPoints = parseFloat(localStorage.getItem("earnedPoints")) || 0.0;
let pendingReferralBonus = parseFloat(localStorage.getItem("pendingBonus")) || 0.0;

// NaN হলে ব্যাকআপ ভ্যালু সেট করা
if (isNaN(earnedPoints)) {
  earnedPoints = 0.0;
  localStorage.setItem("earnedPoints", earnedPoints.toFixed(2));
}
if (isNaN(watchedAdsCount)) {
  watchedAdsCount = 0;
  localStorage.setItem("watchedAdsCount", watchedAdsCount);
}

let progressResetTimeout;

// পেজ লোড হলে ব্যালেন্স আপডেট করা
document.getElementById("watched-ads").textContent = watchedAdsCount;
document.getElementById("earned-points").textContent = earnedPoints.toFixed(2);
updateProgressCircle();


function watchAd() {
  if (typeof show_8887062 === "function") {
    show_8887062().then(() => {
      watchedAdsCount++;
      earnedPoints += 0.05;
      updateUserData();
    }).catch(err => {
      console.error("Ad loading failed:", err);
      alert("Ad loading failed. Please try again.");
    });
  } else {
    alert("Ad script not loaded. Try reloading the page.");
  }
}

function updateUserData() {
  document.getElementById("watched-ads").textContent = watchedAdsCount;
  document.getElementById("earned-points").textContent = earnedPoints.toFixed(2);
  localStorage.setItem("watchedAdsCount", watchedAdsCount);
  localStorage.setItem("earnedPoints", earnedPoints.toFixed(2));
  updateProgressCircle();
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
  let endTime = Date.now() + 30 * 1000; // ২০ মিনিটের টাইমার (পরীক্ষার জন্য ৩০ সেক)
  localStorage.setItem("adsDisabledUntil", endTime);

  function updateCountdown() {
    let remainingTime = endTime - Date.now();
    if (remainingTime > 0) {
      let minutes = Math.floor(remainingTime / (1000 * 60));
      let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      messageElement.textContent = `⏳ ${minutes}:${seconds < 10 ? "0" : ""}${seconds} পর আবার কাজ করতে পারবেন`;
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
    alert(`আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই। You have ${earnedPoints.toFixed(2)} Taka.`);
    return;
  }

  earnedPoints -= amount;
  updateUserData();

  const message = `New Withdrawal Request from @${name}

Amount: ${amount} points
Payment Method: ${paymentMethod}
Phone Number: ${phoneNumber}`;
  sendWithdrawRequestToAdmin(message);

  document.getElementById("withdraw-status").textContent = "Withdrawal request sent successfully!";
}

function sendWithdrawRequestToAdmin(message) {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${ADMIN_USER_ID}&text=${encodeURIComponent(message)}`)
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

  // AdBlock Checker
  setTimeout(() => {
    if (typeof show_8887062 !== "function") {
      alert("Please disable AdBlock to watch ads and earn points.");
    }
  }, 3000);
};



// রেফারেল লিংক তৈরি করা
function generateReferralLink(userId) {
  const botUsername = "@free_income_botbot";
  return `https://t.me/${botUsername}?start=${userId}`;
}

document.getElementById("referral-btn").addEventListener("click", function() {
  let userId = localStorage.getItem("telegramUserId");

  if (!userId) {
    alert("User ID not found! Please restart the bot."); // ✅ এখন সতর্কবার্তা দেখাবে
    return;
  }

  const referralLink = generateReferralLink(userId);
  document.getElementById("referral-link").textContent = referralLink;
});


// রেফারেল থেকে জয়েন করলে রেফারারের তথ্য সংরক্ষণ
window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get("start");
  
  if (referrerId) {
    localStorage.setItem("referrerId", referrerId);
    localStorage.setItem("telegramUserId", referrerId); // ✅ ইউজার আইডি সেট করা হলো
    alert("✅ আপনি একটি রেফারেল লিংক থেকে জয়েন করেছেন!");
    saveReferralData(referrerId);
    notifyReferrer(referrerId);
  }
  
};

// রেফার করা ইউজার সংরক্ষণ করা
function saveReferralData(referrerId) {
  let referrals = JSON.parse(localStorage.getItem(`referrals_${referrerId}`)) || [];
  let username = "User_" + Math.floor(Math.random() * 10000);
  referrals.push(username);
  localStorage.setItem(`referrals_${referrerId}`, JSON.stringify(referrals));
}

// রেফারারকে নোটিফাই করা
function notifyReferrer(referrerId) {
  const message = `🎉 একজন নতুন ইউজার আপনার রেফারেল লিংক ব্যবহার করে জয়েন করেছে!`;
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${referrerId}&text=${encodeURIComponent(message)}`);
}

// রেফার করা ইউজারদের তালিকা দেখানো
function showReferralList() {
  let userId = localStorage.getItem("telegramUserId");
  let referrals = JSON.parse(localStorage.getItem(`referrals_${userId}`)) || [];
  if (referrals.length > 0) {
    alert(`👥 আপনার রেফার করা ইউজারদের তালিকা:\n\n${referrals.join("\\n")}`);

  } else {
    alert("😢 আপনার রেফারেল লিংক থেকে এখনো কেউ জয়েন করেনি!");
  }
}

document.getElementById("show-referrals-btn").addEventListener("click", showReferralList);

// উইথড্র করার সময় রেফারারকে টাকা যোগ করা
function withdrawPoints() {
  let amount = parseFloat(document.getElementById("withdraw-amount").value);
  if (amount < MIN_WITHDRAW_POINTS) {
    alert(`তোমার ব্যালেন্সে সর্বনিম্ন ${MIN_WITHDRAW_POINTS} টাকা থাকা লাগবে`);
    return;
  }
  if (amount > earnedPoints) {
    alert(`আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই। You have ${earnedPoints.toFixed(2)} Taka.`);
    return;
  }

  let referrerId = localStorage.getItem("referrerId");
  if (referrerId) {
    sendReferralBonus(referrerId);
    localStorage.removeItem("referrerId");
  }

  earnedPoints -= amount;
  localStorage.setItem("earnedPoints", earnedPoints.toFixed(2));
  alert("✅ উইথড্রাল রিকোয়েস্ট পাঠানো হয়েছে!");
}

function sendReferralBonus(referrerId) {
  const message = `🎉 আপনার রেফার করা একজন ইউজার উইথড্র দিয়েছে! আপনার ব্যালেন্সে ৳2 যোগ হয়েছে।`;
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${referrerId}&text=${encodeURIComponent(message)}`);
}
