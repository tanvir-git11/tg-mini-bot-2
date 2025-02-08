const MIN_WITHDRAW_POINTS = 20;
const ADMIN_USER_ID = 5919121831;
const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";

let watchedAdsCount = parseInt(localStorage.getItem("watchedAdsCount")) || 0;
let earnedPoints = parseFloat(localStorage.getItem("earnedPoints")) || 0.0;
let pendingReferralBonus = parseFloat(localStorage.getItem("pendingBonus")) || 0.0;

if (isNaN(earnedPoints)) {
  earnedPoints = 0.0;
  localStorage.setItem("earnedPoints", earnedPoints.toFixed(2));
}
if (isNaN(watchedAdsCount)) {
  watchedAdsCount = 0;
  localStorage.setItem("watchedAdsCount", watchedAdsCount);
}


document.getElementById("watched-ads").textContent = watchedAdsCount;
document.getElementById("earned-points").textContent = earnedPoints.toFixed(2);

// রেফারেল লিংক তৈরি করা
function generateReferralLink(userId) {
  const botUsername = "your_bot_username";
  return `https://t.me/${botUsername}?start=${userId}`;
}

document.getElementById("referral-btn").addEventListener("click", function() {
  const userId = localStorage.getItem("telegramUserId");
  if (userId) {
    const referralLink = generateReferralLink(userId);
    document.getElementById("referral-link").textContent = referralLink;
  } else {
    alert("User ID not found!");
  }
});

// রেফারেল থেকে জয়েন করলে রেফারারের তথ্য সংরক্ষণ
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
    alert(`👥 আপনার রেফার করা ইউজারদের তালিকা:\n\n${referrals.join("\n")}`);
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
