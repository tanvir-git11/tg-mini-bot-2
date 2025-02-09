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
    disableAdsForThirtyMinutes();
  } else {
    progressMessage.textContent = "";
  }
}
function disableAdsForThirtyMinutes() {
  document.getElementById("watch-ad-btn").disabled = true;
  const messageElement = document.getElementById("progress-message");
  let endTime = Date.now() + 15* 1000; // ৩০ মিনিটের টাইমার
  localStorage.setItem("adsDisabledUntil", endTime);
  updateCountdown();
}


function updateCountdown() {
  const messageElement = document.getElementById("progress-message");
  let endTime = parseInt(localStorage.getItem("adsDisabledUntil"));

  function countdown() {
    let remainingTime = endTime - Date.now();
    if (remainingTime > 0) {
      let minutes = Math.floor(remainingTime / (1000 * 60));
      let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      messageElement.textContent = `⏳ ${minutes}:${seconds < 10 ? "0" : ""}${seconds} পর আবার কাজ করতে পারবেন`;
      setTimeout(countdown, 1000);
    } else {
      messageElement.textContent = "✅ আপনি এখন আবার কাজ করতে পারবেন!";
      document.getElementById("watch-ad-btn").disabled = false;
      localStorage.removeItem("adsDisabledUntil");
    }
  }
  countdown();
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
  localStorage.setItem("earnedPoints", earnedPoints.toFixed(2));

  let pendingWithdrawals = JSON.parse(localStorage.getItem("pendingWithdrawals")) || [];
  let requestId = Date.now(); // প্রত্যেক রিকোয়েস্টের জন্য ইউনিক আইডি
  
  pendingWithdrawals.push({ id: requestId, name, amount, paymentMethod, phoneNumber, status: "pending" });
  localStorage.setItem("pendingWithdrawals", JSON.stringify(pendingWithdrawals));

  // ✅ এডমিনকে টেলিগ্রামে রিকোয়েস্ট পাঠানো হবে
  const message = `📢 নতুন উইথড্রাল রিকোয়েস্ট!

👤 ইউজার: ${name}
💰 পরিমাণ: ${amount} Taka
📞 ফোন: ${phoneNumber}
🏦 পেমেন্ট মেথড: ${paymentMethod}
🆔 রিকোয়েস্ট আইডি: ${requestId}

✅ কমপ্লিট করতে নিচের কমান্ডটি ব্যবহার করুন:
/complete_${requestId}
`;

  sendWithdrawRequestToAdmin(message);
  alert("✅ উইথড্রাল রিকোয়েস্ট পাঠানো হয়েছে!");

}

function refundPendingWithdrawals() {
  let pendingWithdrawals = JSON.parse(localStorage.getItem("pendingWithdrawals")) || [];
  let newWithdrawals = [];

  pendingWithdrawals.forEach(withdrawal => {
    if (withdrawal.status === "pending") {
      earnedPoints += withdrawal.amount; // ব্যালেন্স ফেরত দেওয়া
      localStorage.setItem("earnedPoints", earnedPoints.toFixed(2));
    } else {
      newWithdrawals.push(withdrawal);
    }
  });

  localStorage.setItem("pendingWithdrawals", JSON.stringify(newWithdrawals));
  alert("✅ যাদের পেমেন্ট করা হয়নি, তাদের ব্যালেন্স ফেরত দেওয়া হয়েছে!");
}




function sendWithdrawRequestToAdmin(message) {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${ADMIN_USER_ID}&text=${encodeURIComponent(message)}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Admin Response:", data); // ✅ লগ চেক করতে পারবে
      if (data.ok) {
        console.log("Message sent to admin");
      } else {
        alert("❌ অ্যাডমিনের কাছে মেসেজ পাঠানো যায়নি!");
      }
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      alert("❌ কিছু সমস্যা হয়েছে, পরে চেষ্টা করুন!");
    });
}

window.onload = function () {
  let savedEndTime = localStorage.getItem("adsDisabledUntil");
  if (savedEndTime && Date.now() < savedEndTime) {
    disableAdsForThirtyMinutes();
  }
  updateProgressCircle();
  setTimeout(() => {
    if (typeof show_8887062 !== "function") {
      alert("🚫 দয়া করে AdBlock বন্ধ করুন, নাহলে এড দেখা যাবে না!");
    }
  }, 3000);
};




// রেফারেল লিংক তৈরি করা
function generateReferralLink(userId) {
  const botUsername = "free_income_botbot";
  return `https://t.me/${botUsername}?start=${userId}`;
}

