import datetime
from random import randint

from appengine_django import * # make django works on GAE
from google.appengine.api import users
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import HttpResponseServerError
from django.template import Context
from django.template import loader
from django.utils import simplejson

from nutrobber.models import CurrentPlayers
from nutrobber.util import decorator


@decorator.catch_except(HttpResponseServerError())
def index(request):
    user = users.get_current_user()
    signout = users.create_logout_url(request.build_absolute_uri())
    if user:
        t = loader.get_template('index.html')
        c = Context({'username':user.nickname(),
                     'signout':signout})
        return HttpResponse(t.render(c))
    else:
        return HttpResponseRedirect(users.create_login_url(request.build_absolute_uri()))


@decorator.catch_except(HttpResponseServerError())
def checkin(request):
    user = users.get_current_user()
    curlat = float(request.GET['lat'])
    curlng = float(request.GET['lng'])
    
    record = CurrentPlayers.all().filter('id', user).get()
    if record:
        record.lat = curlat
        record.lng = curlng
        record.checkin_time = datetime.datetime.now()
        record.put()
    else:
        CurrentPlayers(id=user, lat=curlat, lng=curlng).put()

    return HttpResponse(simplejson.dumps({'myid':user.user_id(), 'myname':user.nickname()}))


@decorator.catch_except(HttpResponseServerError())
def generate_victims(request):
    step_limit = float(request.GET['step_limit'])
    count = int(request.GET['count'])
    
    victim_list = [{'lat_step': randint(-step_limit, step_limit),
                    'lng_step': randint(-step_limit, step_limit)} for i in range(count)]
    
    return HttpResponse(simplejson.dumps(victim_list))

@decorator.catch_except(HttpResponseServerError())
def update_position(request):
    user = users.get_current_user()
    curlat = float(request.GET['lat'])
    curlng = float(request.GET['lng'])
    
    record = CurrentPlayers.all().filter('id', user).get()
    if record:
        record.lat = curlat
        record.lng = curlng
        record.checkin_time = datetime.datetime.now()
        record.put()
    else:
        raise 'user {0} is not in database'.format(user)

    return HttpResponse(simplejson.dumps(''))

@decorator.catch_except(HttpResponseServerError())
def refresh_map(request):
    players = [{'id':p.id.user_id(), 
                'name':p.id.nickname(), 
                'lat':p.lat, 
                'lng':p.lng} for p in CurrentPlayers.all()]

    return HttpResponse(simplejson.dumps({'players':players}))