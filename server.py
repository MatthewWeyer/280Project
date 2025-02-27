from flask import Flask, request
import flask
import threading
import json
from pickledb import PickleDB

db = PickleDB("blocks.db")
db_name = "blocks"
if (db.get(db_name)) is None:
    db.set(db_name,[[0,0,0]])

app = Flask(__name__, static_url_path='', static_folder='public')

@app.get("/Load")
def handle_load():
    return flask.jsonify(db.get(db_name))

@app.post("/Save")
def handle_save():
    newlist = list()
    post_data = flask.request.json
    for c in post_data["data"]:
        newlist.append(c)
    db.set(db_name, newlist)
    db.save()

    data = json.dumps("saved")
    return flask.Response(data, status=200, headers={
        "Content-Type": "text/javascript; charset=utf-8"
    })

app.run(host='0.0.0.0', port=5017)

