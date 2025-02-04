import telebot
import json

TOKEN = "7486908395:AAE394yKNBNxemB3JpnIScly2VE8jsdTVYs"
bot = telebot.TeleBot(TOKEN)

LINK_FILE = "links.json"
ADMIN_ID = 5919121831  # তোমার Telegram User ID বসাও (admin only)

# 🔹 লিংক লোড ও সংরক্ষণ করা
def load_links():
    try:
        with open(LINK_FILE, "r") as file:
            return json.load(file)
    except:
        return {"link1": "https://default1.com", "link2": "https://default2.com", "link3": "https://default3.com"}

def save_links(links):
    with open(LINK_FILE, "w") as file:
        json.dump(links, file, indent=4)

# 🔹 লিংক পরিবর্তন ফাংশন
def update_link(message, link_key):
    if message.from_user.id != ADMIN_ID:
        bot.send_message(message.chat.id, "❌ এই কমান্ড শুধু অ্যাডমিন ব্যবহার করতে পারবে!")
        return

    parts = message.text.split(" ", 1)
    if len(parts) < 2:
        bot.send_message(message.chat.id, f"⚠️ ব্যবহার: `/{link_key} <new_link>`", parse_mode="Markdown")
        return

    links = load_links()
    links[link_key] = parts[1]
    save_links(links)
    bot.send_message(message.chat.id, f"✅ **{link_key}** লিংক আপডেট হয়েছে: {parts[1]}")

# 🔹 তিনটা আলাদা কমান্ড হ্যান্ডলার
@bot.message_handler(commands=['setlink1'])
def set_link1(message): update_link(message, "link1")

@bot.message_handler(commands=['setlink2'])
def set_link2(message): update_link(message, "link2")

@bot.message_handler(commands=['setlink3'])
def set_link3(message): update_link(message, "link3")

# 🔹 বট চালু করা
bot.polling()
