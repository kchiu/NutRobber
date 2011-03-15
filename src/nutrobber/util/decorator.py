from functools import wraps
import traceback
import logging

def catch_except(err):
    def wrap(f):
        def wrapped_f(*args, **kwargs):
            try:
                return f(*args, **kwargs)
            except Exception:
                logging.error(traceback.format_exc())
                return err
        return wraps(f)(wrapped_f)
    return wrap