document.getElementById("referral-btn").addEventListener("click", function() {
  let userId = localStorage.getItem("telegramUserId");

  if (!userId) {
    userId = prompt("আপনার Telegram User ID দিন:");
    if (userId) {
      localStorage.setItem("telegramUserId", userId);
    } else {
      alert("User ID not found! Please restart the bot.");
      return;
    }
  }

  const referralLink = generateReferralLink(userId);
  const referralText = document.getElementById("referral-link");

  referralText.textContent = referralLink;
  referralText.style.display = "block"; // লিংক দেখাবে

  // ক্লিক করলে লিংক কপি হবে
  referralText.addEventListener("click", function() {
    navigator.clipboard.writeText(referralLink).then(() => {
      referralText.classList.add("copied"); // কপি অ্যানিমেশন দেখাবে
      referralText.textContent = "✅ কপি করা হয়েছে!";
      setTimeout(() => {
        referralText.textContent = referralLink; // ২ সেকেন্ড পর লিংক দেখাবে
        referralText.classList.remove("copied");
      }, 2000);
    });
  });
});



window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get("start");

  if (referrerId) {
    localStorage.setItem("referrerId", referrerId);
    alert("✅ আপনি একটি রেফারেল লিংক থেকে জয়েন করেছেন!");

    saveReferralData(referrerId);
    notifyReferrer(referrerId);
  }
};

function saveReferralData(referrerId) {
  let referrals = JSON.parse(localStorage.getItem(`referrals_${referrerId}`)) || [];
  let username = prompt("আপনার Telegram Username দিন:");
  
  if (!username) {
    username = "Unknown_User";
  }

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

function showWithdrawHistory() {
  let pendingWithdrawals = JSON.parse(localStorage.getItem("pendingWithdrawals")) || [];
  if (pendingWithdrawals.length === 0) {
    alert("🔍 কোনো পেন্ডিং উইথড্রাল রিকোয়েস্ট নেই!");
    return;
  }

  let historyText = "📜 উইথড্রাল হিস্টোরি:\n";
  pendingWithdrawals.forEach((w, index) => {
    historyText += `${index + 1}. ${w.name} - ${w.amount} Taka - ${w.paymentMethod} - ${w.phoneNumber} - ${w.status === "pending" ? "⏳ Pending" : "✅ Completed"}\n`;
  });

  alert(historyText);
}

document.getElementById("show-history-btn").addEventListener("click", showWithdrawHistory);



function completeWithdrawal(requestId) {
  let pendingWithdrawals = JSON.parse(localStorage.getItem("pendingWithdrawals")) || [];

  let withdrawal = pendingWithdrawals.find(w => w.id == requestId);
  if (!withdrawal) {
    alert("❌ রিকোয়েস্ট পাওয়া যায়নি!");
    return;
  }

  withdrawal.status = "completed";
  localStorage.setItem("pendingWithdrawals", JSON.stringify(pendingWithdrawals));

  // ✅ ইউজারকে জানানো হবে
  const message = `🎉 আপনার উইথড্রাল সফল হয়েছে!
  
💰 পরিমাণ: ${withdrawal.amount} Taka
📞 ফোন: ${withdrawal.phoneNumber}
🏦 পেমেন্ট মেথড: ${withdrawal.paymentMethod}
✅ স্ট্যাটাস: Completed`;

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${withdrawal.phoneNumber}&text=${encodeURIComponent(message)}`)
    .then(response => response.json())
    .then(data => console.log("Withdrawal completed message sent:", data))
    .catch(error => console.error("Error sending completion message:", error));

  alert("✅ পেমেন্ট কমপ্লিট করা হয়েছে!");
}


function checkAdsCooldown() {
  let savedEndTime = localStorage.getItem("adsDisabledUntil");
  if (savedEndTime) {
    savedEndTime = parseInt(savedEndTime);
    if (Date.now() < savedEndTime) {
      document.getElementById("watch-ad-btn").disabled = true;
      updateCountdown();
    } else {
      localStorage.removeItem("adsDisabledUntil");
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("watched-ads").textContent = watchedAdsCount;
  document.getElementById("earned-points").textContent = earnedPoints.toFixed(2);
  updateProgressCircle();
  checkAdsCooldown();  // ✅ নতুন ফাংশন কল করা
});

document.getElementById("refund-btn").addEventListener("click", refundPendingWithdrawals);
