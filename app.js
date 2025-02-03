const MIN_WITHDRAW_POINTS = 20;
        const ADMIN_USER_ID = 5919121831;
        const BOT_TOKEN = "7486908395:AAE394yKNBNxemB3JpnIScly2VE8jsdTVYs";
        let watchedAdsCount = 0;
        let earnedPoints = 0.00;
        let autoAdInterval;
 
        // Simulate user name from Telegram User ID (replace with actual logic to get user info)
        const telegramUserName = "@exampleUser"; // Replace this line with the actual logic to fetch username
        document.getElementById("user-name").textContent = telegramUserName;
 
        // Check if user data is saved in localStorage
        if (localStorage.getItem('watchedAdsCount')) {
            watchedAdsCount = parseInt(localStorage.getItem('watchedAdsCount'));
            earnedPoints = parseFloat(localStorage.getItem('earnedPoints'));
            document.getElementById('watched-ads').textContent = watchedAdsCount;
            document.getElementById('earned-points').textContent = earnedPoints.toFixed(2);
        }
 
        // Function to watch an ad and update stats
        function watchAd() {
            if (typeof show_8887062 === 'function') {
                show_8887062().then(() => {
                    // When the ad is shown, we add points
                    watchedAdsCount++;
                    document.getElementById('watched-ads').textContent = watchedAdsCount;
                    earnedPoints += 0.1; // Add 0.50 points per ad watched
                    document.getElementById('earned-points').textContent = earnedPoints.toFixed(2);
                    localStorage.setItem('watchedAdsCount', watchedAdsCount);
                    localStorage.setItem('earnedPoints', earnedPoints.toFixed(2));
 
                    // Update progress circle
                    updateProgressCircle();
                });
            }
        }
 
        function updateProgressCircle() {
            const percentage = Math.min((watchedAdsCount / 20) * 100, 100);
            const progressText = document.getElementById('ads-progress');
            const progressCircle = document.querySelector(".progress-circle");
            const welcomeMessage = document.getElementById("welcome-msg");
        
            let start = parseFloat(progressText.textContent) || 0;
        
            let animation = setInterval(() => {
                if (start >= percentage) {
                    clearInterval(animation);
                    if (percentage >= 100) {
                        welcomeMessage.style.opacity = "1"; // ফুলকির ইফেক্ট দেখাবে
                    }
                } else {
                    start += 1;
                    progressText.textContent = `${start}%`;
        
                    // কালার গ্রেডিয়েন্ট চেঞ্জ করবে
                    let color = `hsl(${120 - (start * 1.2)}, 100%, 50%)`; // গ্রিন থেকে রেড শেড
                    progressCircle.style.background = `conic-gradient(${color} ${start}%, #333 ${start}% 100%)`;
                    progressCircle.style.boxShadow = `0 0 15px ${color}`;
                }
            }, 20);
        }
        

 
        // Function to start auto showing ads
        function startAutoAds() {
            autoAdInterval = setInterval(watchAd, 5000); // Auto show ad every 5 seconds
            document.getElementById('auto-ad-btn').disabled = true;
            document.getElementById('stop-auto-btn').disabled = false;
        }
 
        // Function to stop auto ads
        function stopAutoAds() {
            clearInterval(autoAdInterval);
            document.getElementById('auto-ad-btn').disabled = false;
            document.getElementById('stop-auto-btn').disabled = true;
        }
 
        // Function to show withdraw form
        function showWithdrawForm() {
            document.getElementById('withdraw-section').style.display = 'block';
        }
 
        // Function to handle withdrawal
        function withdrawPoints() {
            const amount = document.getElementById('withdraw-amount').value;
            const paymentMethod = document.getElementById('payment-method').value;
            const phoneNumber = document.getElementById('withdraw-phone').value;
            const name = document.getElementById('your-name').value;
 
            if (amount < MIN_WITHDRAW_POINTS) {
                document.getElementById('withdraw-status').textContent = `Minimum withdrawal amount is ${MIN_WITHDRgzAW_POINTS} points.`;
                return;
            }
 
            if (amount > earnedPoints) {
                document.getElementById('withdraw-status').textContent = `Insufficient balance. You have ${earnedPoints.toFixed(2)} points.`;
                return;
            }
 
            // Subtract points from earnedPoints after successful withdrawal
            earnedPoints -= parseFloat(amount);
            document.getElementById('earned-points').textContent = earnedPoints.toFixed(2);
 
            // Save the updated balance in localStorage
            localStorage.setItem('earnedPoints', earnedPoints.toFixed(2));
 
            // Send withdrawal request to admin via Telegram
            const message = `New Withdrawal Request from @${name} \n\nAmount: ${amount} points\nPayment Method: ${paymentMethod}\nPhone Number: ${phoneNumber}`;
            sendWithdrawRequestToAdmin(message);
 
            // Show success message
            document.getElementById('withdraw-status').textContent = 'Withdrawal request sent successfully!';
 
            // Clear form
            document.getElementById('withdraw-amount').value = '';
            document.getElementById('withdraw-phone').value = '';
        }
 
        // Function to send withdrawal request to admin
        function sendWithdrawRequestToAdmin(message) {
            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${ADMIN_USER_ID}&text=${encodeURIComponent(message)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        console.log('Message sent to admin');
                    }
                })
                .catch(error => console.error('Error sending message:', error));
        }