from google.appengine.ext import db

class CurrentPlayers(db.Model):
    id = db.UserProperty()
    lat = db.FloatProperty()
    lng = db.FloatProperty()
    checkin_time = db.DateTimeProperty(auto_now_add=True)
    