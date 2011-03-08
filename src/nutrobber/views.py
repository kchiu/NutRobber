from google.appengine.api import users

from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import Context
from django.template import loader

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