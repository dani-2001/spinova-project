"""
Custom DRF exception handler.

Without this, any *unhandled* exception (a bug, a stale DB schema, a
missing file, etc.) falls through to Django's default error handling,
which renders an HTML page (the DEBUG=True traceback page, or a bare
500 in production). The frontend (see src/api.js `handle()`) always
tries `await res.json()` on a failed response — an HTML body fails
that parse, so `body` ends up `null` and the UI shows a generic
"Request failed (500)" with zero information about what actually
went wrong.

This handler catches anything DRF's default handler doesn't already
turn into a clean response (DRF already handles things like
ValidationError, NotFound, etc. — those pass through unchanged) and
wraps it as JSON: `{"detail": "...", "error_type": "..."}`. With
DEBUG=True the real exception message is included, so the banner in
the UI tells you exactly what broke (e.g. "no such column:
api_study.model_version" -> stale DB schema, or a FileNotFoundError
-> model artifacts not deployed) instead of a dead end.
"""
import logging

from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def api_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None:
        # A "normal" DRF-recognized exception (ValidationError, 404, etc.)
        # — already a clean JSON response, leave it alone.
        return response

    view = context.get('view')
    logger.exception('Unhandled exception in %s', view.__class__.__name__ if view else context)

    if settings.DEBUG:
        detail = f'{exc.__class__.__name__}: {exc}'
    else:
        detail = 'Internal server error. Check the backend logs for details.'

    return Response(
        {'detail': detail, 'error_type': exc.__class__.__name__},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
