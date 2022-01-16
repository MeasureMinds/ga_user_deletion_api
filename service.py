import argparse
import sys
import datetime

import httplib2

from apiclient.discovery import build
from oauth2client import client
from oauth2client import file
from oauth2client import tools

from ratelimit import limits, sleep_and_retry

REQUESTS_PER_PERIOD = 13
REQUESTS_PERIOD = 10

def get_service(api_name, api_version, scope, client_secrets_path):
  """Get a service that communicates to a Google API.

  Args:
    api_name: string The name of the api to connect to.
    api_version: string The api version to connect to.
    scope: A list of strings representing the auth scopes to authorize for the
      connection.
    client_secrets_path: string A path to a valid client secrets file.

  Returns:
    A service that is connected to the specified API.
  """
  # Parse command-line arguments.
  parser = argparse.ArgumentParser(
      formatter_class=argparse.RawDescriptionHelpFormatter,
      parents=[tools.argparser])
  flags = parser.parse_args([])
  
  flags.noauth_local_webserver = True

  # Set up a Flow object to be used if we need to authenticate.
  flow = client.flow_from_clientsecrets(
      client_secrets_path, scope=scope,
      message=tools.message_if_missing(client_secrets_path))

  # Prepare credentials, and authorize HTTP object with them.
  # If the credentials don't exist or are invalid run through the native client
  # flow. The Storage object will ensure that if successful the good
  # credentials will get written back to a file.
  storage = file.Storage(api_name + '.dat')
  credentials = storage.get()
  if credentials is None or credentials.invalid:
    credentials = tools.run_flow(flow, storage, flags)
  http = credentials.authorize(http=httplib2.Http())

  # Build the service object.
  service = build(api_name, api_version, http=http)

  return service



@sleep_and_retry
@limits(calls=REQUESTS_PER_PERIOD, period=REQUESTS_PERIOD)
def delete_user(service, web_property_id, user_id):
  user_deletion_request_resource = service.userDeletion().userDeletionRequest()

  return user_deletion_request_resource.upsert(
  body = {
      "deletionRequestTime": str(datetime.datetime.now()),# This marks the point in time at which Google received the deletion request
      "kind": "analytics#userDeletionRequest",  # Value is "analytics#userDeletionRequest"
      "id": {  # User ID Object.
        "userId": user_id,  # The User's id
        "type": "CLIENT_ID",  # Type of user (APP_INSTANCE_ID,CLIENT_ID or USER_ID)
      },
      "webPropertyId": web_property_id  # Web property ID of the form UA-XXXXX-YY.
    }
).execute()