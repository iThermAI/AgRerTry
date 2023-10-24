import os
from pymongo import MongoClient
from datetime import datetime

# MONGO_HOST = "mongodb"
MONGO_HOST = "localhost"  # for outside docker

MONGO_PORT = 27017
MONGO_USERNAME = os.environ.get("MONGO_USERNAME")
MONGO_PASSWORD = os.environ.get("MONGO_PASSWORD")
MONGO_AUTH_SOURCE = "admin"
client = MongoClient(
    host=MONGO_HOST,
    port=MONGO_PORT,
    username=MONGO_USERNAME,
    password=MONGO_PASSWORD,
    authSource=MONGO_AUTH_SOURCE,
)

# if client.server_info():
#     app.logger.debug("Connected to MongoDB.")
# else:
#     app.logger.debug("Failed to connect to MongoDB.")
db = client["KyKLos"]
experiments = db["Experiments"]


def stop_experiment():
    experiments.update_one({"Status": "Running"}, {"$set": {"Status": "Done"}})


def set_expermient_period(period):
    experiments.update_one(
        {"Status": "Running"}, {"$set": {"ExperimentPeriod": period}}
    )


table = None


def new_experiment(PartNumber):
    global table
    id = experiments.insert_one(
        {
            "PartNumber": PartNumber,
            "CreationDate": datetime.now(),
            "ExperimentPeriod": 0,
            "Status": "Running",
        }
    ).inserted_id
    table = db[str(id)]
    return id


def add_record(record):
    table.insert_one(record)


def get_all_images():
    return list(table.find({}, {"image_rgb": 1, "_id": 0}))


def last_sample():
    return table.find_one(sort=[("$natural", -1)])
