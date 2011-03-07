from google.appengine.api import users

from django.http import HttpResponse
from django.http import HttpResponseRedirect

def index(request):
    user = users.get_current_user()
    if user:
        return HttpResponse('Hello, ' + user.nickname())
    else:
        return HttpResponseRedirect(users.create_login_url(request.build_absolute_uri()))