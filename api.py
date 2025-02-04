from flask import Flask, jsonify
import json

app = Flask(__name__)

LINK_FILE = "links.json"

@app.route("/getlinks")
def get_links():
    try:
        with open(LINK_FILE, "r") as file:
            data = json.load(file)
            return jsonify(data)
    except:
        return jsonify({"link1": "https://default1.com", "link2": "https://default2.com", "link3": "https://default3.com"})

if __name__ == "__main__":
    app.run(port=5000)
