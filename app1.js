const MIN_WITHDRAW_POINTS = 2;
const ADMIN_USER_ID = 5919121831;
const BOT_TOKEN = "7486908395:AAE394yKNBNxemB3JpnIScly2VE8jsdTVYs";
let watchedAdsCount = localStorage.getItem('watchedAdsCount') ? parseInt(localStorage.getItem('watchedAdsCount')) : 0;
let earnedPoints = localStorage.getItem('earnedPoints') ? parseFloat(localStorage.getItem('earnedPoints')) : 0.00;

// Display user data on page load
document.getElementById('watched-ads').textContent = watchedAdsCount;
document.getElementById('earned-points').textContent = earnedPoints.toFixed(2);
updateProgressCircle();

function watchAd() {
    if (typeof show_8887062 === 'function') {
        show_8887062().then(() => {
            watchedAdsCount++;
            earnedPoints += 0.1;
            document.getElementById('watched-ads').textContent = watchedAdsCount;
            document.getElementById('earned-points').textContent = earnedPoints.toFixed(2);
            localStorage.setItem('watchedAdsCount', watchedAdsCount);
            localStorage.setItem('earnedPoints', earnedPoints.toFixed(2));
            updateProgressCircle();
        });
    }
}

function updateProgressCircle() {
    const percentage = Math.min((watchedAdsCount / 1) * 100, 100);
    const progressText = document.getElementById('ads-progress');
    const progressCircle = document.querySelector(".progress-circle");
    const progressMessage = document.getElementById("progress-message");

    progressText.textContent = `${percentage}%`;
    let color = `hsl(${120 - (percentage * 1.2)}, 100%, 50%)`;
    progressCircle.style.background = `conic-gradient(${color} ${percentage}%, #333 ${percentage}% 100%)`;
    progressCircle.style.boxShadow = `0 0 15px ${color}`;

    if (percentage >= 100) {
        disableAdsForTwentyMinutes();
    } else {
        progressMessage.textContent = "";
    }
}

function disableAdsForTwentyMinutes() {
    document.getElementById('watch-ad-btn').disabled = true;

    const messageElement = document.getElementById('progress-message');
    let endTime = localStorage.getItem('adsDisabledUntil') ? parseInt(localStorage.getItem('adsDisabledUntil')) : Date.now() + (1 * 60 * 1000);
    localStorage.setItem('adsDisabledUntil', endTime);

    function updateCountdown() {
        let remainingTime = endTime - Date.now();
        if (remainingTime > 0) {
            let minutes = Math.floor(remainingTime / (1000 * 60));
            let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            messageElement.textContent = `⏳ ${minutes}:${seconds < 10 ? '0' : ''}${seconds} পর আবার কাজ করতে পারবেন`;
            messageElement.style.textAlign = "center";
            setTimeout(updateCountdown, 1000);
        } else {
            messageElement.textContent = "✅ আপনি এখন আবার কাজ করতে পারবেন!";
            watchedAdsCount = 0;
            localStorage.setItem('watchedAdsCount', watchedAdsCount);
            updateProgressCircle();
            document.getElementById('watch-ad-btn').disabled = false;
            localStorage.removeItem('adsDisabledUntil');
        }
    }
    updateCountdown();
}

window.onload = function () {
    let savedEndTime = localStorage.getItem('adsDisabledUntil');
    if (savedEndTime && Date.now() < savedEndTime) {
        disableAdsForTwentyMinutes();
    }
    updateProgressCircle();
};
