import random
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

ACTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # Up, Down, Left, Right
ACTION_NAMES = ['UP', 'DOWN', 'LEFT', 'RIGHT']

def get_next_state(r, c, a_idx, n, obstacles, end):
    if (r, c) == end:
        return r, c
    dr, dc = ACTIONS[a_idx]
    nr, nc = r + dr, c + dc
    if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in obstacles:
        return nr, nc
    return r, c

def get_reward(s, a_idx, next_s, end):
    if s == end:
        return 0
    if next_s == end:
        return 10.0
    return -1.0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/evaluate_random', methods=['POST'])
def evaluate_random():
    data = request.json
    n = data['n']
    start = tuple(data['start'])
    end = tuple(data['end'])
    obstacles = set(tuple(obs) for obs in data['obstacles'])
    gamma = 0.9
    
    # 1. Generate random policy
    policy = {}
    for r in range(n):
        for c in range(n):
            if (r, c) == end or (r, c) in obstacles:
                continue
            policy[(r, c)] = random.randint(0, 3)
            
    # 2. Policy Evaluation
    V = { (r, c): 0.0 for r in range(n) for c in range(n) }
    
    while True:
        delta = 0
        new_V = V.copy()
        for r in range(n):
            for c in range(n):
                state = (r, c)
                if state == end or state in obstacles:
                    continue
                a = policy[state]
                next_s = get_next_state(r, c, a, n, obstacles, end)
                rwd = get_reward(state, a, next_s, end)
                v = rwd + gamma * V[next_s]
                delta = max(delta, abs(v - V[state]))
                new_V[state] = v
        V = new_V
        if delta < 1e-4:
            break
            
    # Format output
    resp_policy = {f"{r},{c}": ACTION_NAMES[policy[(r, c)]] for r, c in policy.keys()}
    resp_V = {f"{r},{c}": round(V[(r, c)], 2) for r in range(n) for c in range(n)}
    
    return jsonify({
        "policy": resp_policy,
        "values": resp_V
    })

@app.route('/api/value_iteration', methods=['POST'])
def value_iteration():
    data = request.json
    n = data['n']
    start = tuple(data['start'])
    end = tuple(data['end'])
    obstacles = set(tuple(obs) for obs in data['obstacles'])
    gamma = 0.9
    
    V = { (r, c): 0.0 for r in range(n) for c in range(n) }
    
    # Value Iteration
    while True:
        delta = 0
        new_V = V.copy()
        for r in range(n):
            for c in range(n):
                state = (r, c)
                if state == end or state in obstacles:
                    continue
                max_v = float('-inf')
                for a in range(4):
                    next_s = get_next_state(r, c, a, n, obstacles, end)
                    rwd = get_reward(state, a, next_s, end)
                    v = rwd + gamma * V[next_s]
                    if v > max_v:
                        max_v = v
                delta = max(delta, abs(max_v - V[state]))
                new_V[state] = max_v
        V = new_V
        if delta < 1e-4:
            break
            
    # Extract optimal policy
    policy = {}
    for r in range(n):
        for c in range(n):
            state = (r, c)
            if state == end or state in obstacles:
                continue
            best_a = 0
            max_v = float('-inf')
            for a in range(4):
                next_s = get_next_state(r, c, a, n, obstacles, end)
                rwd = get_reward(state, a, next_s, end)
                v = rwd + gamma * V[next_s]
                if v > max_v:
                    max_v = v
                    best_a = a
            policy[state] = best_a
            
    # Build optimal path (for visualization)
    path = []
    curr = start
    visited = set()
    while curr != end and curr not in visited:
        visited.add(curr)
        path.append(list(curr))
        if curr in policy:
            curr = get_next_state(curr[0], curr[1], policy[curr], n, obstacles, end)
        else:
            break
    path.append(list(end))

    resp_policy = {f"{r},{c}": ACTION_NAMES[policy[(r, c)]] for r, c in policy.keys()}
    resp_V = {f"{r},{c}": round(V[(r, c)], 2) for r in range(n) for c in range(n)}
    
    return jsonify({
        "policy": resp_policy,
        "values": resp_V,
        "path": path
    })

if __name__ == '__main__':
    app.run(debug=True, port=8080)
