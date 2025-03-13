from flask import Flask, jsonify
from flask_cors import CORS
import json
import random

states = ["red", "green", "yellow"]
times = [random.randint(20, 60), random.randint(20, 60), 4]

def add_time(data):
    for i in range(len(data)):
        state = random.choice(states)
        time = 4
        if(state == "red" or state == "green"):
            time = random.randint(20, 60)

        data[i]["green_time"] = random.randint(20, 60)
        data[i]["red_time"] = random.randint(20, 60)
        data[i]["yellow_time"] = 4
        data[i]["current_state"] = {
            "state": state,
            "time": time
        }
    
    return data

app = Flask(__name__)
CORS(app)

@app.route('/api/traffic-signals')
def get_data():
    with open('../data.json') as f:
        data = add_time(json.load(f))
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)