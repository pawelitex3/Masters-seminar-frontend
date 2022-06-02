from flask import Flask, render_template, request, jsonify
import networkx as nx
import matplotlib.pyplot as plt
import shutil

app = Flask(__name__)

image_number = 1
number_of_vertices = 0
adjacency_list = []
weights = []

@app.route("/")
def main():
    return render_template('index.html')


@app.route("/vertices/<no_vertices>", methods=['POST'])
def previous(no_vertices):
    global number_of_vertices
    number_of_vertices = int(no_vertices)
    for _ in range(number_of_vertices):
        adjacency_list.append([])
        weights.append([])
    return 'success'


@app.route("/image/<change>", methods=['POST'])
def image(change):
    global image_number
    image_number += int(change)
    return str(image_number)


@app.route("/edges/", methods=['GET'])
def add_edge():
    print(request)
    beginning = int(request.args.get('beginning'))
    end = int(request.args.get('end'))
    weight = float(request.args.get('weight'))
    adjacency_list[beginning].append(end)
    adjacency_list[end].append(beginning)
    adjacency_list[beginning].append(weight)
    adjacency_list[end].append(weight)
    print(adjacency_list)
    return jsonify(adjacency_list)


@app.route("/draw/", methods=['GET'])
def draw_graph():
    edges = []
    for i in range(number_of_vertices):
        for j in range(len(adjacency_list[i])):
            edges.append((i, adjacency_list[i][j]))

    Graph = nx.Graph()
    Graph.add_nodes_from([i for i in range(number_of_vertices)])
    Graph.add_edges_from(edges)
    nx.draw(Graph, with_labels=True, node_size=800, font_color='#FFFFFF')
    plt.savefig("./static/images/img_1.png")
    plt.cla()
    return 'success'

@app.route("/reset", methods=['DELETE'])
def reset():
    global image_number, number_of_vertices, adjacency_list, weights
    image_number = 1
    number_of_vertices = 0
    adjacency_list = []
    weights = []

if __name__ == "__main__":
    app.run(port=5010)