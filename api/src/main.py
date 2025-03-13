from flask import Flask, jsonify
from flask_cors import CORS
import json
import random

states = ["red", "green", "yellow"]
times = [random.randint(20, 60), random.randint(20, 60), 4]

        # state = random.choice(states)
        # time = 4
        # if(state == "red" or state == "green"):
        #     time = random.randint(20, 60)

        # data[i]["green_time"] = random.randint(20, 60)
        # data[i]["red_time"] = random.randint(20, 60)
        # data[i]["yellow_time"] = 4
        # data[i]["current_state"] = {
        #     "state": state,
        #     "time": time
        # }
    
    #     {
    #   "id": 26305117,
    #   "lat": 52.4188123,
    #   "lon": 10.8480973,
    #   "phases": [
    #     20, 2, 30, 1
    #   ],
    #   "sync-time": "2025-03-13T21:42:43.836146"
    # }
    
def add_time(data):
    for i in range(len(data)):
        data[i]["sync-time"] = "2025-03-13T21:49:43.836146"
        data[i]["phases"] = [
            20, 2, 30, 1
        ]
    return data

app = Flask(__name__)
CORS(app)

@app.route('/api/traffic-signals')
def get_data():
    with open('data.json') as f:
        data = add_time(json.load(f))
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)